'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { createPostgresRateLimitStore } = require('../auth/PostgresRateLimitStore');

const migration = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'migrations', '005_auth_rate_limits.sql'),
    'utf8'
);
const HMAC_SECRET = 'integration-test-secret-for-rate-limit-at-least-32-bytes';

test('shared rate-limit store integrates with isolated PostgreSQL', async (t) => {
    assert.equal(process.env.NODE_ENV, 'test', 'must run in test mode');
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL must point to an isolated test database');

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    t.after(async () => { await pool.end(); });

    // The CI workflow provisions a disposable PostgreSQL service database.
    await pool.query(migration);
    await pool.query(migration); // Migration should be safely repeatable.

    const suffix = crypto.randomUUID();
    const key = 'integration:' + suffix;
    const bucketKey = crypto.createHmac('sha256', HMAC_SECRET).update(key, 'utf8').digest('hex');
    const storeA = createPostgresRateLimitStore({ hmacSecret: HMAC_SECRET, query: (...args) => pool.query(...args) });
    const storeB = createPostgresRateLimitStore({ hmacSecret: HMAC_SECRET, query: (...args) => pool.query(...args) });

    await t.test('two store instances share the same atomic counter', async () => {
        const first = await storeA.consume(key, 60000);
        const second = await storeB.consume(key, 60000);
        assert.equal(first.count, 1);
        assert.equal(second.count, 2);
        assert.ok(second.expiresAt >= second.startedAt);
    });

    await t.test('expired buckets reset their counter', async () => {
        await pool.query(
            "UPDATE chattbm_auth_rate_limits SET expires_at = NOW() - INTERVAL '1 second' WHERE bucket_key = $1",
            [bucketKey]
        );
        const reset = await storeB.consume(key, 60000);
        assert.equal(reset.count, 1);
    });

    await t.test('bounded cleanup removes expired rows', async () => {
        const expiredKey = crypto.createHmac('sha256', HMAC_SECRET).update('cleanup:' + suffix, 'utf8').digest('hex');
        await pool.query(
            "INSERT INTO chattbm_auth_rate_limits (bucket_key, window_started_at, request_count, expires_at, updated_at) VALUES ($1, NOW() - INTERVAL '2 minutes', 1, NOW() - INTERVAL '1 second', NOW())",
            [expiredKey]
        );
        const removed = await storeA.cleanupExpired({ batchSize: 100 });
        assert.ok(removed >= 1);
        const remaining = await pool.query('SELECT 1 FROM chattbm_auth_rate_limits WHERE bucket_key = $1', [expiredKey]);
        assert.equal(remaining.rowCount, 0);
    });
});
