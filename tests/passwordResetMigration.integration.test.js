'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

function isDisposableDatabase(value) {
    if (process.env.PASSWORD_RESET_MIGRATION_ALLOW_DESTRUCTIVE_TESTS !== 'true') return false;
    if (!value) return false;
    try {
        const url = new URL(value);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
            && decodeURIComponent(url.pathname.slice(1)) === 'chattbm_test';
    } catch (_) {
        return false;
    }
}

test('password-reset migration creates token storage safely and is repeatable', {
    skip: !isDisposableDatabase(process.env.DATABASE_URL)
}, async t => {
    const connectionString = process.env.DATABASE_URL;
    assert.ok(isDisposableDatabase(connectionString),
        'Refusing to run unless DATABASE_URL targets local chattbm_test and explicit opt-in is set.');

    const pool = new Pool({ connectionString });
    t.after(async () => pool.end());

    // This reset is permitted only in the explicitly guarded disposable CI database.
    await pool.query('DROP TABLE IF EXISTS chattbm_password_reset_tokens CASCADE');
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

    const migration = fs.readFileSync(
        path.join(__dirname, '..', 'database', 'migrations', '004_password_reset_tokens.sql'),
        'utf8'
    );
    await pool.query(migration);
    await pool.query(migration);

    const columnsResult = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_password_reset_tokens'"
    );
    const columns = new Set(columnsResult.rows.map(row => row.column_name));
    for (const name of ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']) {
        assert.ok(columns.has(name), 'Missing migration column: ' + name);
    }

    const indexes = await pool.query(
        "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'chattbm_password_reset_tokens'"
    );
    const indexNames = new Set(indexes.rows.map(row => row.indexname));
    assert.ok(indexNames.has('chattbm_password_reset_tokens_user_created_idx'));
    assert.ok(indexNames.has('chattbm_password_reset_tokens_expires_idx'));

    const userId = crypto.randomUUID();
    const tokenId = crypto.randomUUID();
    try {
        await pool.query(
            'INSERT INTO chattbm_users (id, email_normalized, password_hash) VALUES ($1, $2, $3)',
            [userId, userId + '@example.com', 'integration-test-hash']
        );
        await pool.query(
            'INSERT INTO chattbm_password_reset_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'15 minutes\')',
            [tokenId, userId, crypto.createHash('sha256').update(tokenId).digest('hex')]
        );
        const saved = await pool.query(
            'SELECT user_id, token_hash, used_at FROM chattbm_password_reset_tokens WHERE id = $1',
            [tokenId]
        );
        assert.equal(saved.rowCount, 1);
        assert.equal(saved.rows[0].user_id, userId);
        assert.equal(saved.rows[0].used_at, null);
        assert.notEqual(saved.rows[0].token_hash, tokenId);

        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
        const cascaded = await pool.query(
            'SELECT 1 FROM chattbm_password_reset_tokens WHERE id = $1',
            [tokenId]
        );
        assert.equal(cascaded.rowCount, 0, 'user deletion should cascade to reset tokens');
    } finally {
        await pool.query('DELETE FROM chattbm_password_reset_tokens WHERE id = $1', [tokenId]);
        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
    }
});
