'use strict';

const { randomUUID, createHash, randomBytes } = require('node:crypto');
const { getPool } = require('../database/Postgres');
const { normalizeEmail, validatePassword, hashPassword } = require('./AuthCrypto');

const TOKEN_TTL_MS = 30 * 60 * 1000;

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

// Returns the raw token only to the trusted route for email delivery.
// The HTTP response must never include it.
async function createPasswordReset(emailInput) {
    const email = normalizeEmail(emailInput);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return null;
    }

    const pool = database();
    const found = await pool.query(
        'SELECT id, email_normalized FROM chattbm_users WHERE email_normalized = $1 AND disabled_at IS NULL',
        [email]
    );
    const user = found.rows[0];
    if (!user) return null;

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [user.id]
        );
        await client.query(
            'INSERT INTO chattbm_password_reset_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
            [randomUUID(), user.id, hashResetToken(token), expiresAt]
        );
        await client.query('COMMIT');
        return { email: user.email_normalized, token };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function redeemPasswordReset(token, newPassword) {
    if (typeof token !== 'string' || token.length < 32 || token.length > 256 ||
        !validatePassword(newPassword)) {
        return { success: false };
    }

    const pool = database();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const digest = hashResetToken(token);
        const selected = await client.query(
            'SELECT id, user_id FROM chattbm_password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE',
            [digest]
        );
        const reset = selected.rows[0];
        if (!reset) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        const passwordHash = await hashPassword(newPassword);
        const consumed = await client.query(
            'UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL AND expires_at > NOW() RETURNING user_id',
            [reset.id]
        );
        if (!consumed.rows.length) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        const updatedUser = await client.query(
            'UPDATE chattbm_users SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND disabled_at IS NULL RETURNING id',
            [passwordHash, reset.user_id]
        );
        if (!updatedUser.rows.length) {
            await client.query('ROLLBACK');
            return { success: false };
        }
        await client.query(
            'UPDATE chattbm_password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [reset.user_id]
        );
        await client.query(
            'UPDATE chattbm_auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
            [reset.user_id]
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

module.exports = { createPasswordReset, redeemPasswordReset, TOKEN_TTL_MS };
