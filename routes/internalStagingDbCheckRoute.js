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

    if (!expected ||
        expectedBuffer.length !== suppliedBuffer.length ||
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

    const allowedHosts = new Set([
        'dpg-dbicflmc6qcc73d97u60-a',
        'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com'
    ]);
    if (!allowedHosts.has(parsed.hostname)) {
        return res.status(503).json({ success: false, error: 'host_target_mismatch' });
    }

    const client = new Client({
        host: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: databaseName,
        ssl: { rejectUnauthorized: false },
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

        const tables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
              AND table_name IN (
                'chattbm_users',
                'chattbm_auth_rate_limits',
                'chattbm_email_verification_tokens',
                'schema_migrations',
                'migrations',
                'knex_migrations',
                'SequelizeMeta'
              )
            ORDER BY table_name
        `);

        const userCountResult = await client.query('SELECT COUNT(*)::text AS row_count FROM public.chattbm_users');
        const userRowCount = userCountResult.rows[0].row_count;

        const columns = await client.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name IN (
                'chattbm_users',
                'chattbm_auth_rate_limits',
                'chattbm_email_verification_tokens'
              )
            ORDER BY table_name, ordinal_position
        `);

        const indexes = await client.query(`
            SELECT tablename AS table_name, indexname AS index_name, indexdef AS definition
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename IN (
                'chattbm_users',
                'chattbm_auth_rate_limits',
                'chattbm_email_verification_tokens'
              )
            ORDER BY tablename, indexname
        `);

        const constraints = await client.query(`
            SELECT
                tc.table_name,
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            LEFT JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
             AND tc.table_name = kcu.table_name
            LEFT JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
             AND ccu.table_schema = tc.table_schema
             AND ccu.table_name = tc.table_name
            WHERE tc.table_schema = 'public'
              AND tc.table_name IN (
                'chattbm_users',
                'chattbm_auth_rate_limits',
                'chattbm_email_verification_tokens'
              )
            ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position
        `);

        await client.query('COMMIT');
        return res.json({
            success: true,
            database: identity.rows[0].database_name,
            readOnly: true,
            schema: {
                tables: tables.rows.map(row => row.table_name),
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
