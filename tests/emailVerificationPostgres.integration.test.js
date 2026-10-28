'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const database = require('../database/Postgres');

function isDisposableDatabase(value) {
    if (!value) return false;
    try {
        const url = new URL(value);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
            && decodeURIComponent(url.pathname.slice(1)) === 'chattbm_test';
    } catch (_) {
        return false;
    }
}

test('email verification migration upgrades a legacy user table and token lifecycle works', {
    skip: !isDisposableDatabase(process.env.DATABASE_URL)
}, async t => {
    const connectionString = process.env.DATABASE_URL;
    assert.ok(isDisposableDatabase(connectionString),
        'Refusing to run unless DATABASE_URL targets local chattbm_test.');

    const pool = database.getPool();
    assert.ok(pool);
    t.after(async () => database.closeDatabase());

    // This test intentionally resets tables only in the guarded disposable database.
    // Model an existing deployment whose users table predates email verification.
    await pool.query('DROP TABLE IF EXISTS chattbm_email_verification_tokens CASCADE');
    await pool.query('DROP TABLE IF EXISTS chattbm_users CASCADE');
    await pool.query(`
        CREATE TABLE chattbm_users (
            id TEXT PRIMARY KEY,
            email_normalized TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            disabled_at TIMESTAMPTZ
        )
    `);

    const before = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_users' AND column_name = 'email_verified_at'"
    );
    assert.equal(before.rowCount, 0, 'Legacy schema unexpectedly already has email_verified_at.');

    const migration = fs.readFileSync(
        path.join(__dirname, '..', 'database', 'migrations', '006_email_verification_tokens.sql'),
        'utf8'
    );
    await pool.query(migration);
    await pool.query(migration);

    const userColumns = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_users'"
    );
    assert.ok(userColumns.rows.some(row => row.column_name === 'email_verified_at'),
        'Migration did not add email_verified_at to the legacy users table.');

    const columnsResult = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_email_verification_tokens'"
    );
    const columns = new Set(columnsResult.rows.map(row => row.column_name));
    for (const name of ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']) {
        assert.ok(columns.has(name), 'Missing migration column: ' + name);
    }

    const userId = crypto.randomUUID();
    const email = 'verify-' + userId + '@example.com';
    try {
        await pool.query(
            'INSERT INTO chattbm_users (id, email_normalized, password_hash) VALUES ($1, $2, $3)',
            [userId, email, 'integration-test-hash']
        );

        const { createEmailVerification, redeemEmailVerification, hashVerificationToken } =
            require('../auth/EmailVerificationService');

        const issued = await createEmailVerification(email);
        assert.ok(issued);
        const saved = await pool.query(
            'SELECT token_hash, used_at, expires_at FROM chattbm_email_verification_tokens WHERE user_id = $1',
            [userId]
        );
        assert.equal(saved.rowCount, 1);
        assert.equal(saved.rows[0].token_hash, hashVerificationToken(issued.token));
        assert.notEqual(saved.rows[0].token_hash, issued.token);
        assert.equal(saved.rows[0].used_at, null);
        assert.ok(saved.rows[0].expires_at > new Date());

        assert.deepEqual(await redeemEmailVerification(issued.token), { success: true });
        assert.deepEqual(await redeemEmailVerification(issued.token), { success: false });

        const user = await pool.query(
            'SELECT email_verified_at FROM chattbm_users WHERE id = $1',
            [userId]
        );
        assert.ok(user.rows[0].email_verified_at);
    } finally {
        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
    }
});
