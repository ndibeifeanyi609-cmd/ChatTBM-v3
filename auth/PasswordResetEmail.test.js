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

test('rejects when the Resend API key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendPasswordResetEmail } = require('./PasswordResetEmail');
    await assert.rejects(
        sendPasswordResetEmail({ email: 'person@example.com', token: 'a'.repeat(40) }),
        error => error.code === 'RESEND_NOT_CONFIGURED'
    );
});

test('fires the password reset automation event', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    let request;
    global.fetch = async (url, options) => {
        request = { url, options };
        return { ok: true, json: async () => ({ id: 'test-event-id' }) };
    };
    const { sendPasswordResetEmail } = require('./PasswordResetEmail');
    const result = await sendPasswordResetEmail({
        email: 'person@example.com',
        token: 'secure-token-value',
        userName: 'Test User'
    });
    assert.equal(result.id, 'test-event-id');
    assert.equal(request.url, 'https://api.resend.com/events/send');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(request.options.body);
    assert.equal(body.event, 'password.reset.requested');
    assert.equal(body.email, 'person@example.com');
    assert.match(body.payload.resetUrl, /resetToken=secure-token-value/);
    assert.equal(body.payload.userName, 'Test User');
});
