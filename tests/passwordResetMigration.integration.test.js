'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

function isDisposableTestDatabase(value) {
    if (!value) return false;
    try {
        const url = new URL(value);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
            && decodeURIComponent(url.pathname.slice(1)) === 'chattbm_test';
    } catch (_) {
        return false;
    }
}

test('password-reset migration 004 is repeatable and enforces token integrity', {
    skip: !isDisposableTestDatabase(connectionString)
}, async t => {
    if (!isDisposableTestDatabase(connectionString)) {
        throw new Error('Refusing migration 004 integration test: DATABASE_URL must target local chattbm_test.');
    }

    const pool = new Pool({ connectionString });
    t.after(async () => pool.end());

    // This minimal prerequisite exists only in the disposable CI database.
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chattbm_users (
            id TEXT PRIMARY KEY
        )
    `);

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '004_password_reset_tokens.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSql);
    await pool.query(migrationSql);

    const schema = await pool.query(`
        SELECT column_name, is_nullable, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'chattbm_password_reset_tokens'
    `);
    const columns = new Map(schema.rows.map(row => [row.column_name, row]));
    for (const column of ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']) {
        assert.ok(columns.has(column), `missing migration column: ${column}`);
    }
    for (const column of ['id', 'user_id', 'token_hash', 'created_at', 'expires_at']) {
        assert.equal(columns.get(column).is_nullable, 'NO', `${column} should be NOT NULL`);
    }

    const indexes = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'chattbm_password_reset_tokens'
    `);
    const indexNames = new Set(indexes.rows.map(row => row.indexname));
    for (const index of [
        'chattbm_password_reset_tokens_pkey',
        'chattbm_password_reset_tokens_token_hash_key',
        'chattbm_password_reset_tokens_user_created_idx',
        'chattbm_password_reset_tokens_expires_idx'
    ]) {
        assert.ok(indexNames.has(index), `missing migration index/constraint: ${index}`);
    }

    const foreignKey = await pool.query(`
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.constraint_schema = kcu.constraint_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.constraint_schema = tc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = 'chattbm_password_reset_tokens'
          AND kcu.column_name = 'user_id'
          AND ccu.table_name = 'chattbm_users'
          AND ccu.column_name = 'id'
    `);
    assert.equal(foreignKey.rowCount, 1, 'user_id should reference chattbm_users(id)');

    const userId = `migration-004-test-${crypto.randomUUID()}`;
    const tokenId = `reset-token-${crypto.randomUUID()}`;
    const tokenHash = crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');

    try {
        await pool.query('INSERT INTO chattbm_users (id) VALUES ($1)', [userId]);
        await pool.query(
            `INSERT INTO chattbm_password_reset_tokens (id, user_id, token_hash, expires_at)
             VALUES ($1, $2, $3, NOW() + INTERVAL '30 minutes')`,
            [tokenId, userId, tokenHash]
        );

        await assert.rejects(
            pool.query(
                `INSERT INTO chattbm_password_reset_tokens (id, user_id, token_hash, expires_at)
                 VALUES ($1, $2, $3, NOW() + INTERVAL '30 minutes')`,
                [`duplicate-${tokenId}`, userId, tokenHash]
            ),
            error => error.code === '23505'
        );

        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
        const cascaded = await pool.query(
            'SELECT 1 FROM chattbm_password_reset_tokens WHERE id = $1',
            [tokenId]
        );
        assert.equal(cascaded.rowCount, 0, 'deleting a user should cascade-delete reset tokens');
    } finally {
        await pool.query('DELETE FROM chattbm_password_reset_tokens WHERE id = $1', [tokenId]);
        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]);
    }
});
