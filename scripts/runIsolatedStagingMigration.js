'use strict';

// Manual-only. Never import this file from server.js.
// Run each migration separately with an explicit confirmation value.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');

const migrations = {
  '005': '005_auth_rate_limits.sql',
  '006': '006_email_verification_tokens.sql'
};
const databaseName = 'chattbm_staging_isolated';
const hosts = new Set([
  'dpg-dbicflmc6qcc73d97u60-a',
  'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com'
]);

async function run() {
  const id = process.argv[2];
  if (!Object.prototype.hasOwnProperty.call(migrations, id) || process.argv.length !== 3) {
    throw new Error('Specify exactly migration 005 or 006.');
  }
  if (process.env.STAGING_MIGRATION_CONFIRM !== databaseName + ':' + id) {
    throw new Error('Explicit migration confirmation is missing.');
  }
  const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('Migration connection is not configured.');

  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      decodeURIComponent(url.pathname.slice(1)) !== databaseName ||
      !hosts.has(url.hostname)) {
    throw new Error('Refusing unexpected database target.');
  }

  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migrations', migrations[id]), 'utf8');
  const checksum = crypto.createHash('sha256').update(sql).digest('hex');
  const client = new Client({
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    database: databaseName,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    statement_timeout: 15000
  });

  try {
    await client.connect();
    await client.query('BEGIN');
    const identity = await client.query(
      "SELECT current_database() AS name, current_setting('transaction_read_only') AS read_only"
    );
    if (identity.rows[0].name !== databaseName || identity.rows[0].read_only !== 'off') {
      throw new Error('Database identity or write access check failed.');
    }

    const stateResult = await client.query(
      "SELECT to_regclass('public.chattbm_users') IS NOT NULL AS users, " +
      "to_regclass('public.chattbm_auth_rate_limits') IS NOT NULL AS limits, " +
      "to_regclass('public.chattbm_email_verification_tokens') IS NOT NULL AS tokens"
    );
    const state = stateResult.rows[0];
    if (!state.users) throw new Error('Required users table is missing.');
    if (id === '005' && (state.limits || state.tokens)) {
      throw new Error('Unexpected schema state before migration 005.');
    }
    if (id === '006' && (!state.limits || state.tokens)) {
      throw new Error('Migration 005 is not verified, or migration 006 already exists.');
    }
    const count = await client.query('SELECT COUNT(*)::int AS n FROM public.chattbm_users');
    if (count.rows[0].n !== 0) throw new Error('Refusing: isolated users table is not empty.');

    await client.query(sql);

    const verified = await client.query(
      id === '005'
        ? "SELECT to_regclass('public.chattbm_auth_rate_limits') IS NOT NULL AS ok"
        : "SELECT to_regclass('public.chattbm_email_verification_tokens') IS NOT NULL AS ok"
    );
    if (!verified.rows[0].ok) throw new Error('Post-migration verification failed.');

    await client.query('COMMIT');
    console.log('Migration ' + id + ' applied and verified. SHA-256: ' + checksum);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw new Error('Migration aborted; transaction rolled back. ' + error.message);
  } finally {
    await client.end().catch(() => {});
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
