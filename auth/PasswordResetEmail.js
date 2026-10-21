'use strict';

const { randomUUID } = require('node:crypto');

async function sendPasswordResetEmail({ email, token, userName }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        const error = new Error('Password reset email is not configured.');
        error.code = 'RESEND_NOT_CONFIGURED';
        throw error;
    }
    const baseUrl = (process.env.CHATTBM_PUBLIC_URL || 'https://chattbm.com').replace(/\/$/, '');
    const resetUrl = baseUrl + '/?resetToken=' + encodeURIComponent(token);
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
            'Idempotency-Key': randomUUID()
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'ChatTBM <no-reply@chattbm.com>',
            to: [email],
            subject: 'Reset your ChatTBM password',
            html: '<p>Hello ' + escapeHtml(userName || 'there') + ',</p><p>We received a request to reset your ChatTBM password.</p><p><a href="' + escapeHtml(resetUrl) + '">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>',
            text: 'Hello ' + (userName || 'there') + ',\n\nReset your ChatTBM password using this link: ' + resetUrl + '\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.'
        })
    });
    if (!response.ok) {
        const error = new Error('Password reset email could not be sent.');
        error.code = 'RESEND_DELIVERY_FAILED';
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

module.exports = { sendPasswordResetEmail };
