'use strict';

const express = require('express');
const {
    randomBytes, randomUUID, timingSafeEqual
} = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const { getPool } = require('../database/Postgres');
const {
    hashPassword,
    createSessionToken,
    hashSessionToken
} = require('./AuthCrypto');

const router = express.Router();
const COOKIE_STATE = 'chattbm_google_oauth_state';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/auth/google',
    maxAge: 10 * 60 * 1000
};
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function configured() {
    return Boolean(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REDIRECT_URI
    );
}

function client() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

function database() {
    const pool = getPool();
    if (!pool) throw new Error('Authentication database is unavailable.');
    return pool;
}

router.get('/', (req, res) => {
    if (!configured()) {
        return res.status(503).send('Google sign-in is not configured yet.');
    }
    const state = randomBytes(32).toString('base64url');
    res.cookie(COOKIE_STATE, state, COOKIE_OPTIONS);
    return res.redirect(client().generateAuthUrl({
        access_type: 'online',
        scope: ['openid', 'email', 'profile'],
        response_type: 'code',
        state,
        prompt: 'select_account'
    }));
});

router.get('/callback', async (req, res, next) => {
    let db;
    let transactionOpen = false;
    try {
        if (!configured()) {
            return res.status(503).send('Google sign-in is not configured yet.');
        }

        const stateCookie = req.cookies && req.cookies[COOKIE_STATE];
        res.clearCookie(COOKIE_STATE, {
            httpOnly: true, secure: true, sameSite: 'lax',
            path: '/api/auth/google'
        });
        const state = req.query.state;
        if (
            typeof state !== 'string' ||
            typeof stateCookie !== 'string' ||
            state.length !== stateCookie.length ||
            !timingSafeEqual(Buffer.from(state), Buffer.from(stateCookie))
        ) {
            return res.status(400).send('Google sign-in state validation failed.');
        }
        if (typeof req.query.code !== 'string') {
            return res.status(401).send('Google sign-in was cancelled or denied.');
        }

        const oauthClient = client();
        const { tokens } = await oauthClient.getToken(req.query.code);
        if (!tokens.id_token) {
            return res.status(401).send('Google did not return a verified identity.');
        }
        const ticket = await oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const profile = ticket.getPayload();
        if (
            !profile ||
            typeof profile.sub !== 'string' ||
            !profile.sub ||
            typeof profile.email !== 'string' ||
            !profile.email.trim() ||
            profile.email_verified !== true
        ) {
            return res.status(401).send('A verified Google email is required.');
        }

        db = await database().connect();
        await db.query('BEGIN');
        transactionOpen = true;

        const email = profile.email.trim().toLowerCase();
        const googleSub = profile.sub;
        const identity = await db.query(
            'SELECT u.id, u.email_normalized, u.disabled_at FROM chattbm_oauth_identities i JOIN chattbm_users u ON u.id = i.user_id WHERE i.provider = $1 AND i.provider_subject = $2 FOR UPDATE OF u',
            ['google', googleSub]
        );

        let user = identity.rows[0];
        if (!user) {
            const existingEmail = await db.query(
                'SELECT id FROM chattbm_users WHERE email_normalized = $1',
                [email]
            );
            if (existingEmail.rows[0]) {
                await db.query('ROLLBACK');
                transactionOpen = false;
                return res.status(409).send(
                    'A ChatTBM account already uses this email. Sign in with that account before linking Google.'
                );
            }

            const passwordHash = await hashPassword(
                randomBytes(48).toString('base64url')
            );
            const created = await db.query(
                'INSERT INTO chattbm_users (id, email_normalized, password_hash, email_verified_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email_normalized, disabled_at',
                [randomUUID(), email, passwordHash]
            );
            user = created.rows[0];

            await db.query(
                'INSERT INTO chattbm_oauth_identities (id, user_id, provider, provider_subject, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [randomUUID(), user.id, 'google', googleSub]
            );
        }

        if (!user || user.disabled_at) {
            await db.query('ROLLBACK');
            transactionOpen = false;
            return res.status(403).send('This ChatTBM account is unavailable.');
        }

        const token = createSessionToken();
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await db.query(
            'INSERT INTO chattbm_auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
            [randomUUID(), user.id, hashSessionToken(token), expiresAt]
        );
        await db.query('COMMIT');
        transactionOpen = false;

        res.cookie('chattbm_session', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            expires: expiresAt
        });
        return res.redirect(
            process.env.GOOGLE_LOGIN_SUCCESS_URL ||
            'https://chattbm.com/signin.html?google=success'
        );
    } catch (error) {
        if (transactionOpen && db) {
            try { await db.query('ROLLBACK'); } catch (_) {}
        }
        if (error && error.code === '23505') {
            return res.status(409).send(
                'A ChatTBM account already exists for this Google identity or email. Please sign in and try again.'
            );
        }
        return next(error);
    } finally {
        if (db) db.release();
    }
});

module.exports = router;
