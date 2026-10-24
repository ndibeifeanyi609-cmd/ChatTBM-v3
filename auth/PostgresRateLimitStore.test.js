'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createPostgresRateLimitStore, UPSERT_BUCKET_SQL, CLEANUP_EXPIRED_SQL } = require('./PostgresRateLimitStore');
const TEST_HMAC_SECRET = 'test-secret-for-auth-rate-limit-hmac';

test('uses HMAC-keyed identifiers, one atomic upsert, and normalized bucket fields', async () => {
    let captured;
    const store = createPostgresRateLimitStore({
        hmacSecret: TEST_HMAC_SECRET,
        query: async (sql, values) => {
            captured = { sql, values };
            return { rows: [{ request_count: '3', window_started_at: '2026-01-01T00:00:00.000Z', expires_at: '2026-01-01T00:01:00.000Z' }] };
        }
    });

    const result = await store.consume('login:ip-hash', 60000);
    assert.equal(captured.sql, UPSERT_BUCKET_SQL);
    assert.deepEqual(captured.values, [crypto.createHmac('sha256', TEST_HMAC_SECRET).update('login:ip-hash').digest('hex'), 60000]);
    assert.notEqual(captured.values[0], 'login:ip-hash');
    assert.notEqual(captured.values[0], crypto.createHash('sha256').update('login:ip-hash').digest('hex'));
    assert.match(captured.sql, /ON CONFLICT \(bucket_key\) DO UPDATE/);
    assert.equal(result.count, 3);
    assert.equal(result.startedAt, Date.parse('2026-01-01T00:00:00.000Z'));
    assert.equal(result.expiresAt, Date.parse('2026-01-01T00:01:00.000Z'));
});

test('rejects invalid keys and windows before querying storage', async () => {
    let calls = 0;
    const store = createPostgresRateLimitStore({ hmacSecret: TEST_HMAC_SECRET, query: async () => { calls++; return { rows: [] }; } });
    await assert.rejects(store.consume('', 1000), TypeError);
    await assert.rejects(store.consume('x', 0), TypeError);
    await assert.rejects(store.consume('x'.repeat(513), 1000), TypeError);
    assert.equal(calls, 0);
});

test('fails if storage returns no bucket instead of allowing the request implicitly', async () => {
    const store = createPostgresRateLimitStore({ hmacSecret: TEST_HMAC_SECRET, query: async () => ({ rows: [] }) });
    await assert.rejects(store.consume('login:ip-hash', 1000), /returned no bucket/);
});

test('expired cleanup is bounded and uses row locks safe for concurrent cleaners', async () => {
    let captured;
    const store = createPostgresRateLimitStore({
        hmacSecret: TEST_HMAC_SECRET,
        query: async (sql, values) => {
            captured = { sql, values };
            return { rows: [{ bucket_key: 'a' }, { bucket_key: 'b' }] };
        }
    });
    assert.equal(await store.cleanupExpired({ batchSize: 2 }), 2);
    assert.equal(captured.sql, CLEANUP_EXPIRED_SQL);
    assert.deepEqual(captured.values, [2]);
    assert.match(captured.sql, /LIMIT \$1/);
    assert.match(captured.sql, /FOR UPDATE SKIP LOCKED/);
});

test('expired cleanup rejects unsafe batch sizes without querying storage', async () => {
    let calls = 0;
    const store = createPostgresRateLimitStore({ hmacSecret: TEST_HMAC_SECRET, query: async () => { calls++; return { rows: [] }; } });
    await assert.rejects(store.cleanupExpired({ batchSize: 0 }), TypeError);
    await assert.rejects(store.cleanupExpired({ batchSize: 5001 }), TypeError);
    assert.equal(calls, 0);
});

test('requires a sufficiently long HMAC secret', () => {
    assert.throws(() => createPostgresRateLimitStore({ hmacSecret: 'too-short', query: async () => ({ rows: [] }) }), /at least 32 bytes/);
});
