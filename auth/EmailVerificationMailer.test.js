'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sendEmailVerificationEmail } = require('./EmailVerificationMailer');

test('refuses to send when Resend configuration is missing', async () => {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    try {
        await assert.rejects(
            sendEmailVerificationEmail({ email: 'person@example.com', token: 'test-token' }),
            error => error.code === 'EMAIL_VERIFICATION_EMAIL_NOT_CONFIGURED'
        );
    } finally {
        if (key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = key;
        if (from === undefined) delete process.env.RESEND_FROM_EMAIL; else process.env.RESEND_FROM_EMAIL = from;
    }
});

test('sends a one-time verification link through Resend', async () => {
    const key = process.env.RESEND_API_KEY, from = process.env.RESEND_FROM_EMAIL;
    const url = process.env.CHATTBM_PUBLIC_URL, oldFetch = global.fetch;
    let request;
    process.env.RESEND_API_KEY = 'test-key';
    process.env.RESEND_FROM_EMAIL = 'ChatTBM <no-reply@chattbm.com>';
    process.env.CHATTBM_PUBLIC_URL = 'https://chattbm.com';
    global.fetch = async (target, options) => { request = { target, options }; return { ok: true }; };
    try {
        assert.deepEqual(await sendEmailVerificationEmail({ email: 'person@example.com', token: 'opaque-token' }), { sent: true });
        assert.equal(request.target, 'https://api.resend.com/emails');
        const body = JSON.parse(request.options.body);
        assert.equal(body.to[0], 'person@example.com');
        assert.match(body.text, /verify your email/i);
        assert.match(body.text, /verify_email_token=opaque-token/);
    } finally {
        global.fetch = oldFetch;
        if (key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = key;
        if (from === undefined) delete process.env.RESEND_FROM_EMAIL; else process.env.RESEND_FROM_EMAIL = from;
        if (url === undefined) delete process.env.CHATTBM_PUBLIC_URL; else process.env.CHATTBM_PUBLIC_URL = url;
    }
});
