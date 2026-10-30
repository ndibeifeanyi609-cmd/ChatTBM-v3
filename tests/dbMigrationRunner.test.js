'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    parseArgs,
    validateMigrationFilename,
    runSelectedMigration
} = require('../scripts/db-migrate');

const TARGET = 'chattbm_staging_isolated';
const FILE = '006_email_verification_tokens.sql';
const CONFIRM = `APPLY:${TARGET}:${FILE}`;

function fakeClient(databaseName = TARGET, schema = {}) {
    const calls = [];
    const history = new Map();
    const state = {
        users_table_exists: true,
        email_verified_at_exists: false,
        verification_tokens_table_exists: false,
        migration_ledger_exists: false,
        ...schema
    };
    return {
        calls,
        history,
        state,
        async query(sql, params = []) {
            calls.push({ sql, params });
            if (sql.includes('current_database()')) {
                return { rows: [{ database_name: databaseName }] };
            }
            if (sql.includes('to_regclass') && sql.includes('email_verified_at')) {
                return { rows: [{ ...state }] };
            }
            if (sql.includes('SELECT checksum FROM chattbm_schema_migrations')) {
                const checksum = history.get(params[0]);
                return checksum
                    ? { rowCount: 1, rows: [{ checksum }] }
                    : { rowCount: 0, rows: [] };
            }
            if (sql.includes('CREATE TABLE chattbm_schema_migrations')) {
                state.migration_ledger_exists = true;
                return { rowCount: 0, rows: [] };
            }
            if (sql.includes('INSERT INTO chattbm_schema_migrations')) {
                history.set(params[0], params[1]);
                return { rowCount: 1, rows: [] };
            }
            return { rowCount: 0, rows: [] };
        }
    };
}

test('migration CLI requires file, target and exact confirmation', () => {
    assert.throws(() => parseArgs([]), /Usage:/);
    assert.deepEqual(parseArgs([
        '--file', FILE,
        '--target', TARGET,
        '--confirm', CONFIRM
    ]), { file: FILE, target: TARGET, confirm: CONFIRM });
});

test('migration filename validation permits only the approved migration', () => {
    assert.equal(validateMigrationFilename(FILE), FILE);
    assert.throws(() => validateMigrationFilename('../secret.sql'));
    assert.throws(() => validateMigrationFilename('005_auth_rate_limits.sql'));
    assert.throws(() => validateMigrationFilename('latest.sql'));
});

test('migration refuses every database target except isolated staging', async () => {
    const client = fakeClient('chattbm_db');
    await assert.rejects(runSelectedMigration({
        client, migrationFile: FILE, expectedDatabase: 'chattbm_db',
        confirmation: `APPLY:chattbm_db:${FILE}`, sql: 'SELECT 1'
    }), /restricted to chattbm_staging_isolated/);
    assert.equal(client.calls.length, 0);
});

test('migration refuses a database identity mismatch', async () => {
    const client = fakeClient('unexpected_db');
    await assert.rejects(runSelectedMigration({
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1'
    }), /expected "chattbm_staging_isolated"/);
    assert.equal(client.calls.length, 1);
});

test('migration refuses to proceed when the required users table is absent', async () => {
    const client = fakeClient(TARGET, { users_table_exists: false });
    await assert.rejects(runSelectedMigration({
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1'
    }), /required chattbm_users table is missing/);
    assert.equal(client.calls.some(call => call.sql === 'BEGIN'), false);
    assert.equal(client.calls.some(call => call.sql.includes('CREATE TABLE chattbm_schema_migrations')), false);
});

test('migration refuses pre-existing email-verification schema without a ledger', async () => {
    const client = fakeClient(TARGET, { email_verified_at_exists: true });
    await assert.rejects(runSelectedMigration({
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1'
    }), /schema exists without a matching migration record/);
    assert.equal(client.calls.some(call => call.sql === 'BEGIN'), false);
    assert.equal(client.calls.some(call => call.sql.includes('CREATE TABLE chattbm_schema_migrations')), false);
});

test('migration applies transactionally and creates its ledger only after preflight', async () => {
    const client = fakeClient();
    const result = await runSelectedMigration({
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1;'
    });
    assert.equal(result.status, 'applied');
    const preflightIndex = client.calls.findIndex(call => call.sql.includes('to_regclass'));
    const beginIndex = client.calls.findIndex(call => call.sql === 'BEGIN');
    const ledgerIndex = client.calls.findIndex(call => call.sql.includes('CREATE TABLE chattbm_schema_migrations'));
    assert.ok(preflightIndex >= 0 && preflightIndex < beginIndex);
    assert.ok(beginIndex < ledgerIndex);
    assert.ok(client.calls.some(call => call.sql === 'COMMIT'));
    assert.equal(client.history.size, 1);
});

test('migration refuses changed SQL after it has been recorded', async () => {
    const client = fakeClient();
    const options = {
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1;'
    };
    await runSelectedMigration(options);
    await assert.rejects(
        runSelectedMigration({ ...options, sql: 'SELECT 2;' }),
        /checksum mismatch/
    );
});

test('migration recognizes an existing matching ledger record', async () => {
    const client = fakeClient();
    const options = {
        client, migrationFile: FILE, expectedDatabase: TARGET,
        confirmation: CONFIRM, sql: 'SELECT 1;'
    };
    const first = await runSelectedMigration(options);
    const second = await runSelectedMigration(options);
    assert.equal(first.status, 'applied');
    assert.equal(second.status, 'already-applied');
    assert.equal(client.calls.filter(call => call.sql === 'BEGIN').length, 1);
});
