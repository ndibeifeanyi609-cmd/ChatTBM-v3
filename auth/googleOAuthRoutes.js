'use strict';

const express = require('express');
const {
    createHash, randomBytes, randomUUID
} = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const { getPool } = require('../database/Postgres');
const {
    hashPassword,
    createSessionToken,
    hashSessionToken
} = require('./AuthCrypto');
const { authenticateSession } = require('./AuthService');

const router = express.Router();
const SESSION_COOKIE = 'chattbm_session';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const HANDOFF_TTL_MS = 2 * 60 * 1000;

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

function hashOAuthState(state) {
    return createHash('sha256').update(state, 'utf8').digest('hex');
}

async function createOAuthState(linkUserId = null) {
    const state = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);
    await database().query(
        'INSERT INTO chattbm_google_oauth_states (state_hash, link_user_id, expires_at) VALUES ($1, $2, $3)',
        [hashOAuthState(state), linkUserId, expiresAt]
    );
    return state;
}

router.get('/', async (req, res, next) => {
    if (!configured()) {
        return res.status(503).send('Google sign-in is not configured yet.');
    }
    try {
        const state = await createOAuthState();
        return res.redirect(client().generateAuthUrl({
        access_type: 'online',
        scope: ['openid', 'email', 'profile'],
        response_type: 'code',
        state,
        prompt: 'select_account'
        }));
    } catch (error) {
        return next(error);
    }
});

router.get('/link', async (req, res, next) => {
    try {
        if (!configured()) {
            return res.status(503).send('Google sign-in is not configured yet.');
        }
        const token = req.cookies && req.cookies[SESSION_COOKIE];
        const user = await authenticateSession(token);
        if (!user) {
            return res.status(401).send('Sign in to your existing ChatTBM account before linking Google.');
        }
        const state = await createOAuthState(user.id);
        return res.redirect(client().generateAuthUrl({
            access_type: 'online',
            scope: ['openid', 'email', 'profile'],
            response_type: 'code',
            state,
            prompt: 'select_account'
        }));
    } catch (error) {
        return next(error);
    }
});

router.post('/link', async (req, res, next) => {
    try {
        if (!configured()) {
            return res.status(503).send('Google sign-in is not configured yet.');
        }
        const origin = req.get('origin');
        if (origin && origin !== 'https://chattbm.com' && origin !== 'https://www.chattbm.com') {
            return res.status(403).send('This request origin is not allowed.');
        }
        const token = req.body && req.body.sessionToken;
        const user = await authenticateSession(token);
        if (!user) {
            return res.status(401).send('Your ChatTBM session expired. Sign in again before linking Google.');
        }
        const state = await createOAuthState(user.id);
        return res.json({ success: true, url: client().generateAuthUrl({
            access_type: 'online',
            scope: ['openid', 'email', 'profile'],
            response_type: 'code',
            state,
            prompt: 'select_account'
        }) });
    } catch (error) {
        return next(error);
    }
});

router.post('/session-handoff', async (req, res, next) => {
    try {
        const code = req.body && req.body.code;
        if (typeof code !== 'string' || code.length < 32 || code.length > 256) {
            return res.status(400).json({ success: false, error: { message: 'Invalid or expired Google sign-in handoff.' } });
        }
        const consumed = await database().query(
            'DELETE FROM chattbm_google_oauth_handoffs WHERE handoff_hash = $1 AND expires_at > NOW() RETURNING user_id',
            [hashOAuthState(code)]
        );
        if (!consumed.rows.length) {
            return res.status(401).json({ success: false, error: { message: 'Google sign-in handoff expired. Please try again.' } });
        }
        const user = await database().query(
            'SELECT id, email_normalized AS email FROM chattbm_users WHERE id = $1 AND disabled_at IS NULL',
            [consumed.rows[0].user_id]
        );
        if (!user.rows.length) {
            return res.status(401).json({ success: false, error: { message: 'This ChatTBM account is unavailable.' } });
        }
        const token = createSessionToken();
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await database().query(
            'INSERT INTO chattbm_auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
            [randomUUID(), user.rows[0].id, hashSessionToken(token), expiresAt]
        );
        return res.json({ success: true, user: user.rows[0], token, expiresAt });
    } catch (error) {
        return next(error);
    }
});

router.get('/callback', async (req, res, next) => {
    let db;
    let transactionOpen = false;
    try {
        if (!configured()) {
            return res.status(503).send('Google sign-in is not configured yet.');
        }

        const state = req.query.state;
        if (typeof state !== 'string' || state.length < 32 || state.length > 256) {
            return res.status(400).send('Google sign-in state validation failed.');
        }
        const consumedState = await database().query(
            'DELETE FROM chattbm_google_oauth_states WHERE state_hash = $1 AND expires_at > NOW() RETURNING link_user_id',
            [hashOAuthState(state)]
        );
        if (!consumedState.rows.length) {
            return res.status(400).send('Google sign-in state validation failed.');
        }
        const linkUserId = consumedState.rows[0].link_user_id;
        const linkMode = typeof linkUserId === 'string' && linkUserId.length > 0;
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
        const signedInUser = linkMode
            ? await db.query(
                'SELECT id, email_normalized AS email, disabled_at FROM chattbm_users WHERE id = $1 FOR UPDATE',
                [linkUserId]
            ).then(result => result.rows[0] || null)
            : null;

        if (linkMode && (!signedInUser || signedInUser.disabled_at || signedInUser.email !== email)) {
            await db.query('ROLLBACK');
            transactionOpen = false;
            return res.status(403).send(
                'To link Google, sign in to the existing ChatTBM account with the same verified email.'
            );
        }

        if (linkMode && user && user.id !== signedInUser.id) {
            await db.query('ROLLBACK');
            transactionOpen = false;
            return res.status(409).send(
                'This Google account is already linked to another ChatTBM account.'
            );
        }

        if (linkMode && !user) {
            user = { id: signedInUser.id, email_normalized: signedInUser.email, disabled_at: null };
            await db.query(
                'INSERT INTO chattbm_oauth_identities (id, user_id, provider, provider_subject, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [randomUUID(), user.id, 'google', googleSub]
            );
        }

        if (!user) {
            const existingEmail = await db.query(
                'SELECT id FROM chattbm_users WHERE email_normalized = $1',
                [email]
            );
            if (existingEmail.rows[0]) {
                await db.query('ROLLBACK');
                transactionOpen = false;
                return res.status(409).send(
                    'A ChatTBM account already uses this email. Sign in to that account, then use the Google link option.'
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

        const handoffCode = randomBytes(32).toString('base64url');
        const handoffExpiresAt = new Date(Date.now() + HANDOFF_TTL_MS);
        await db.query(
            'INSERT INTO chattbm_google_oauth_handoffs (handoff_hash, user_id, expires_at) VALUES ($1, $2, $3)',
            [hashOAuthState(handoffCode), user.id, handoffExpiresAt]
        );
        await db.query('COMMIT');
        transactionOpen = false;

        const frontend = process.env.GOOGLE_LOGIN_SUCCESS_URL || 'https://chattbm.com/auth/google-handoff.html';
        const separator = frontend.includes('?') ? '&' : '?';
        return res.redirect(frontend + separator + 'code=' + encodeURIComponent(handoffCode));
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
