'use strict';

const express = require('express');
const services = require('./AuthService');
const passwordReset = require('./PasswordResetService');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');
const { createRateLimiter } = require('./rateLimit');
const { createAuthRouter } = require('./createAuthRouter');

// Keep the existing process-local limiter as the default.
// PostgreSQL-backed limits are deliberately not enabled in this change.
const router = createAuthRouter({
    express,
    services,
    passwordReset,
    sendPasswordResetEmail,
    limiters: {
        registration: createRateLimiter({ max: 5 }),
        login: createRateLimiter({ max: 10 }),
        passwordResetRequest: createRateLimiter({ max: 3 }),
        passwordResetRedeem: createRateLimiter({ max: 5 })
    }
});

module.exports = router;
