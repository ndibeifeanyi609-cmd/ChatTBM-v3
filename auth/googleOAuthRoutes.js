'use strict';

const express = require('express');
const { randomBytes, randomUUID } = require('node:crypto');
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
    const url = client().generateAuthUrl({
        access_type: 'online',
        scope: ['openid', 'email', 'profile'],
        state,
        prompt: 'select_account'
    });
    return res.redirect(url);
});

router.get('/callback', async (req, res, next) => {
    try {
        if (!configured()) {
            return res.status(503).send('Google sign-in is not configured yet.');
        }
        const stateCookie = req.cookies && req.cookies[COOKIE_STATE];
        res.clearCookie(COOKIE_STATE, { ...COOKIE_OPTIONS, maxAge: undefined });
        if (
            typeof req.query.state !== 'string' ||
            typeof stateCookie !== 'string' ||
            req.query.state.length !== stateCookie.length ||
            !require('node:crypto').timingSafeEqual(
                Buffer.from(req.query.state),
                Buffer.from(stateCookie)
            )
        ) {
            return res.status(400).send('Google sign-in state validation failed.');
        }
        if (typeof req.query.code !== 'string') {
            return res.status(401).send('Google sign-in was cancelled or denied.');
        }

        const { tokens } = await client().getToken(req.query.code);
        if (!tokens.id_token) {
            return res.status(401).send('Google did not return a verified identity.');
        }
        const ticket = await client().verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const profile = ticket.getPayload();
        if (
            !profile ||
            typeof profile.sub !== 'string' ||
            typeof profile.email !== 'string' ||
            profile.email_verified !== true
        ) {
            return res.status(401).send('A verified Google email is required.');
        }

        const db = database();
        const email = profile.email.trim().toLowerCase();
        const googleSub = profile.sub;
        const existingIdentity = await db.query(
            'SELECT u.id, u.email_normalized, u.disabled_at FROM chattbm_oauth_identities i JOIN chattbm_users u ON u.id = i.user_id WHERE i.provider = $1 AND i.provider_subject = $2',
            ['google', googleSub]
        );

        let user = existingIdentity.rows[0];
        if (!user) {
            const existingEmail = await db.query(
                'SELECT id, email_normalized, disabled_at FROM chattbm_users WHERE email_normalized = $1',
                [email]
            );
            if (existingEmail.rows[0]) {
                user = existingEmail.rows[0];
            } else {
                const id = randomUUID();
                const randomPassword = randomBytes(48).toString('base64url');
                const passwordHash = await hashPassword(randomPassword);
                const created = await db.query(
                    'INSERT INTO chattbm_users (id, email_normalized, password_hash, email_verified_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email_normalized, disabled_at',
                    [id, email, passwordHash]
                );
                user = created.rows[0];
            }
            await db.query(
                'INSERT INTO chattbm_oauth_identities (id, user_id, provider, provider_subject, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (provider, provider_subject) DO NOTHING',
                [randomUUID(), user.id, 'google', googleSub]
            );
        }

        if (!user || user.disabled_at) {
            return res.status(403).send('This ChatTBM account is unavailable.');
        }

        const token = createSessionToken();
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await db.query(
            'INSERT INTO chattbm_auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
            [randomUUID(), user.id, hashSessionToken(token), expiresAt]
        );
        res.cookie('chattbm_session', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            expires: expiresAt
        });
        return res.redirect(process.env.GOOGLE_LOGIN_SUCCESS_URL || 'https://chattbm.com/signin.html?google=success');
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
