'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('./rateLimit');

function response() {
    return {
        headers: {},
        statusCode: 200,
        set(name, value) { this.headers[name] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('allows the configured number of attempts and rejects the next', () => {
    let now = 1000;
    const limit = createRateLimiter({ windowMs: 60000, max: 2, now: () => now });
    let nextCount = 0;
    const req = { ip: 'client-a' };

    limit(req, response(), () => nextCount++);
    limit(req, response(), () => nextCount++);
    const blocked = response();
    limit(req, blocked, () => nextCount++);

    assert.equal(nextCount, 2);
    assert.equal(blocked.statusCode, 429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED');
    assert.equal(blocked.headers['Retry-After'], '60');
});

test('isolates clients and resets a client after the time window', () => {
    let now = 1000;
    const limit = createRateLimiter({ windowMs: 1000, max: 1, now: () => now });
    let nextCount = 0;

    limit({ ip: 'client-a' }, response(), () => nextCount++);
    const other = response();
    limit({ ip: 'client-b' }, other, () => nextCount++);
    now = 2001;
    const reset = response();
    limit({ ip: 'client-a' }, reset, () => nextCount++);

    assert.equal(nextCount, 3);
    assert.equal(reset.statusCode, 200);
});
