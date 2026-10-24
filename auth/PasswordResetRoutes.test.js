'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const express = require('express');
const http = require('node:http');

const originalLoad = Module._load;
let requestedEmail = null;
let redeemed = null;
let mailError = null;

Module._load = function(request, parent, isMain) {
    if (request === './AuthService' && parent?.filename?.endsWith('/auth/authRoutes.js')) {
        return {
            register: async () => ({ success: false, error: 'unused' }),
            login: async () => ({ success: false, error: 'unused' }),
            authenticateSession: async () => null,
            revokeSession: async () => {}
        };
    }
    if (request === './PasswordResetService' && parent?.filename?.endsWith('/auth/authRoutes.js')) {
        return {
            createPasswordReset: async email => {
                requestedEmail = email;
                return email === 'known@example.com' ? { email, token: 'opaque-test-token' } : null;
            },
            redeemPasswordReset: async (token, password) => {
                redeemed = { token, password };
                return token === 'valid-test-token-12345678901234567890' && password.length >= 12
                    ? { success: true } : { success: false };
            }
        };
    }
    if (request === './PasswordResetMailer' && parent?.filename?.endsWith('/auth/authRoutes.js')) {
        return { sendPasswordResetEmail: async () => {
            if (mailError) throw Object.assign(new Error('private detail'), { code: 'TEST_MAIL_FAILURE' });
        }};
    }
    return originalLoad.call(this, request, parent, isMain);
};

const router = require('../auth/authRoutes');
Module._load = originalLoad;

async function withServer(t) {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', router);
    const server = http.createServer(app);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    return 'http://127.0.0.1:' + server.address().port;
}

test('password-reset request returns the same generic response for known and unknown emails', async t => {
    const base = await withServer(t);
    const known = await fetch(base + '/api/auth/password-reset/request', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'known@example.com' })
    });
    const unknown = await fetch(base + '/api/auth/password-reset/request', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'missing@example.com' })
    });
    assert.equal(known.status, 200);
    assert.equal(unknown.status, 200);
    assert.deepEqual(await known.json(), await unknown.json());
    assert.equal(requestedEmail, 'missing@example.com');
});

test('password-reset confirmation succeeds only for valid token and password', async t => {
    const base = await withServer(t);
    const response = await fetch(base + '/api/auth/password-reset/confirm', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: 'valid-test-token-12345678901234567890', password: 'new-correct-password-123' })
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    assert.equal(redeemed.password, 'new-correct-password-123');

    const invalid = await fetch(base + '/api/auth/password-reset/confirm', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: 'invalid', password: 'short' })
    });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).success, false);
});

test('password-reset request remains generic when mail delivery fails', async t => {
    const base = await withServer(t);
    mailError = true;
    try {
        const response = await fetch(base + '/api/auth/password-reset/request', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: 'known@example.com' })
        });
        assert.equal(response.status, 200);
        assert.match((await response.json()).message, /If an account matches/);
    } finally {
        mailError = false;
    }
});
