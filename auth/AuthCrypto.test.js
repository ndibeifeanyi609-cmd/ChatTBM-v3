'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    normalizeEmail,
    validatePassword,
    hashPassword,
    verifyPassword,
    createSessionToken,
    hashSessionToken
} = require('./AuthCrypto');

test('normalizes email without accepting non-string values', () => {
    assert.equal(normalizeEmail('  USER@Example.COM  '), 'user@example.com');
    assert.equal(normalizeEmail(null), '');
});

test('enforces password length limits', () => {
    assert.equal(validatePassword('short'), false);
    assert.equal(validatePassword('long-enough-password'), true);
    assert.equal(validatePassword('x'.repeat(1025)), false);
});

test('hashes passwords with unique salts and verifies them', async () => {
    const password = 'correct horse battery staple';
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    assert.notEqual(first, second);
    assert.match(first, /^scrypt\$16384\$8\$1\$/);
    assert.equal(await verifyPassword(password, first), true);
    assert.equal(await verifyPassword('wrong password', first), false);
    assert.equal(await verifyPassword(password, 'not-a-hash'), false);
});

test('creates opaque session tokens and stores only a deterministic token digest', () => {
    const first = createSessionToken();
    const second = createSessionToken();

    assert.notEqual(first, second);
    assert.ok(first.length >= 40);
    assert.equal(hashSessionToken(first), hashSessionToken(first));
    assert.notEqual(hashSessionToken(first), first);
    assert.throws(() => hashSessionToken('short'), /Session token is invalid/);
});
