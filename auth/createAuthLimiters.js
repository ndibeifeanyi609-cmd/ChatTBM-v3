'use strict';

const { createRateLimiter } = require('./rateLimit');
const { createSharedRateLimiter } = require('./sharedRateLimit');
const { createPostgresRateLimitStore } = require('./PostgresRateLimitStore');

function createAuthLimiters({
    enabled = process.env.AUTH_SHARED_RATE_LIMIT_ENABLED === 'true',
    createLocalLimiter = createRateLimiter,
    createSharedLimiter = createSharedRateLimiter,
    createStore = createPostgresRateLimitStore
} = {}) {
    if (!enabled) {
        return {
            registration: createLocalLimiter({ max: 5 }),
            login: createLocalLimiter({ max: 10 }),
            passwordResetRequest: createLocalLimiter({ max: 3 }),
            passwordResetRedeem: createLocalLimiter({ max: 5 })
        };
    }

    const store = createStore();
    return {
        registration: createSharedLimiter({ store, max: 5, scope: 'register' }),
        login: createSharedLimiter({ store, max: 10, scope: 'login' }),
        passwordResetRequest: createSharedLimiter({ store, max: 3, scope: 'password-reset-request' }),
        passwordResetRedeem: createSharedLimiter({ store, max: 5, scope: 'password-reset-confirm' })
    };
}

module.exports = { createAuthLimiters };
