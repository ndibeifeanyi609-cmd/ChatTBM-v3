'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('./AuthService');

test('rejects malformed email and weak passwords before database access', async () => {
    const badEmail = await register('not-an-email', 'a-long-enough-password');
    assert.equal(badEmail.success, false);
    assert.equal(badEmail.code, 'INVALID_REGISTRATION');

    const weakPassword = await register('person@example.com', 'short');
    assert.equal(weakPassword.success, false);
    assert.equal(weakPassword.code, 'INVALID_REGISTRATION');
});

test('does not expose account existence in invalid registration responses', async () => {
    const result = await register(' PERSON@example.com ', 'short');
    assert.deepEqual(result, {
        success: false,
        code: 'INVALID_REGISTRATION',
        error: 'Enter a valid email and a password of at least 12 characters.'
    });
});
