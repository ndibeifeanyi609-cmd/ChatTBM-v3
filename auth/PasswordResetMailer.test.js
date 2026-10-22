'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');

test('refuses to send when Resend configuration is missing', async () => {
    const previousKey = process.env.RESEND_API_KEY;
    const previousFrom = process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    try {
        await assert.rejects(
            sendPasswordResetEmail({ email: 'person@example.com', token: 'test-token' }),
            error => error.code === 'PASSWORD_RESET_EMAIL_NOT_CONFIGURED'
        );
    } finally {
        if (previousKey === undefined) delete process.env.RESEND_API_KEY;
        else process.env.RESEND_API_KEY = previousKey;
        if (previousFrom === undefined) delete process.env.RESEND_FROM_EMAIL;
        else process.env.RESEND_FROM_EMAIL = previousFrom;
    }
});

test('sends a reset link only through the configured Resend API request', async () => {
    const oldKey = process.env.RESEND_API_KEY;
    const oldFrom = process.env.RESEND_FROM_EMAIL;
    const oldUrl = process.env.CHATTBM_PUBLIC_URL;
    const oldFetch = global.fetch;
    let request;
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'ChatTBM <no-reply@chattbm.com>';
    process.env.CHATTBM_PUBLIC_URL = 'https://chattbm.com';
    global.fetch = async (url, options) => {
        request = { url, options };
        return { ok: true };
    };
    try {
        const result = await sendPasswordResetEmail({
            email: 'person@example.com',
            token: 'opaque-reset-token'
        });
        assert.deepEqual(result, { sent: true });
        assert.equal(request.url, 'https://api.resend.com/emails');
        assert.equal(request.options.headers.Authorization, 'Bearer test-key');
        const body = JSON.parse(request.options.body);
        assert.equal(body.to[0], 'person@example.com');
        assert.match(body.text, /https:\/\/chattbm\.com\/?\?token=opaque-reset-token/);
    } finally {
        global.fetch = oldFetch;
        if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
        if (oldFrom === undefined) delete process.env.RESEND_FROM_EMAIL; else process.env.RESEND_FROM_EMAIL = oldFrom;
        if (oldUrl === undefined) delete process.env.CHATTBM_PUBLIC_URL; else process.env.CHATTBM_PUBLIC_URL = oldUrl;
    }
});

test('does not expose provider response details when sending fails', async () => {
    const oldKey = process.env.RESEND_API_KEY;
    const oldFrom = process.env.RESEND_FROM_EMAIL;
    const oldFetch = global.fetch;
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'ChatTBM <no-reply@chattbm.com>';
    global.fetch = async () => ({ ok: false, text: async () => 'private provider detail' });
    try {
        await assert.rejects(
            sendPasswordResetEmail({ email: 'person@example.com', token: 'opaque-reset-token' }),
            error => error.code === 'PASSWORD_RESET_EMAIL_FAILED' &&
                !error.message.includes('private provider detail') &&
                !error.message.includes('opaque-reset-token')
        );
    } finally {
        global.fetch = oldFetch;
        if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
        if (oldFrom === undefined) delete process.env.RESEND_FROM_EMAIL; else process.env.RESEND_FROM_EMAIL = oldFrom;
    }
});
