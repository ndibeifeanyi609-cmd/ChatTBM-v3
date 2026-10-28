'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthLimiters } = require('./createAuthLimiters');

test('defaults to six in-memory limiters without creating a shared store', () => {
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
    assert.deepEqual(localCalls.map(call => call.options.max), [5, 10, 3, 5, 3, 5]);
    assert.equal(limiters.registration, localCalls[0].limiter);
    assert.equal(limiters.login, localCalls[1].limiter);
    assert.equal(limiters.passwordResetRequest, localCalls[2].limiter);
    assert.equal(limiters.passwordResetRedeem, localCalls[3].limiter);
    assert.equal(limiters.emailVerificationRequest, localCalls[4].limiter);
    assert.equal(limiters.emailVerificationRedeem, localCalls[5].limiter);
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
        [5, 'password-reset-confirm'],
        [3, 'email-verification-request'],
        [5, 'email-verification-redeem']
    ]);
    assert.ok(sharedCalls.every(call => call.store === store));
    assert.equal(typeof limiters.registration, 'function');
    assert.equal(typeof limiters.emailVerificationRequest, 'function');
    assert.equal(typeof limiters.emailVerificationRedeem, 'function');
});

test('does not silently fall back if shared store creation fails', () => {
    assert.throws(() => createAuthLimiters({
        enabled: true,
        createStore: () => { throw new Error('missing secret'); },
        createLocalLimiter: () => { throw new Error('fallback forbidden'); }
    }), /missing secret/);
});

test('defaults to in-memory limiters when the shared feature flag is unset', () => {
    const originalFlag = process.env.AUTH_SHARED_RATE_LIMIT_ENABLED;
    delete process.env.AUTH_SHARED_RATE_LIMIT_ENABLED;
    try {
        const localCalls = [];
        let storeCalls = 0;
        const limiters = createAuthLimiters({
            createLocalLimiter: options => {
                localCalls.push(options.max);
                return () => {};
            },
            createStore: () => { storeCalls += 1; throw new Error('shared store must remain disabled'); }
        });
        assert.deepEqual(localCalls, [5, 10, 3, 5, 3, 5]);
        assert.equal(typeof limiters.registration, 'function');
        assert.equal(typeof limiters.login, 'function');
        assert.equal(typeof limiters.passwordResetRequest, 'function');
        assert.equal(typeof limiters.passwordResetRedeem, 'function');
        assert.equal(typeof limiters.emailVerificationRequest, 'function');
        assert.equal(typeof limiters.emailVerificationRedeem, 'function');
        assert.equal(storeCalls, 0);
    } finally {
        if (originalFlag === undefined) delete process.env.AUTH_SHARED_RATE_LIMIT_ENABLED;
        else process.env.AUTH_SHARED_RATE_LIMIT_ENABLED = originalFlag;
    }
});
