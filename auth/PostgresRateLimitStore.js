'use strict';

const crypto = require('node:crypto');
const { getPool } = require('../database/Postgres');

const UPSERT_BUCKET_SQL = `
    INSERT INTO chattbm_auth_rate_limits
        (bucket_key, window_started_at, request_count, expires_at, updated_at)
    VALUES ($1, NOW(), 1, NOW() + ($2::bigint * INTERVAL '1 millisecond'), NOW())
    ON CONFLICT (bucket_key) DO UPDATE SET
        request_count = CASE
            WHEN chattbm_auth_rate_limits.expires_at <= NOW() THEN 1
            ELSE chattbm_auth_rate_limits.request_count + 1
        END,
        window_started_at = CASE
            WHEN chattbm_auth_rate_limits.expires_at <= NOW() THEN NOW()
            ELSE chattbm_auth_rate_limits.window_started_at
        END,
        expires_at = CASE
            WHEN chattbm_auth_rate_limits.expires_at <= NOW()
                THEN NOW() + ($2::bigint * INTERVAL '1 millisecond')
            ELSE chattbm_auth_rate_limits.expires_at
        END,
        updated_at = NOW()
    RETURNING request_count, window_started_at, expires_at
`;

const CLEANUP_EXPIRED_SQL = `
    WITH expired AS (
        SELECT bucket_key
        FROM chattbm_auth_rate_limits
        WHERE expires_at <= NOW()
        ORDER BY expires_at
        LIMIT $1
        FOR UPDATE SKIP LOCKED
    )
    DELETE FROM chattbm_auth_rate_limits AS buckets
    USING expired
    WHERE buckets.bucket_key = expired.bucket_key
    RETURNING buckets.bucket_key
`;

function createPostgresRateLimitStore({ query } = {}) {
    const execute = query || ((...args) => {
        const pool = getPool();
        if (!pool) throw new Error('Rate-limit database is not configured.');
        return pool.query(...args);
    });

    return {
        async cleanupExpired({ batchSize = 500 } = {}) {
            if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 5000) {
                throw new TypeError('batchSize must be an integer from 1 to 5000.');
            }
            const result = await execute(CLEANUP_EXPIRED_SQL, [batchSize]);
            return result && Array.isArray(result.rows) ? result.rows.length : 0;
        },
        async consume(key, windowMs) {
            if (typeof key !== 'string' || !key || key.length > 512) {
                throw new TypeError('Rate-limit key must be a non-empty string of at most 512 characters.');
            }
            if (!Number.isSafeInteger(windowMs) || windowMs < 1) {
                throw new TypeError('windowMs must be a positive safe integer.');
            }
            // Store only a one-way digest, never the caller's raw identifier.
            const bucketKey = crypto.createHash('sha256').update(key, 'utf8').digest('hex');
            const result = await execute(UPSERT_BUCKET_SQL, [bucketKey, windowMs]);
            const row = result && result.rows && result.rows[0];
            if (!row) throw new Error('Rate-limit storage returned no bucket.');
            return {
                count: Number(row.request_count),
                startedAt: new Date(row.window_started_at).getTime(),
                expiresAt: new Date(row.expires_at).getTime()
            };
        }
    };
}

module.exports = { createPostgresRateLimitStore, UPSERT_BUCKET_SQL, CLEANUP_EXPIRED_SQL };
