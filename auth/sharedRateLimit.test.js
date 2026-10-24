'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createSharedRateLimiter } = require('./sharedRateLimit');

function response() {
    return { headers: {}, statusCode: 200, set(k, v) { this.headers[k] = v; return this; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('shared limiter permits configured attempts and blocks the next', async () => {
    let count = 0;
    const limit = createSharedRateLimiter({ store: { async consume() { count += 1; return { count, startedAt: 1000 }; } }, max: 2, windowMs: 60000, now: () => 1000, scope: 'login' });
    let nextCount = 0;
    await limit({ ip: 'client-a' }, response(), () => { nextCount += 1; });
    await limit({ ip: 'client-a' }, response(), () => { nextCount += 1; });
    const blocked = response();
    await limit({ ip: 'client-a' }, blocked, () => { nextCount += 1; });
    assert.equal(nextCount, 2);
    assert.equal(blocked.statusCode, 429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED');
    assert.equal(blocked.headers['Retry-After'], '60');
});

test('database failure fails closed with 503 and never calls next', async () => {
    let nextCalled = false;
    const limit = createSharedRateLimiter({ store: { async consume() { throw new Error('db down'); } } });
    const res = response();
    await limit({ ip: 'client-a' }, res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error.code, 'RATE_LIMIT_STORAGE_UNAVAILABLE');
    assert.equal(nextCalled, false);
});

test('uses the same store key for the same IP and scope', async () => {
    const keys = [];
    const limit = createSharedRateLimiter({ store: { async consume(key) { keys.push(key); return { count: 1, startedAt: Date.now() }; } }, scope: 'register' });
    await limit({ ip: '192.0.2.1' }, response(), () => {});
    await limit({ ip: '192.0.2.1' }, response(), () => {});
    assert.equal(keys[0], keys[1]);
    assert.match(keys[0], /^register:[a-f0-9]{64}$/);
    assert.equal(keys[0].includes('192.0.2.1'), false);
});


test('malformed store response fails closed with 503', async () => {
    let nextCalled = false;
    const limit = createSharedRateLimiter({ store: { async consume() { return { count: '1', startedAt: Date.now() }; } } });
    const res = response();
    await limit({ ip: 'client-a' }, res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error.code, 'RATE_LIMIT_STORAGE_UNAVAILABLE');
    assert.equal(nextCalled, false);
});
