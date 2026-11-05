'use strict';

// Disposable PostgreSQL migration inventory. This never targets DATABASE_URL;
// it requires an explicit local CHATTBM_MIGRATION_TEST_URL and fixed test DB name.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const connectionString = process.env.CHATTBM_MIGRATION_TEST_URL;
function assertDisposableUrl(value) {
    assert.ok(value, 'CHATTBM_MIGRATION_TEST_URL is required');
    const url = new URL(value);
    assert.ok(['localhost', '127.0.0.1', '::1'].includes(url.hostname),
        'Refusing to connect unless PostgreSQL host is loopback');
    assert.equal(decodeURIComponent(url.pathname.slice(1)), 'chattbm_test',
        'Refusing to connect unless database name is exactly chattbm_test');
    if (process.env.DATABASE_URL && value === process.env.DATABASE_URL) {
        assert.ok(['localhost', '127.0.0.1', '::1'].includes(url.hostname));
        assert.equal(decodeURIComponent(url.pathname.slice(1)), 'chattbm_test');
    }
}
if (connectionString) {
    assertDisposableUrl(connectionString);
    process.env.DATABASE_URL = connectionString;
    process.env.NODE_ENV = 'test';
}

const migrationDir = path.join(__dirname, '..', 'database', 'migrations');
const migrationFiles = fs.readdirSync(migrationDir)
    .filter(name => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

let closeDatabase;

async function main() {
    const pool = new Pool({ connectionString });
    try {
        const identity = await pool.query(
            'SELECT current_database() AS database, inet_server_addr()::text AS server_address'
        );
        assert.equal(identity.rows[0].database, 'chattbm_test');
        console.log('Confirmed disposable database:', JSON.stringify(identity.rows[0]));

        const database = require('../database/Postgres');
        closeDatabase = database.closeDatabase;
        const { initializeDatabase } = database;
        await initializeDatabase();
        const afterBootstrap = await pool.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        console.log('Tables after existing startup bootstrap:',
            afterBootstrap.rows.map(row => row.tablename).join(', '));

        // Synthetic sentinel records verify legacy SQL replay does not rewrite existing data.
        // This is compatibility coverage only; it does not simulate or authorize baseline adoption.
        const sentinelUserId = 'migration-test-sentinel-user';
        const sentinelConversationId = 'migration-test-sentinel-conversation';
        const sentinelPayload = { marker: 'preserve-me', source: 'disposable-migration-test' };
        await pool.query(
            `INSERT INTO chattbm_users (id, email_normalized, password_hash)
             VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
            [sentinelUserId, 'migration-sentinel@example.invalid', 'synthetic-not-a-real-password-hash']
        );
        await pool.query(
            `INSERT INTO chattbm_conversations
             (id, user_id, conversation_key, version, lifecycle, created_at, updated_at, payload)
             VALUES ($1, $2, $3, 1, 'active', NOW(), NOW(), $4::jsonb)
             ON CONFLICT (id) DO NOTHING`,
            [sentinelConversationId, sentinelUserId, 'migration-sentinel-key', JSON.stringify(sentinelPayload)]
        );
        await pool.query(
            `INSERT INTO chattbm_chat_history (user_id, conversation_id, messages)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (user_id, conversation_id) DO NOTHING`,
            [sentinelUserId, sentinelConversationId, JSON.stringify([{ role: 'user', content: 'synthetic sentinel' }])]
        );
        const sentinelBefore = await pool.query(
            `SELECT u.id, u.email_normalized, c.payload,
                    h.messages
             FROM chattbm_users u
             JOIN chattbm_conversations c ON c.user_id = u.id
             JOIN chattbm_chat_history h ON h.user_id = u.id AND h.conversation_id = c.id
             WHERE u.id = $1 AND c.id = $2`,
            [sentinelUserId, sentinelConversationId]
        );
        assert.equal(sentinelBefore.rowCount, 1, 'Synthetic sentinel fixture must exist before SQL replay');

        const prefixes = migrationFiles.map(name => name.match(/^([0-9]+)_/)?.[1]).filter(Boolean);
        const duplicatePrefixes = [...new Set(prefixes.filter((prefix, i) => prefixes.indexOf(prefix) !== i))];
        console.log('Numbered SQL files:', migrationFiles.join(', '));
        console.log('Duplicate numeric prefixes:', duplicatePrefixes.length ? duplicatePrefixes.join(', ') : 'none');

        // Apply only to the loopback chattbm_test database, never production.
        for (const filename of migrationFiles) {
            const sql = fs.readFileSync(path.join(migrationDir, filename), 'utf8');
            await pool.query(sql);
        }
        console.log('All discovered SQL files applied once.');

        // Repeat to determine whether the current files are idempotent as a set.
        for (const filename of migrationFiles) {
            const sql = fs.readFileSync(path.join(migrationDir, filename), 'utf8');
            await pool.query(sql);
        }
        console.log('All discovered SQL files applied twice.');

        const sentinelAfter = await pool.query(
            `SELECT u.id, u.email_normalized, c.payload,
                    h.messages
             FROM chattbm_users u
             JOIN chattbm_conversations c ON c.user_id = u.id
             JOIN chattbm_chat_history h ON h.user_id = u.id AND h.conversation_id = c.id
             WHERE u.id = $1 AND c.id = $2`,
            [sentinelUserId, sentinelConversationId]
        );
        assert.equal(sentinelAfter.rowCount, 1, 'Synthetic sentinel record must survive SQL replay');
        assert.deepEqual(sentinelAfter.rows[0], sentinelBefore.rows[0],
            'Synthetic sentinel values must remain unchanged after SQL replay');
        console.log('Synthetic sentinel records preserved across repeated legacy SQL application.');


        const tables = await pool.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        const ledgerCandidates = tables.rows.map(row => row.tablename).filter(name =>
            /schema.?migrations|knex_migrations|sequelize.?meta|pgmigrations|migration.?history/i.test(name)
        );
        console.log('Migration-ledger-like tables:', ledgerCandidates.length ? ledgerCandidates.join(', ') : 'none found in this disposable database');

        const expected = [
            'chattbm_users',
            'chattbm_auth_sessions',
            'chattbm_chat_history',
            'chattbm_contexts',
            'chattbm_google_oauth_states',
            'chattbm_password_reset_tokens',
            'chattbm_auth_rate_limits'
        ];
        const actual = new Set(tables.rows.map(row => row.tablename));
        for (const table of expected) {
            assert.ok(actual.has(table), 'Expected table missing after bootstrap + migrations: ' + table);
        }

        const userColumns = await pool.query(
            "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_users' ORDER BY ordinal_position"
        );
        console.log('chattbm_users columns after both paths:',
            userColumns.rows.map(row => row.column_name + (row.is_nullable === 'NO' ? ' NOT NULL' : '')).join(', '));
        console.log('PASS: disposable migration inventory and repeat-application check completed.');
    } finally {
        try {
            if (closeDatabase) await closeDatabase();
        } finally {
            await pool.end();
        }
    }
}

if (!connectionString) {
    console.log('SKIP: set CHATTBM_MIGRATION_TEST_URL to a disposable local chattbm_test database.');
} else {
    main().catch(error => {
        console.error('FAIL: disposable migration inventory:', error.message);
        process.exitCode = 1;
    });
}
