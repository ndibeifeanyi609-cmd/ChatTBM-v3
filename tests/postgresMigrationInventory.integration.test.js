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

async function main() {
    const pool = new Pool({ connectionString });
    try {
        const identity = await pool.query(
            'SELECT current_database() AS database, inet_server_addr()::text AS server_address'
        );
        assert.equal(identity.rows[0].database, 'chattbm_test');
        console.log('Confirmed disposable database:', JSON.stringify(identity.rows[0]));

        const { initializeDatabase, closeDatabase } = require('../database/Postgres');
        await initializeDatabase();
        const afterBootstrap = await pool.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        console.log('Tables after existing startup bootstrap:',
            afterBootstrap.rows.map(row => row.tablename).join(', '));

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
        await closeDatabase();
    } finally {
        await pool.end();
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
