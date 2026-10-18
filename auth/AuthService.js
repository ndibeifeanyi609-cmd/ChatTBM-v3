'use strict';

const { randomUUID } = require('node:crypto');
const { getPool } = require('../database/Postgres');
const {
    normalizeEmail,
    hashPassword,
    verifyPassword,
    validatePassword,
    createSessionToken,
    hashSessionToken
} = require('./AuthCrypto');

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function database() {
    const pool = getPool();
    if (!pool) {
        const error = new Error('Authentication database is unavailable.');
        error.code = 'AUTH_DATABASE_UNAVAILABLE';
        throw error;
    }
    return pool;
}

function validEmail(email) {
    return typeof email === 'string' &&
        email.length <= 254 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(emailInput, password) {
    const email = normalizeEmail(emailInput);
    if (!validEmail(email) || !validatePassword(password)) {
        return {
            success: false,
            code: 'INVALID_REGISTRATION',
            error: 'Enter a valid email and a password of at least 12 characters.'
        };
    }

    const passwordHash = await hashPassword(password);
    const id = randomUUID();
    try {
        const result = await database().query(
            'INSERT INTO chattbm_users (id, email_normalized, password_hash) VALUES ($1, $2, $3) RETURNING id, email_normalized, created_at',
            [id, email, passwordHash]
        );
        return { success: true, user: result.rows[0] };
    } catch (error) {
        if (error.code === '23505') {
            return {
                success: false,
                code: 'REGISTRATION_UNAVAILABLE',
                error: 'Unable to create account with those details.'
            };
        }
        throw error;
    }
}

async function login(emailInput, password) {
    const email = normalizeEmail(emailInput);
    const result = await database().query(
        'SELECT id, email_normalized, password_hash, disabled_at FROM chattbm_users WHERE email_normalized = $1',
        [email]
    );
    const user = result.rows[0];
    const matches = await verifyPassword(
        typeof password === 'string' ? password : '',
        user ? user.password_hash : 'invalid-hash'
    );

    if (!user || !matches || user.disabled_at) {
        return {
            success: false,
            code: 'INVALID_CREDENTIALS',
            error: 'Email or password is incorrect.'
        };
    }

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await database().query(
        'INSERT INTO chattbm_auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
        [randomUUID(), user.id, tokenHash, expiresAt]
    );

    return {
        success: true,
        user: { id: user.id, email: user.email_normalized },
        token,
        expiresAt
    };
}

async function authenticateSession(token) {
    if (typeof token !== 'string') return null;
    let tokenHash;
    try {
        tokenHash = hashSessionToken(token);
    } catch (_) {
        return null;
    }

    const result = await database().query(
        'SELECT u.id, u.email_normalized FROM chattbm_auth_sessions s JOIN chattbm_users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW() AND u.disabled_at IS NULL',
        [tokenHash]
    );
    if (!result.rows.length) return null;
    return { id: result.rows[0].id, email: result.rows[0].email_normalized };
}

async function revokeSession(token) {
    if (typeof token !== 'string') return false;
    let tokenHash;
    try {
        tokenHash = hashSessionToken(token);
    } catch (_) {
        return false;
    }
    const result = await database().query(
        'UPDATE chattbm_auth_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL RETURNING id',
        [tokenHash]
    );
    return result.rowCount > 0;
}

module.exports = {
    register,
    login,
    authenticateSession,
    revokeSession,
    SESSION_TTL_MS
};
