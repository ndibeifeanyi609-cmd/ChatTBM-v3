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

test('email verification migration and token lifecycle work in disposable PostgreSQL', {
    skip: !isDisposableDatabase(process.env.DATABASE_URL)
}, async t => {
    const connectionString = process.env.DATABASE_URL;
    assert.ok(isDisposableDatabase(connectionString),
        'Refusing to run unless DATABASE_URL targets local chattbm_test.');

    await database.initializeDatabase();
    const pool = database.getPool();
    assert.ok(pool);

    t.after(async () => database.closeDatabase());

    const migration = fs.readFileSync(
        path.join(__dirname, '..', 'database', 'migrations', '006_email_verification_tokens.sql'),
        'utf8'
    );
    await pool.query(migration);
    await pool.query(migration);

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
