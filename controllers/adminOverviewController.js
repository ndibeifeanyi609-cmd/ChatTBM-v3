'use strict';

const { getPool, checkDatabase } = require('../database/Postgres');

function createAdminOverviewHandler(options = {}) {
    const getDatabasePool = options.getPool || getPool;
    const checkDatabaseHealth = options.checkDatabase || checkDatabase;

    return async function adminOverviewHandler(req, res) {
        try {
            const health = await checkDatabaseHealth();
            if (!health || health.connected !== true || health.status !== 'connected') {
                return res.status(503).json({
                    success: false,
                    error: {
                        code: 'ADMIN_OVERVIEW_UNAVAILABLE',
                        message: 'Admin overview data is temporarily unavailable.'
                    }
                });
            }

            const db = getDatabasePool();
            if (!db) {
                return res.status(503).json({
                    success: false,
                    error: {
                        code: 'ADMIN_OVERVIEW_UNAVAILABLE',
                        message: 'Admin overview data is temporarily unavailable.'
                    }
                });
            }

            const result = await db.query(
                'SELECT COUNT(*)::integer AS registered_users FROM chattbm_users'
            );
            const count = result.rows && result.rows[0]
                ? result.rows[0].registered_users
                : null;

            if (!Number.isSafeInteger(count) || count < 0) {
                throw new Error('Invalid aggregate account count.');
            }

            return res.json({
                success: true,
                data: {
                    registeredUsers: count,
                    service: 'online',
                    database: 'connected',
                    usage: {
                        status: 'unavailable',
                        reason: 'Reliable aggregate usage telemetry is not configured.'
                    },
                    providerCosts: {
                        status: 'unavailable',
                        reason: 'Durable provider usage telemetry is not configured.'
                    }
                }
            });
        } catch (_) {
            return res.status(503).json({
                success: false,
                error: {
                    code: 'ADMIN_OVERVIEW_UNAVAILABLE',
                    message: 'Admin overview data is temporarily unavailable.'
                }
            });
        }
    };
}

module.exports = { createAdminOverviewHandler };
