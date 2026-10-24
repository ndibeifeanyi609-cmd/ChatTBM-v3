'use strict';

const express = require('express');
const services = require('./AuthService');
const passwordReset = require('./PasswordResetService');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');
const { createRateLimiter } = require('./rateLimit');
const { createSharedRateLimiter } = require('./sharedRateLimit');
const { createPostgresRateLimitStore } = require('./PostgresRateLimitStore');
const { createAuthRouter } = require('./createAuthRouter');

function createLimiters() {
    if (process.env.AUTH_SHARED_RATE_LIMIT_ENABLED !== 'true') {
        // Safe default: preserve existing behavior unless explicitly enabled.
        return {
            registration: createRateLimiter({ max: 5 }),
            login: createRateLimiter({ max: 10 }),
            passwordResetRequest: createRateLimiter({ max: 3 }),
            passwordResetRedeem: createRateLimiter({ max: 5 })
        };
    }

    // Explicit opt-in requires the database schema and a dedicated HMAC secret.
    // Store construction fails immediately if the secret is absent or too short.
    const store = createPostgresRateLimitStore();
    return {
        registration: createSharedRateLimiter({ store, max: 5, scope: 'register' }),
        login: createSharedRateLimiter({ store, max: 10, scope: 'login' }),
        passwordResetRequest: createSharedRateLimiter({ store, max: 3, scope: 'password-reset-request' }),
        passwordResetRedeem: createSharedRateLimiter({ store, max: 5, scope: 'password-reset-confirm' })
    };
}

const router = createAuthRouter({
    express,
    services,
    passwordReset,
    sendPasswordResetEmail,
    limiters: createLimiters()
});

module.exports = router;
