'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    parseArgs, validateMigrationFilename, runSelectedMigration, checksumOf
} = require('../scripts/db-migrate');

const TARGET = 'chattbm_staging_isolated';
const RATE = '005_auth_rate_limits.sql';
const VERIFY = '006_email_verification_tokens.sql';
const confirm = file => `APPLY:${TARGET}:${file}`;
const rateSql = 'CREATE TABLE chattbm_auth_rate_limits (bucket_key TEXT PRIMARY KEY);';
const verifySql = 'CREATE TABLE chattbm_email_verification_tokens (id TEXT PRIMARY KEY);';

function fakeClient(databaseName = TARGET, schema = {}) {
    const calls = [];
    const history = new Map();
    const state = {
        users_table_exists: true,
        rate_limits_table_exists: false,
        verification_tokens_table_exists: false,
        migration_ledger_exists: false,
        email_verified_at_data_type: null,
        email_verified_at_is_nullable: null,
        ...schema
    };
    return {
        calls, history, state,
        async query(sql, params = []) {
            calls.push({ sql, params });
            if (sql.includes('current_database()')) return { rows: [{ database_name: databaseName }] };
            if (sql.includes('to_regclass')) return { rows: [{ ...state }] };
            if (sql.includes('SELECT checksum FROM chattbm_schema_migrations')) {
                const checksum = history.get(params[0]);
                return checksum ? { rowCount: 1, rows: [{ checksum }] } : { rowCount: 0, rows: [] };
            }
            if (sql.includes('CREATE TABLE chattbm_schema_migrations')) {
                state.migration_ledger_exists = true;
                return { rowCount: 0, rows: [] };
            }
            if (sql.includes('INSERT INTO chattbm_schema_migrations')) {
                history.set(params[0], params[1]);
                return { rowCount: 1, rows: [] };
            }
            if (sql === rateSql) state.rate_limits_table_exists = true;
            if (sql === verifySql) state.verification_tokens_table_exists = true;
            return { rowCount: 0, rows: [] };
        }
    };
}

test('CLI requires exact file, target and confirmation', () => {
    assert.throws(() => parseArgs([]), /Usage:/);
    assert.deepEqual(parseArgs(['--file', RATE, '--target', TARGET, '--confirm', confirm(RATE)]),
        { file: RATE, target: TARGET, confirm: confirm(RATE) });
});

test('only migrations 005 and 006 are allowlisted', () => {
    assert.equal(validateMigrationFilename(RATE), RATE);
    assert.equal(validateMigrationFilename(VERIFY), VERIFY);
    for (const name of ['../secret.sql', '001_auth_accounts_sessions.sql', 'latest.sql']) {
        assert.throws(() => validateMigrationFilename(name));
    }
});

test('rejects a non-isolated database before querying', async () => {
    const client = fakeClient('chattbm_db');
    await assert.rejects(runSelectedMigration({
        client, migrationFile: RATE, expectedDatabase: 'chattbm_db',
        confirmation: confirm(RATE), sql: rateSql
    }), /restricted to chattbm_staging_isolated/);
    assert.equal(client.calls.length, 0);
});

test('rejects a connected database identity mismatch', async () => {
    const client = fakeClient('wrong_db');
    await assert.rejects(runSelectedMigration({
        client, migrationFile: RATE, expectedDatabase: TARGET,
        confirmation: confirm(RATE), sql: rateSql
    }), /expected "chattbm_staging_isolated"/);
});

test('rejects wrong confirmation', async () => {
    const client = fakeClient();
    await assert.rejects(runSelectedMigration({
        client, migrationFile: RATE, expectedDatabase: TARGET,
        confirmation: 'APPLY:wrong', sql: rateSql
    }), /confirmation does not match/);
    assert.equal(client.calls.length, 0);
});

test('005 creates and records rate-limit table transactionally', async () => {
    const client = fakeClient();
    const result = await runSelectedMigration({
        client, migrationFile: RATE, expectedDatabase: TARGET,
        confirmation: confirm(RATE), sql: rateSql
    });
    assert.equal(result.status, 'applied');
    assert.equal(client.state.rate_limits_table_exists, true);
    assert.equal(client.history.get(RATE), checksumOf(rateSql));
    assert.ok(client.calls.some(c => c.sql === 'COMMIT'));
});

test('006 is refused until 005 has been recorded', async () => {
    const client = fakeClient();
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /migration 005 must be recorded/);
    assert.equal(client.calls.some(c => c.sql === 'BEGIN'), false);
});

test('006 is refused if 005 ledger record exists but table is absent', async () => {
    const client = fakeClient(TARGET, { migration_ledger_exists: true });
    client.history.set(RATE, checksumOf(rateSql));
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /rate-limit table is missing/);
});

test('006 is refused if 005 checksum differs from repository SQL', async () => {
    const client = fakeClient(TARGET, { migration_ledger_exists: true, rate_limits_table_exists: true });
    client.history.set(RATE, 'bad-checksum');
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /005 checksum does not match/);
});

test('006 is applied only after 005 is recorded and schema is present', async () => {
    const client = fakeClient(TARGET, {
        migration_ledger_exists: true,
        rate_limits_table_exists: true
    });
    client.history.set(RATE, checksumOf(rateSql));
    const result = await runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    });
    assert.equal(result.status, 'applied');
    assert.equal(client.state.verification_tokens_table_exists, true);
    assert.equal(client.history.get(VERIFY), checksumOf(verifySql));
});

test('006 refuses a missing users table', async () => {
    const client = fakeClient(TARGET, { users_table_exists: false, migration_ledger_exists: true, rate_limits_table_exists: true });
    client.history.set(RATE, checksumOf(rateSql));
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /chattbm_users table is missing/);
});

test('006 refuses an existing token table without its ledger record', async () => {
    const client = fakeClient(TARGET, {
        migration_ledger_exists: true, rate_limits_table_exists: true,
        verification_tokens_table_exists: true
    });
    client.history.set(RATE, checksumOf(rateSql));
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /exists without a matching migration record/);
});

test('006 rejects a non-nullable or wrong-type verification timestamp', async () => {
    for (const schema of [
        { email_verified_at_data_type: 'timestamp without time zone', email_verified_at_is_nullable: 'YES' },
        { email_verified_at_data_type: 'timestamp with time zone', email_verified_at_is_nullable: 'NO' }
    ]) {
        const client = fakeClient(TARGET, { migration_ledger_exists: true, rate_limits_table_exists: true, ...schema });
        client.history.set(RATE, checksumOf(rateSql));
        await assert.rejects(runSelectedMigration({
            client, migrationFile: VERIFY, expectedDatabase: TARGET,
            confirmation: confirm(VERIFY), sql: verifySql
        }), /nullable TIMESTAMPTZ/);
    }
});

test('recognizes an already-applied migration only when checksum and expected table match', async () => {
    const client = fakeClient(TARGET, { migration_ledger_exists: true, rate_limits_table_exists: true });
    client.history.set(RATE, checksumOf(rateSql));
    client.history.set(VERIFY, checksumOf(verifySql));
    client.state.verification_tokens_table_exists = true;
    const result = await runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    });
    assert.equal(result.status, 'already-applied');
});

test('refuses checksum mismatch for a previously applied migration', async () => {
    const client = fakeClient(TARGET, { migration_ledger_exists: true, rate_limits_table_exists: true });
    client.history.set(RATE, checksumOf(rateSql));
    client.history.set(VERIFY, 'different');
    client.state.verification_tokens_table_exists = true;
    await assert.rejects(runSelectedMigration({
        client, migrationFile: VERIFY, expectedDatabase: TARGET,
        confirmation: confirm(VERIFY), sql: verifySql
    }), /checksum mismatch/);
});
