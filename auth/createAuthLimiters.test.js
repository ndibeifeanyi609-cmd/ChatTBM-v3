'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthLimiters } = require('./createAuthLimiters');

test('defaults to four in-memory limiters without creating a shared store', () => {
    const localCalls = [];
    let storeCalls = 0;
    const createLocalLimiter = options => {
        const limiter = () => {};
        localCalls.push({ options, limiter });
        return limiter;
    };
    const limiters = createAuthLimiters({
        enabled: false,
        createLocalLimiter,
        createStore: () => { storeCalls += 1; throw new Error('must not create shared store'); }
    });
    assert.deepEqual(localCalls.map(call => call.options.max), [5, 10, 3, 5]);
    assert.equal(limiters.registration, localCalls[0].limiter);
    assert.equal(limiters.login, localCalls[1].limiter);
    assert.equal(limiters.passwordResetRequest, localCalls[2].limiter);
    assert.equal(limiters.passwordResetRedeem, localCalls[3].limiter);
    assert.equal(storeCalls, 0);
});

test('creates separate shared scopes only when explicitly enabled', () => {
    const store = { consume: async () => ({ count: 1, startedAt: Date.now() }) };
    const storeCalls = [];
    const sharedCalls = [];
    const limiters = createAuthLimiters({
        enabled: true,
        createStore: () => { storeCalls.push(true); return store; },
        createSharedLimiter: options => { sharedCalls.push(options); return () => {}; },
        createLocalLimiter: () => { throw new Error('local limiter must not be used'); }
    });
    assert.equal(storeCalls.length, 1);
    assert.deepEqual(sharedCalls.map(call => [call.max, call.scope]), [
        [5, 'register'],
        [10, 'login'],
        [3, 'password-reset-request'],
        [5, 'password-reset-confirm']
    ]);
    assert.ok(sharedCalls.every(call => call.store === store));
    assert.equal(typeof limiters.registration, 'function');
});

test('does not silently fall back if shared store creation fails', () => {
    assert.throws(() => createAuthLimiters({
        enabled: true,
        createStore: () => { throw new Error('missing secret'); },
        createLocalLimiter: () => { throw new Error('fallback forbidden'); }
    }), /missing secret/);
});
