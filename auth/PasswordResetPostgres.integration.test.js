'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const postgres = require('../database/Postgres');
const { requestPasswordReset, resetPassword } = require('./PasswordResetService');
const { hashPassword, verifyPassword, createSessionToken, hashSessionToken } = require('./AuthCrypto');

test('password reset works against real PostgreSQL', { skip: !process.env.DATABASE_URL }, async () => {
    await postgres.initializeDatabase();
    const pool = postgres.getPool();
    const userId = randomUUID();
    const email = 'password-reset-' + userId + '@example.test';
    const sessionId = randomUUID();
    const sessionToken = createSessionToken();

    try {
        await pool.query(
            'INSERT INTO chattbm_users (id, email_normalized, password_hash) VALUES ($1, $2, $3)',
            [userId, email, await hashPassword('old-password-value-123')]
        );
        await pool.query(
            'INSERT INTO chattbm_auth_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'1 hour\')',
            [sessionId, userId, hashSessionToken(sessionToken)]
        );

        const issued = await requestPasswordReset(email);
        assert.equal(issued.success, true);
        assert.equal(issued.delivery.email, email);

        const stored = await pool.query(
            'SELECT token_hash, expires_at, used_at FROM chattbm_password_reset_tokens WHERE user_id = $1',
            [userId]
        );
        assert.equal(stored.rows.length, 1);
        assert.notEqual(stored.rows[0].token_hash, issued.delivery.token);
        assert.ok(stored.rows[0].expires_at > new Date());

        const changed = await resetPassword(issued.delivery.token, 'new-password-value-456');
        assert.deepEqual(changed, { success: true });

        const user = await pool.query('SELECT password_hash FROM chattbm_users WHERE id = $1', [userId]);
        assert.equal(await verifyPassword('new-password-value-456', user.rows[0].password_hash), true);
        assert.equal(await verifyPassword('old-password-value-123', user.rows[0].password_hash), false);

        const session = await pool.query('SELECT revoked_at FROM chattbm_auth_sessions WHERE id = $1', [sessionId]);
        assert.ok(session.rows[0].revoked_at);

        const reused = await resetPassword(issued.delivery.token, 'another-password-value-789');
        assert.equal(reused.success, false);

        const expired = await requestPasswordReset(email);
        await pool.query(
            'UPDATE chattbm_password_reset_tokens SET expires_at = NOW() - INTERVAL \'1 minute\' WHERE user_id = $1 AND used_at IS NULL',
            [userId]
        );
        const expiredResult = await resetPassword(expired.delivery.token, 'expired-password-value-000');
        assert.equal(expiredResult.success, false);
    } finally {
        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
        await postgres.closeDatabase();
    }
});
