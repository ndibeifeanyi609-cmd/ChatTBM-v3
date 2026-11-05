'use strict';

const { randomUUID, createHash, randomBytes } = require('node:crypto');
const { getPool } = require('../database/Postgres');
const { normalizeEmail } = require('./AuthCrypto');

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

function hashVerificationToken(token) {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}

async function createEmailVerification(emailInput) {
    const email = normalizeEmail(emailInput);
    if (typeof email !== 'string' || email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

    const pool = database();
    const found = await pool.query(
        'SELECT id, email_normalized, email_verified_at FROM chattbm_users WHERE email_normalized = $1 AND disabled_at IS NULL',
        [email]
    );
    const user = found.rows[0];
    if (!user || user.email_verified_at) return null;

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const locked = await client.query(
            'SELECT id, email_verified_at FROM chattbm_users WHERE id = $1 AND disabled_at IS NULL FOR UPDATE',
            [user.id]
        );
        if (!locked.rows.length || locked.rows[0].email_verified_at) {
            await client.query('ROLLBACK');
            return null;
        }
        await client.query(
            'UPDATE chattbm_email_verification_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [user.id]
        );
        await client.query(
            'INSERT INTO chattbm_email_verification_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
            [randomUUID(), user.id, hashVerificationToken(token), expiresAt]
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

async function redeemEmailVerification(token) {
    if (typeof token !== 'string' || token.length < 32 || token.length > 256) {
        return { success: false };
    }

    const pool = database();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const selected = await client.query(
            'SELECT t.id, t.user_id FROM chattbm_email_verification_tokens t JOIN chattbm_users u ON u.id = t.user_id WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > NOW() AND u.disabled_at IS NULL FOR UPDATE OF t, u',
            [hashVerificationToken(token)]
        );
        const verification = selected.rows[0];
        if (!verification) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        const consumed = await client.query(
            'UPDATE chattbm_email_verification_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL AND expires_at > NOW() RETURNING user_id',
            [verification.id]
        );
        if (!consumed.rows.length) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        const updated = await client.query(
            'UPDATE chattbm_users SET email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW() WHERE id = $1 AND disabled_at IS NULL RETURNING id',
            [verification.user_id]
        );
        if (!updated.rows.length) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        await client.query(
            'UPDATE chattbm_email_verification_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
            [verification.user_id]
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

module.exports = {
    createEmailVerification,
    redeemEmailVerification,
    hashVerificationToken,
    TOKEN_TTL_MS
};
