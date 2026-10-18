'use strict';

const { authenticateSession } = require('./AuthService');

const COOKIE_NAME = 'chattbm_session';

function readSessionToken(req) {
    const cookieToken = req.cookies && req.cookies[COOKIE_NAME];
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
        return cookieToken;
    }

    const authorization = req.get('authorization') || '';
    if (authorization.startsWith('Bearer ')) {
        const token = authorization.slice(7).trim();
        return token || null;
    }

    return null;
}

async function requireAuth(req, res, next) {
    try {
        const user = await authenticateSession(readSessionToken(req));
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Sign in to continue.'
                }
            });
        }

        req.authUser = user;
        return next();
    } catch (error) {
        if (error && error.code === 'AUTH_DATABASE_UNAVAILABLE') {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'AUTH_UNAVAILABLE',
                    message: 'Authentication is temporarily unavailable.'
                }
            });
        }
        return next(error);
    }
}

module.exports = {
    requireAuth,
    readSessionToken
};
