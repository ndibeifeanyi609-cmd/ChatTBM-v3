'use strict';

const express = require('express');
const {
    register,
    login,
    authenticateSession,
    revokeSession
} = require('./AuthService');
const { createPasswordReset, redeemPasswordReset } = require('./PasswordResetService');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');

const router = express.Router();
const { createRateLimiter } = require('./rateLimit');
const limitRegistration = createRateLimiter({ max: 5 });
const limitLogin = createRateLimiter({ max: 10 });
const limitPasswordResetRequest = createRateLimiter({ max: 3 });
const limitPasswordResetRedeem = createRateLimiter({ max: 5 });
const COOKIE_NAME = 'chattbm_session';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
};

function sendFailure(res, error, status) {
    return res.status(status).json({
        success: false,
        error
    });
}

function sessionToken(req) {
    const value = req.cookies && req.cookies[COOKIE_NAME];
    if (typeof value === 'string') return value;

    const authorization = req.get('authorization') || '';
    if (authorization.startsWith('Bearer ')) {
        return authorization.slice(7);
    }
    return null;
}

router.post('/register', limitRegistration, async (req, res, next) => {
    try {
        const result = await register(
            req.body && req.body.email,
            req.body && req.body.password
        );
        if (!result.success) {
            return sendFailure(
                res,
                result.error,
                result.code === 'INVALID_REGISTRATION' ? 400 : 409
            );
        }
        return res.status(201).json({
            success: true,
            user: {
                id: result.user.id,
                email: result.user.email_normalized
            },
            message: 'Account created. Sign in to start a session.'
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/login', limitLogin, async (req, res, next) => {
    try {
        const result = await login(
            req.body && req.body.email,
            req.body && req.body.password
        );
        if (!result.success) {
            return sendFailure(res, result.error, 401);
        }
        res.cookie(COOKIE_NAME, result.token, {
            ...COOKIE_OPTIONS,
            expires: result.expiresAt
        });
        return res.json({
            success: true,
            user: result.user,
            token: result.token,
            expiresAt: result.expiresAt
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/password-reset/request', limitPasswordResetRequest, async (req, res, next) => {
    try {
        const reset = await createPasswordReset(req.body && req.body.email);
        if (reset) {
            // Send after initiating the delivery without making the HTTP response
            // wait on the mail provider. Never log the recipient, token, or URL.
            void sendPasswordResetEmail(reset).catch(error => {
                console.error('Password-reset email delivery unavailable:', error.code || 'UNKNOWN');
            });
        }
        return res.json({
            success: true,
            message: 'If an account matches that email, a password-reset link will be sent.'
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/password-reset/confirm', limitPasswordResetRedeem, async (req, res, next) => {
    try {
        const result = await redeemPasswordReset(
            req.body && req.body.token,
            req.body && req.body.password
        );
        if (!result.success) {
            return sendFailure(res, 'This reset link is invalid or expired.', 400);
        }
        return res.json({
            success: true,
            message: 'Password updated. Please sign in again.'
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/me', async (req, res, next) => {
    try {
        const user = await authenticateSession(sessionToken(req));
        if (!user) {
            return sendFailure(res, 'Authentication required.', 401);
        }
        return res.json({ success: true, user });
    } catch (error) {
        return next(error);
    }
});

router.post('/logout', async (req, res, next) => {
    try {
        await revokeSession(sessionToken(req));
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
