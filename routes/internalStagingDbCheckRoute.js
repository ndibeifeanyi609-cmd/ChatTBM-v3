'use strict';

const express = require('express');
const crypto = require('crypto');
const { Client } = require('pg');

const router = express.Router();

router.get('/staging-db-check', async (req, res) => {
    const expected = process.env.STAGING_READONLY_CHECK_TOKEN || '';
    const supplied = req.get('x-staging-check-token') || '';
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);

    if (!expected) {
        return res.status(503).json({ success: false, error: 'check_not_configured' });
    }

    if (expectedBuffer.length !== suppliedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
        return res.status(404).json({ success: false });
    }

    const connectionString = process.env.STAGING_READONLY_DATABASE_URL;
    if (!connectionString) {
        return res.status(503).json({ success: false, error: 'check_not_configured' });
    }

    let parsed;
    try {
        parsed = new URL(connectionString);
    } catch (_) {
        return res.status(503).json({ success: false, error: 'check_not_configured' });
    }

    const databaseName = decodeURIComponent(parsed.pathname.slice(1));
    if (databaseName !== 'chattbm_staging_isolated') {
        return res.status(503).json({ success: false, error: 'database_target_mismatch' });
    }

    const internalHost = 'dpg-dbicflmc6qcc73d97u60-a';
    const externalHost = 'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com';
    if (parsed.hostname !== internalHost && parsed.hostname !== externalHost) {
        return res.status(503).json({ success: false, error: 'host_target_mismatch' });
    }

    // Same-region Render services use the private internal URL, which does not
    // require TLS. External connections retain strict certificate verification.
    const isInternalConnection = parsed.hostname === internalHost;
    const databaseCa = process.env.STAGING_READONLY_DATABASE_CA || '';
    if (!isInternalConnection && !databaseCa.trim()) {
        return res.status(503).json({ success: false, error: 'tls_ca_not_configured' });
    }

    const client = new Client({
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: databaseName,
        ssl: isInternalConnection ? false : {
            ca: databaseCa,
            rejectUnauthorized: true,
            servername: parsed.hostname
        },
        connectionTimeoutMillis: 8000,
        statement_timeout: 5000
    });

    try {
        await client.connect();
        await client.query('BEGIN READ ONLY');
        const identity = await client.query('SELECT current_database() AS database_name');
        if (identity.rows[0]?.database_name !== 'chattbm_staging_isolated') {
            await client.query('ROLLBACK');
            return res.status(503).json({ success: false, error: 'database_identity_mismatch' });
        }

        const expectedApplicationTables = [
            'chattbm_auth_rate_limits',
            'chattbm_auth_sessions',
            'chattbm_chat_history',
            'chattbm_contexts',
            'chattbm_conversations',
            'chattbm_google_oauth_handoffs',
            'chattbm_google_oauth_states',
            'chattbm_memories',
            'chattbm_oauth_identities',
            'chattbm_password_reset_tokens',
            'chattbm_users'
        ];
        const expectedMigrationTables = [
            'chattbm_users',
            'chattbm_auth_sessions',
            'chattbm_oauth_identities',
            'chattbm_google_oauth_states',
            'chattbm_password_reset_tokens',
            'chattbm_auth_rate_limits'
        ];

        const tables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
              AND left(table_name, 8) = 'chattbm_'
            ORDER BY table_name
        `);

        const presentTables = tables.rows.map(row => row.table_name);
        const missingExpectedTables = expectedMigrationTables.filter(
            tableName => !presentTables.includes(tableName)
        );
        const missingExpectedApplicationTables = expectedApplicationTables.filter(
            tableName => !presentTables.includes(tableName)
        );
        const unexpectedApplicationTables = presentTables.filter(
            tableName => !expectedApplicationTables.includes(tableName)
        );

        const userCountResult = presentTables.includes('chattbm_users')
            ? await client.query('SELECT COUNT(*)::text AS row_count FROM public.chattbm_users')
            : null;
        const userRowCount = userCountResult?.rows[0]?.row_count ?? null;

        const columns = await client.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND left(table_name, 8) = 'chattbm_'
            ORDER BY table_name, ordinal_position
        `);

        const indexes = await client.query(`
            SELECT tablename AS table_name, indexname AS index_name, indexdef AS definition
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND left(tablename, 8) = 'chattbm_'
            ORDER BY tablename, indexname
        `);

        const constraints = await client.query(require('../database/stagingConstraintInventoryQuery'));

        await client.query('COMMIT');
        return res.json({
            success: true,
            database: identity.rows[0].database_name,
            readOnly: true,
            schema: {
                expectedApplicationTables,
                expectedMigrationTables,
                tables: presentTables,
                missingExpectedApplicationTables,
                unexpectedApplicationTables,
                missingExpectedTables,
                userRowCount,
                columns: columns.rows,
                indexes: indexes.rows,
                constraints: constraints.rows
            }
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        const code = typeof error?.code === 'string' &&
            /^[A-Z0-9_]{1,40}$/.test(error.code)
            ? error.code
            : 'NO_ERROR_CODE';
        const message = String(error?.message || '').toLowerCase();
        let category = 'other';
        if (/certificate|cert|hostname|altname|self.signed|issuer/.test(message)) category = 'tls';
        else if (/password|authentication|pg_hba/.test(message)) category = 'authentication';
        else if (/timeout|timed out/.test(message)) category = 'timeout';
        else if (/enotfound|eai_again|getaddrinfo|dns/.test(message)) category = 'dns';
        else if (/refused|econnrefused/.test(message)) category = 'refused';
        else if (/socket|eof|terminated|hang up|reset/.test(message)) category = 'socket';
        return res.status(503).json({
            success: false,
            error: 'connection_check_failed',
            diagnostic: code,
            category
        });
    } finally {
        await client.end().catch(() => {});
    }
});

module.exports = router;
