'use strict';

async function sendEmailVerificationEmail({ email, token }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.CHATTBM_PUBLIC_URL || 'https://chattbm.com';
    if (!apiKey || !from) {
        const error = new Error('Email-verification delivery is not configured.');
        error.code = 'EMAIL_VERIFICATION_EMAIL_NOT_CONFIGURED';
        throw error;
    }
    const link = new URL('/', appUrl);
    link.searchParams.set('verify_email_token', token);
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from,
            to: [email],
            subject: 'Verify your ChatTBM email',
            text: [
                'Please verify your email address for ChatTBM.',
                '',
                `Use this one-time link within 30 minutes: ${link.toString()}`,
                '',
                'If you did not create this account, you can ignore this email.'
            ].join('\n')
        })
    });
    if (!response.ok) {
        const error = new Error('Email-verification delivery failed.');
        error.code = 'EMAIL_VERIFICATION_EMAIL_FAILED';
        throw error;
    }
    return { sent: true };
}

module.exports = { sendEmailVerificationEmail };
