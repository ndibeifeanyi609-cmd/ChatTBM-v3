'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const { createPostgresRateLimitStore } = require('../auth/PostgresRateLimitStore');

const connectionString = process.env.DATABASE_URL;
let pool;

function isDisposableTestDatabase(value) {
    if (!value) return false;
    try {
        const url = new URL(value);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
            && decodeURIComponent(url.pathname.slice(1)) === 'chattbm_test';
    } catch (_) {
        return false;
    }
}

test('PostgreSQL rate-limit store shares atomic counters across instances', async t => {
    if (!isDisposableTestDatabase(connectionString)) {
        throw new Error('Refusing rate-limit integration tests: DATABASE_URL must target local chattbm_test.');
    }

    pool = new Pool({ connectionString });
    t.after(async () => {
        if (pool) await pool.end();
    });

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_auth_rate_limits.sql');
    await pool.query(fs.readFileSync(migrationPath, 'utf8'));
    await pool.query('DELETE FROM chattbm_auth_rate_limits');

    const first = createPostgresRateLimitStore({ query: (...args) => pool.query(...args) });
    const second = createPostgresRateLimitStore({ query: (...args) => pool.query(...args) });
    const key = 'test:login:integration-client';

    const results = await Promise.all(
        Array.from({ length: 40 }, (_, i) => (i % 2 ? first : second).consume(key, 60000))
    );
    assert.equal(results.length, 40);
    assert.deepEqual(results.map(item => item.count).sort((a, b) => a - b),
        Array.from({ length: 40 }, (_, i) => i + 1));

    const anotherClient = await second.consume('test:login:other-client', 60000);
    assert.equal(anotherClient.count, 1);

    await pool.query('DELETE FROM chattbm_auth_rate_limits WHERE bucket_key LIKE $1', ['test:%']);
});
