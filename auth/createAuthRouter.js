'use strict';

/**
 * Builds the authentication router with injected services and middleware.
 * This keeps route behavior testable without a live database or real email provider.
 */
function createAuthRouter({
    express,
    services,
    passwordReset,
    sendPasswordResetEmail,
    emailVerification,
    sendEmailVerificationEmail,
    limiters,
    nodeEnv = process.env.NODE_ENV
} = {}) {
    if (!express || typeof express.Router !== 'function') throw new TypeError('express.Router is required.');
    if (!services || !passwordReset || !emailVerification || !limiters || typeof sendPasswordResetEmail !== 'function' || typeof sendEmailVerificationEmail !== 'function') {
        throw new TypeError('Authentication services, password reset and email verification functions, mailers, and limiters are required.');
    }
    for (const name of ['register', 'login', 'authenticateSession', 'revokeSession']) {
        if (typeof services[name] !== 'function') throw new TypeError('Missing auth service: ' + name);
    }
    for (const name of ['createPasswordReset', 'redeemPasswordReset']) {
        if (typeof passwordReset[name] !== 'function') throw new TypeError('Missing password reset service: ' + name);
    }
    for (const name of ['createEmailVerification', 'redeemEmailVerification']) {
        if (typeof emailVerification[name] !== 'function') throw new TypeError('Missing email verification service: ' + name);
    }
    for (const name of ['registration', 'login', 'passwordResetRequest', 'passwordResetRedeem', 'emailVerificationRequest', 'emailVerificationRedeem']) {
        if (typeof limiters[name] !== 'function') throw new TypeError('Missing rate limiter: ' + name);
    }

    const router = express.Router();
    const cookieName = 'chattbm_session';
    const cookieOptions = {
        httpOnly: true,
        secure: nodeEnv === 'production',
        sameSite: nodeEnv === 'production' ? 'none' : 'lax',
        path: '/'
    };
    const sendFailure = (res, error, status) => res.status(status).json({ success: false, error });
    function sessionToken(req) {
        const value = req.cookies && req.cookies[cookieName];
        if (typeof value === 'string') return value;
        const authorization = req.get('authorization') || '';
        return authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    }

    router.post('/register', limiters.registration, async (req, res, next) => {
        try {
            const result = await services.register(req.body && req.body.email, req.body && req.body.password);
            if (!result.success) return sendFailure(res, result.error, result.code === 'INVALID_REGISTRATION' ? 400 : 409);
            let verificationEmailQueued = false;
            try {
                const verification = await emailVerification.createEmailVerification(result.user.email_normalized);
                if (verification) {
                    await sendEmailVerificationEmail(verification);
                    verificationEmailQueued = true;
                }
            } catch (error) {
                console.error('Registration verification email delivery unavailable:', error.code || 'UNKNOWN');
            }
            return res.status(201).json({
                success: true,
                user: { id: result.user.id, email: result.user.email_normalized },
                message: verificationEmailQueued
                    ? 'Account created. Check your email for a verification link before signing in.'
                    : 'Account created. Email verification could not be sent yet. Request a verification link before signing in.'
            });
        } catch (error) { return next(error); }
    });

    router.post('/login', limiters.login, async (req, res, next) => {
        try {
            const result = await services.login(req.body && req.body.email, req.body && req.body.password);
            if (!result.success) return sendFailure(res, result.error, 401);
            res.cookie(cookieName, result.token, { ...cookieOptions, expires: result.expiresAt });
            return res.json({ success: true, user: result.user, token: result.token, expiresAt: result.expiresAt });
        } catch (error) { return next(error); }
    });

    router.post('/password-reset/request', limiters.passwordResetRequest, async (req, res, next) => {
        try {
            const reset = await passwordReset.createPasswordReset(req.body && req.body.email);
            if (reset) void sendPasswordResetEmail(reset).catch(error => console.error('Password-reset email delivery unavailable:', error.code || 'UNKNOWN'));
            return res.json({ success: true, message: 'If an account matches that email, a password-reset link will be sent.' });
        } catch (error) { return next(error); }
    });

    router.post('/password-reset/confirm', limiters.passwordResetRedeem, async (req, res, next) => {
        try {
            const result = await passwordReset.redeemPasswordReset(req.body && req.body.token, req.body && req.body.password);
            if (!result.success) return sendFailure(res, 'This reset link is invalid or expired.', 400);
            return res.json({ success: true, message: 'Password updated. Please sign in again.' });
        } catch (error) { return next(error); }
    });

    router.post('/email-verification/request', limiters.emailVerificationRequest, async (req, res, next) => {
        try {
            const verification = await emailVerification.createEmailVerification(req.body && req.body.email);
            if (verification) void sendEmailVerificationEmail(verification).catch(error => console.error('Email-verification delivery unavailable:', error.code || 'UNKNOWN'));
            return res.json({ success: true, message: 'If an unverified account matches that email, a verification link will be sent.' });
        } catch (error) { return next(error); }
    });

    router.post('/email-verification/confirm', limiters.emailVerificationRedeem, async (req, res, next) => {
        try {
            const result = await emailVerification.redeemEmailVerification(req.body && req.body.token);
            if (!result.success) return sendFailure(res, 'This verification link is invalid or expired.', 400);
            return res.json({ success: true, message: 'Email address verified. You can now sign in.' });
        } catch (error) { return next(error); }
    });

    router.get('/me', async (req, res, next) => {
        try {
            const user = await services.authenticateSession(sessionToken(req));
            if (!user) return sendFailure(res, 'Authentication required.', 401);
            return res.json({ success: true, user });
        } catch (error) { return next(error); }
    });

    router.post('/logout', async (req, res, next) => {
        try {
            await services.revokeSession(sessionToken(req));
            res.clearCookie(cookieName, cookieOptions);
            return res.json({ success: true });
        } catch (error) { return next(error); }
    });
    return router;
}

module.exports = { createAuthRouter };
