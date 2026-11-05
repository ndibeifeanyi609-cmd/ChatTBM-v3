'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const express = require('express');
const http = require('node:http');

const originalLoad = Module._load;
const fakePgState = { connectCalls: 0, queries: [] };

class FakeClient {
    async connect() {
        fakePgState.connectCalls += 1;
    }

    async query(sql) {
        fakePgState.queries.push(String(sql).trim());
        if (/SELECT current_database\(\)/i.test(sql)) {
            return { rows: [{ database_name: 'chattbm_staging_isolated' }] };
        }
        if (/FROM information_schema\.tables/i.test(sql)) {\n            return { rows: [{ table_name: 'chattbm_users' }] };\n        }\n        if (/SELECT COUNT\(\*\)/i.test(sql)) {
            return { rows: [{ row_count: '0' }] };
        }
        return { rows: [] };
    }

    async end() {}
}

Module._load = function(request, parent, isMain) {
    if (request === 'pg') return { Client: FakeClient };
    return originalLoad.call(this, request, parent, isMain);
};

const router = require('../routes/internalStagingDbCheckRoute');
Module._load = originalLoad;

async function requestWithToken(token) {
    const app = express();
    app.use('/api/internal', router);
    const server = http.createServer(app);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    try {
        const headers = {};
        if (token !== undefined) headers['x-staging-check-token'] = token;
        const response = await fetch(
            `http://127.0.0.1:${server.address().port}/api/internal/staging-db-check`,
            { headers }
        );
        return { status: response.status, body: await response.json() };
    } finally {
        await new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
}

test('staging diagnostic distinguishes missing and incorrect tokens without exposing secrets', async () => {
    const originalToken = process.env.STAGING_READONLY_CHECK_TOKEN;
    const originalDatabaseUrl = process.env.STAGING_READONLY_DATABASE_URL;
    const configuredToken = 'unit-test-configured-secret';
    const incorrectToken = 'unit-test-wrong-secret';

    fakePgState.connectCalls = 0;
    fakePgState.queries = [];
    process.env.STAGING_READONLY_DATABASE_URL =
        'postgres://test:test@dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com:5432/chattbm_staging_isolated';

    try {
        delete process.env.STAGING_READONLY_CHECK_TOKEN;
        const missing = await requestWithToken(configuredToken);
        assert.equal(missing.status, 503);
        assert.equal(missing.body.error, 'check_not_configured');
        assert.equal(JSON.stringify(missing.body).includes(configuredToken), false);
        assert.equal(fakePgState.connectCalls, 0);

        process.env.STAGING_READONLY_CHECK_TOKEN = configuredToken;
        const mismatch = await requestWithToken(incorrectToken);
        assert.equal(mismatch.status, 404);
        assert.deepEqual(mismatch.body, { success: false });
        assert.equal(JSON.stringify(mismatch.body).includes(configuredToken), false);
        assert.equal(JSON.stringify(mismatch.body).includes(incorrectToken), false);
        assert.equal(fakePgState.connectCalls, 0);

        const valid = await requestWithToken(configuredToken);
        assert.equal(valid.status, 200);
        assert.equal(valid.body.success, true);
        assert.equal(valid.body.readOnly, true);
        assert.equal(valid.body.database, 'chattbm_staging_isolated');
        assert.deepEqual(valid.body.schema.expectedMigrationTables, [
            'chattbm_users',
            'chattbm_auth_sessions',
            'chattbm_oauth_identities',
            'chattbm_google_oauth_states',
            'chattbm_password_reset_tokens',
            'chattbm_auth_rate_limits'
        ]);
        assert.deepEqual(valid.body.schema.tables, ['chattbm_users']);
        assert.deepEqual(valid.body.schema.missingExpectedTables, [
            'chattbm_auth_sessions',
            'chattbm_oauth_identities',
            'chattbm_google_oauth_states',
            'chattbm_password_reset_tokens',
            'chattbm_auth_rate_limits'
        ]);
        assert.equal(fakePgState.connectCalls, 1);
        assert.ok(fakePgState.queries.includes('BEGIN READ ONLY'));
        assert.ok(fakePgState.queries.includes('COMMIT'));
    } finally {
        if (originalToken === undefined) delete process.env.STAGING_READONLY_CHECK_TOKEN;
        else process.env.STAGING_READONLY_CHECK_TOKEN = originalToken;
        if (originalDatabaseUrl === undefined) delete process.env.STAGING_READONLY_DATABASE_URL;
        else process.env.STAGING_READONLY_DATABASE_URL = originalDatabaseUrl;
    }
});
