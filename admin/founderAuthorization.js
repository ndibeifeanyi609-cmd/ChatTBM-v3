'use strict';

const { getPool } = require('../database/Postgres');

function createFounderAuthorization(options = {}) {
    const getDatabasePool = options.getPool || getPool;

    return async function requireFounder(req, res, next) {
        const configuredFounderId = process.env.CHATTBM_FOUNDER_USER_ID;
        const authenticatedUserId = req && req.authUser && req.authUser.id;

        if (
            typeof configuredFounderId !== 'string' ||
            !configuredFounderId.trim() ||
            typeof authenticatedUserId !== 'string' ||
            !authenticatedUserId.trim() ||
            authenticatedUserId !== configuredFounderId
        ) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FOUNDER_ACCESS_DENIED',
                    message: 'Founder access is not available.'
                }
            });
        }

        const db = getDatabasePool();
        if (!db) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'FOUNDER_AUTHORIZATION_UNAVAILABLE',
                    message: 'Founder authorization is temporarily unavailable.'
                }
            });
        }

        try {
            const result = await db.query(
                'SELECT id FROM chattbm_users WHERE id = $1 AND email_verified_at IS NOT NULL AND disabled_at IS NULL',
                [configuredFounderId]
            );

            if (!result.rows || result.rows.length !== 1) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'FOUNDER_ACCESS_DENIED',
                        message: 'Founder access is not available.'
                    }
                });
            }

            return next();
        } catch (_) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'FOUNDER_AUTHORIZATION_UNAVAILABLE',
                    message: 'Founder authorization is temporarily unavailable.'
                }
            });
        }
    };
}

module.exports = { createFounderAuthorization };
