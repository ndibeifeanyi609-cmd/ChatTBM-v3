'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createPostgresRateLimitStore, UPSERT_BUCKET_SQL } = require('./PostgresRateLimitStore');

test('uses one atomic upsert and normalizes returned bucket fields', async () => {
    let captured;
    const store = createPostgresRateLimitStore({
        query: async (sql, values) => {
            captured = { sql, values };
            return { rows: [{ request_count: '3', window_started_at: '2026-01-01T00:00:00.000Z', expires_at: '2026-01-01T00:01:00.000Z' }] };
        }
    });

    const result = await store.consume('login:ip-hash', 60000);
    assert.equal(captured.sql, UPSERT_BUCKET_SQL);
    assert.deepEqual(captured.values, [crypto.createHash('sha256').update('login:ip-hash').digest('hex'), 60000]);
    assert.notEqual(captured.values[0], 'login:ip-hash');
    assert.match(captured.sql, /ON CONFLICT \(bucket_key\) DO UPDATE/);
    assert.equal(result.count, 3);
    assert.equal(result.startedAt, Date.parse('2026-01-01T00:00:00.000Z'));
    assert.equal(result.expiresAt, Date.parse('2026-01-01T00:01:00.000Z'));
});

test('rejects invalid keys and windows before querying storage', async () => {
    let calls = 0;
    const store = createPostgresRateLimitStore({ query: async () => { calls++; return { rows: [] }; } });
    await assert.rejects(store.consume('', 1000), TypeError);
    await assert.rejects(store.consume('x', 0), TypeError);
    await assert.rejects(store.consume('x'.repeat(513), 1000), TypeError);
    assert.equal(calls, 0);
});

test('fails if storage returns no bucket instead of allowing the request implicitly', async () => {
    const store = createPostgresRateLimitStore({ query: async () => ({ rows: [] }) });
    await assert.rejects(store.consume('login:ip-hash', 1000), /returned no bucket/);
});
