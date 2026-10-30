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

function fakeClient(databaseName = TARGET) {
    const calls = [];
    const history = new Map();
    return {
        calls,
        history,
        async query(sql, params = []) {
            calls.push({ sql, params });
            if (sql.includes('current_database()')) {
                return { rows: [{ database_name: databaseName }] };
            }
            if (sql.includes('SELECT checksum FROM chattbm_schema_migrations')) {
                const checksum = history.get(params[0]);
                return checksum
                    ? { rowCount: 1, rows: [{ checksum }] }
                    : { rowCount: 0, rows: [] };
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
    ]), {
        file: FILE,
        target: TARGET,
        confirm: CONFIRM
    });
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
        client,
        migrationFile: FILE,
        expectedDatabase: 'chattbm_db',
        confirmation: `APPLY:chattbm_db:${FILE}`,
        sql: 'SELECT 1'
    }), /restricted to chattbm_staging_isolated/);
    assert.equal(client.calls.length, 0);
});

test('migration refuses a database identity mismatch', async () => {
    const client = fakeClient('unexpected_db');
    await assert.rejects(runSelectedMigration({
        client,
        migrationFile: FILE,
        expectedDatabase: TARGET,
        confirmation: CONFIRM,
        sql: 'SELECT 1'
    }), /expected "chattbm_staging_isolated"/);
    assert.equal(client.calls.length, 1);
});

test('migration applies transactionally and records its checksum', async () => {
    const client = fakeClient();
    const sql = 'SELECT 1;';
    const result = await runSelectedMigration({
        client,
        migrationFile: FILE,
        expectedDatabase: TARGET,
        confirmation: CONFIRM,
        sql
    });
    assert.equal(result.status, 'applied');
    assert.ok(client.calls.some(call => call.sql === 'BEGIN'));
    assert.ok(client.calls.some(call => call.sql === 'COMMIT'));
    assert.equal(client.history.size, 1);
});

test('migration refuses changed SQL after it has been recorded', async () => {
    const client = fakeClient();
    const options = {
        client,
        migrationFile: FILE,
        expectedDatabase: TARGET,
        confirmation: CONFIRM,
        sql: 'SELECT 1;'
    };
    await runSelectedMigration(options);
    await assert.rejects(
        runSelectedMigration({ ...options, sql: 'SELECT 2;' }),
        /checksum mismatch/
    );
});
