'use strict';

async function sendPasswordResetEmail({ email, token }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.CHATTBM_PUBLIC_URL || 'https://chattbm.com';

    if (!apiKey || !from) {
        const error = new Error('Password-reset email is not configured.');
        error.code = 'PASSWORD_RESET_EMAIL_NOT_CONFIGURED';
        throw error;
    }

    const base = new URL('/', appUrl);
    base.searchParams.set('token', token);
    const resetUrl = base.toString();

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from,
            to: [email],
            subject: 'Reset your ChatTBM password',
            text: [
                'We received a request to reset your ChatTBM password.',
                '',
                `Use this one-time link within 30 minutes: ${resetUrl}`,
                '',
                'If you did not request this, you can ignore this email.'
            ].join('\n')
        })
    });

    if (!response.ok) {
        // Do not include the provider response, recipient, or reset URL in logs/errors.
        const error = new Error('Password-reset email delivery failed.');
        error.code = 'PASSWORD_RESET_EMAIL_FAILED';
        throw error;
    }

    return { sent: true };
}

module.exports = { sendPasswordResetEmail };
