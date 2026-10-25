'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const { createPostgresRateLimitStore } = require('../auth/PostgresRateLimitStore');

const connectionString = process.env.DATABASE_URL;
const TEST_HMAC_SECRET = 'test-secret-for-auth-rate-limit-hmac';
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

test('PostgreSQL rate-limit store shares atomic counters across instances', { skip: !isDisposableTestDatabase(connectionString) }, async t => {
    if (!isDisposableTestDatabase(connectionString)) {
        throw new Error('Refusing rate-limit integration tests: DATABASE_URL must target local chattbm_test.');
    }

    pool = new Pool({ connectionString });
    t.after(async () => {
        if (pool) await pool.end();
    });

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_auth_rate_limits.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSql);
    // Reapplying the migration must be safe and idempotent.
    await pool.query(migrationSql);

    const schema = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'chattbm_auth_rate_limits'
    `);
    const columns = new Set(schema.rows.map(row => row.column_name));
    for (const column of ['bucket_key', 'window_started_at', 'request_count', 'expires_at', 'updated_at']) {
        assert.ok(columns.has(column), `missing migration column: ${column}`);
    }

    const index = await pool.query(`
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'chattbm_auth_rate_limits'
          AND indexname = 'chattbm_auth_rate_limits_expires_at_idx'
    `);
    assert.equal(index.rowCount, 1, 'expiry index should exist after migration');

    const key = 'test:login:integration-client';
    const otherKey = 'test:login:other-client';
    const expiredKey = crypto.createHmac('sha256', TEST_HMAC_SECRET).update('test:expired-bucket', 'utf8').digest('hex');
    const testKeys = [key, otherKey, 'test:expired-bucket']
        .map(value => crypto.createHmac('sha256', TEST_HMAC_SECRET).update(value, 'utf8').digest('hex'));
    await pool.query('DELETE FROM chattbm_auth_rate_limits WHERE bucket_key = ANY($1::text[])', [testKeys]);

    const first = createPostgresRateLimitStore({ hmacSecret: TEST_HMAC_SECRET, query: (...args) => pool.query(...args) });
    const second = createPostgresRateLimitStore({ hmacSecret: TEST_HMAC_SECRET, query: (...args) => pool.query(...args) });

    const results = await Promise.all(
        Array.from({ length: 40 }, (_, i) => (i % 2 ? first : second).consume(key, 60000))
    );
    assert.equal(results.length, 40);
    assert.deepEqual(results.map(item => item.count).sort((a, b) => a - b),
        Array.from({ length: 40 }, (_, i) => i + 1));

    const anotherClient = await second.consume(otherKey, 60000);
    assert.equal(anotherClient.count, 1);

    await pool.query(
        `INSERT INTO chattbm_auth_rate_limits
            (bucket_key, window_started_at, request_count, expires_at, updated_at)
         VALUES ($1, NOW() - INTERVAL '2 minutes', 1, NOW() - INTERVAL '1 minute', NOW())`,
        [expiredKey]
    );
    const cleaned = await second.cleanupExpired({ batchSize: 10 });
    assert.equal(cleaned, 1, 'cleanup should remove the expired test bucket');
    const expiredRow = await pool.query(
        'SELECT 1 FROM chattbm_auth_rate_limits WHERE bucket_key = $1',
        [expiredKey]
    );
    assert.equal(expiredRow.rowCount, 0);

    await pool.query('DELETE FROM chattbm_auth_rate_limits WHERE bucket_key = ANY($1::text[])', [testKeys]);
});
