'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const originalFetch = global.fetch;
const originalApiKey = process.env.RESEND_API_KEY;

test.afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
});

test('rejects sending when the Resend API key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendPasswordResetEmail } = require('./PasswordResetEmail');
    await assert.rejects(
        sendPasswordResetEmail({ email: 'person@example.com', token: 'a'.repeat(40) }),
        error => error.code === 'RESEND_NOT_CONFIGURED'
    );
});

test('sends a reset email through Resend without exposing the token outside the link', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    let request;
    global.fetch = async (url, options) => {
        request = { url, options };
        return { ok: true, json: async () => ({ id: 'test-email-id' }) };
    };
    const { sendPasswordResetEmail } = require('./PasswordResetEmail');
    const result = await sendPasswordResetEmail({
        email: 'person@example.com',
        token: 'secure-token-value',
        userName: '<script>alert(1)</script>'
    });
    assert.equal(result.id, 'test-email-id');
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(request.options.body);
    assert.deepEqual(body.to, ['person@example.com']);
    assert.match(body.text, /secure-token-value/);
    assert.doesNotMatch(body.html, /<script>/);
    assert.match(body.html, /&lt;script&gt;/);
});
