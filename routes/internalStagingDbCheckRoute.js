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
        connectionString,
        ssl: {
            rejectUnauthorized: true,
            servername: 'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com'
        },
        connectionTimeoutMillis: 8000,
        statement_timeout: 5000
    });

    try {
        await client.connect();
        const result = await client.query(
            'SELECT current_database() AS database_name'
        );

        if (result.rows[0]?.database_name !== 'chattbm_staging_isolated') {
            return res.status(503).json({ success: false, error: 'database_identity_mismatch' });
        }

        return res.json({
            success: true,
            database: result.rows[0].database_name,
            readOnly: true
        });
    } catch (error) {
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
