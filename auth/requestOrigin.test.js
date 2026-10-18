'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedRequestOrigin, isTrustedMutationRequest } = require('./requestOrigin');

const allowed = new Set(['https://chattbm.com', 'https://ndibeifeanyi609-cmd.github.io']);

test('accepts only explicitly allowed browser origins', () => {
    assert.equal(isAllowedRequestOrigin('https://chattbm.com', allowed), true);
    assert.equal(isAllowedRequestOrigin('https://ndibeifeanyi609-cmd.github.io', allowed), true);
    assert.equal(isAllowedRequestOrigin('https://evil.example', allowed), false);
});

test('rejects missing, empty, and malformed origin values', () => {
    assert.equal(isAllowedRequestOrigin(undefined, allowed), false);
    assert.equal(isAllowedRequestOrigin('', allowed), false);
    assert.equal(isAllowedRequestOrigin(null, allowed), false);
    assert.equal(isAllowedRequestOrigin('https://chattbm.com.attacker.example', allowed), false);
});

test('allows API mutations from approved origins without bearer tokens', () => {
    assert.equal(
        isTrustedMutationRequest('https://chattbm.com', '', allowed),
        true
    );
});

test('rejects untrusted origins even when a bearer token is present', () => {
    assert.equal(
        isTrustedMutationRequest('https://evil.example', 'Bearer valid-token', allowed),
        false
    );
});

test('allows originless API clients only when they provide a bearer token', () => {
    assert.equal(isTrustedMutationRequest(undefined, 'Bearer valid-token', allowed), true);
    assert.equal(isTrustedMutationRequest(undefined, '', allowed), false);
});
