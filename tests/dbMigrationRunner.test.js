'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    parseArgs,
    validateMigrationFilename,
    runSelectedMigration
} = require('../scripts/db-migrate');

function fakeClient(databaseName = 'isolated_test_db') {
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
                return checksum ? { rowCount: 1, rows: [{ checksum }] } : { rowCount: 0, rows: [] };
            }
            if (sql.includes('INSERT INTO chattbm_schema_migrations')) {
                history.set(params[0], params[1]);
                return { rowCount: 1, rows: [] };
            }
            return { rowCount: 0, rows: [] };
        }
    };
}

test('migration CLI requires file, target and explicit confirmation', () => {
    assert.throws(() => parseArgs([]), /Usage:/);
    assert.deepEqual(parseArgs([
        '--file', '006_email_verification_tokens.sql',
        '--target', 'isolated_test_db',
        '--confirm', 'APPLY:isolated_test_db:006_email_verification_tokens.sql'
    ]), {
        file: '006_email_verification_tokens.sql',
        target: 'isolated_test_db',
        confirm: 'APPLY:isolated_test_db:006_email_verification_tokens.sql'
    });
});

test('migration filename validation rejects traversal and non-SQL files', () => {
    assert.equal(validateMigrationFilename('006_email_verification_tokens.sql'), '006_email_verification_tokens.sql');
    assert.throws(() => validateMigrationFilename('../secret.sql'));
    assert.throws(() => validateMigrationFilename('latest.sql'));
});

test('migration refuses protected database targets before schema changes', async () => {
    const client = fakeClient('chattbm_db');
    await assert.rejects(runSelectedMigration({
        client,
        migrationFile: '006_email_verification_tokens.sql',
        expectedDatabase: 'chattbm_db',
        confirmation: 'APPLY:chattbm_db:006_email_verification_tokens.sql',
        sql: 'SELECT 1'
    }), /protected/);
    assert.equal(client.calls.length, 0);
});

test('migration refuses a database identity mismatch', async () => {
    const client = fakeClient('unexpected_db');
    await assert.rejects(runSelectedMigration({
        client,
        migrationFile: '006_email_verification_tokens.sql',
        expectedDatabase: 'isolated_test_db',
        confirmation: 'APPLY:isolated_test_db:006_email_verification_tokens.sql',
        sql: 'SELECT 1'
    }), /expected "isolated_test_db"/);
    assert.equal(client.calls.length, 1);
});

test('migration applies transactionally and records its checksum', async () => {
    const client = fakeClient();
    const sql = 'SELECT 1;';
    const result = await runSelectedMigration({
        client,
        migrationFile: '006_email_verification_tokens.sql',
        expectedDatabase: 'isolated_test_db',
        confirmation: 'APPLY:isolated_test_db:006_email_verification_tokens.sql',
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
        migrationFile: '006_email_verification_tokens.sql',
        expectedDatabase: 'isolated_test_db',
        confirmation: 'APPLY:isolated_test_db:006_email_verification_tokens.sql',
        sql: 'SELECT 1;'
    };
    await runSelectedMigration(options);
    await assert.rejects(runSelectedMigration({ ...options, sql: 'SELECT 2;' }), /checksum mismatch/);
});
