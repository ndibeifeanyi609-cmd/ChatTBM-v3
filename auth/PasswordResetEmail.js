'use strict';

async function sendPasswordResetEmail({ email, token, userName }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        const error = new Error('Password reset automation is not configured.');
        error.code = 'RESEND_NOT_CONFIGURED';
        throw error;
    }
    const baseUrl = (process.env.CHATTBM_PUBLIC_URL || 'https://chattbm.com').replace(/\/$/, '');
    const resetUrl = baseUrl + '/?resetToken=' + encodeURIComponent(token);
    const response = await fetch('https://api.resend.com/events/send', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event: 'password.reset.requested',
            email,
            payload: {
                resetUrl,
                userName: userName || 'there'
            }
        })
    });
    if (!response.ok) {
        const error = new Error('Password reset automation could not be triggered.');
        error.code = 'RESEND_EVENT_FAILED';
        error.status = response.status;
        throw error;
    }
    return response.json();
}

module.exports = { sendPasswordResetEmail };
