'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { authenticatedUserId } = require('./chatIdentity');

test('uses verified session identity instead of a request-body userId', () => {
    const req = {
        body: { userId: 'victim-account' },
        authUser: { id: 'signed-in-account' }
    };
    assert.equal(authenticatedUserId(req), 'signed-in-account');
});

test('does not trust body, query, or header identities without a session', () => {
    assert.equal(authenticatedUserId({ body: { userId: 'victim-account' } }), null);
    assert.equal(authenticatedUserId({ query: { userId: 'victim-account' } }), null);
    assert.equal(authenticatedUserId({ headers: { 'x-user-id': 'victim-account' } }), null);
    assert.equal(authenticatedUserId({ authUser: { id: '   ' } }), null);
});
