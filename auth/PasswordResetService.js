'use strict';

const { randomUUID, createHash, randomBytes } = require('node:crypto');
const { getPool } = require('../database/Postgres');
const {
    normalizeEmail,
    validatePassword,
    hashPassword,
    hashSessionToken
} = require('./AuthCrypto');

const RESET_TTL_MS = 30 * 60 * 1000;

function database() {
    const pool = getPool();
    if (!pool) {
        const error = new Error('Authentication database is unavailable.');
        error.code = 'AUTH_DATABASE_UNAVAILABLE';
        throw error;
    }
    return pool;
}

function hashResetToken(token) {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

async function requestPasswordReset(emailInput) {
    const email = normalizeEmail(emailInput);
    // Always return the same public result to avoid account enumeration.
    const generic = { success: true };
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return generic;
    }

    const pool = database();
    const found = await pool.query(
        'SELECT id, email_normalized FROM chattbm_users WHERE email_normalized = $1 AND disabled_at IS NULL',
        [email]
    );
    if (!found.rows.length) return generic;

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await pool.query(
        'UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [found.rows[0].id]
    );
    await pool.query(
        'INSERT INTO chattbm_password_reset_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
        [randomUUID(), found.rows[0].id, tokenHash, expiresAt]
    );

    return {
        success: true,
        delivery: {
            email: found.rows[0].email_normalized,
            userId: found.rows[0].id,
            token: rawToken,
            expiresAt
        }
    };
}

async function resetPassword(token, newPassword) {
    if (typeof token !== 'string' || token.length < 32 || token.length > 256) {
        return { success: false, error: 'This reset link is invalid or expired.' };
    }
    if (!validatePassword(newPassword)) {
        return { success: false, error: 'Password must contain at least 12 characters.' };
    }

    const pool = database();
    const tokenHash = hashResetToken(token);
    const passwordHash = await hashPassword(newPassword);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            'SELECT id, user_id FROM chattbm_password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE',
            [tokenHash]
        );
        if (!result.rows.length) {
            await client.query('ROLLBACK');
            return { success: false, error: 'This reset link is invalid or expired.' };
        }
        const row = result.rows[0];
        await client.query(
            'UPDATE chattbm_users SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND disabled_at IS NULL',
            [passwordHash, row.user_id]
        );
        await client.query(
            'UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [row.user_id]
        );
        await client.query(
            'UPDATE chattbm_auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
            [row.user_id]
        );
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { requestPasswordReset, resetPassword, RESET_TTL_MS };
