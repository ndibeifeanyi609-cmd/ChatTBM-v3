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
    // Use Node.js trusted CA roots; fail closed if the server certificate cannot be verified.
    ssl: { rejectUnauthorized: true },
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
    if (id === '006') {
      const limitColumns = await client.query(
        'SELECT column_name, data_type, is_nullable, column_default ' +
        'FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
        ['public', 'chattbm_auth_rate_limits']
      );
      const expectedLimitColumns = {
        bucket_key: ['text', 'NO', null],
        window_started_at: ['timestamp with time zone', 'NO', null],
        request_count: ['integer', 'NO', null],
        expires_at: ['timestamp with time zone', 'NO', null],
        updated_at: ['timestamp with time zone', 'NO', 'now()']
      };
      if (limitColumns.rowCount !== Object.keys(expectedLimitColumns).length) {
        throw new Error('Migration 005 column preflight failed before migration 006.');
      }
      for (const row of limitColumns.rows) {
        const expected = expectedLimitColumns[row.column_name];
        if (!expected || row.data_type !== expected[0] || row.is_nullable !== expected[1] ||
            (expected[2] === null ? row.column_default !== null : !String(row.column_default || '').toLowerCase().includes(expected[2]))) {
          throw new Error('Migration 005 column definition preflight failed before migration 006.');
        }
      }
      const limitIndexes = await client.query(
        'SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2',
        ['public', 'chattbm_auth_rate_limits']
      );
      const expectedLimitIndexes = {
        chattbm_auth_rate_limits_pkey: 'USING btree (bucket_key)',
        chattbm_auth_rate_limits_expires_at_idx: 'USING btree (expires_at)'
      };
      if (limitIndexes.rowCount !== 2) {
        throw new Error('Migration 005 index preflight failed before migration 006.');
      }
      for (const row of limitIndexes.rows) {
        if (!expectedLimitIndexes[row.indexname] || !row.indexdef.includes(expectedLimitIndexes[row.indexname])) {
          throw new Error('Migration 005 index definition preflight failed before migration 006.');
        }
      }
      const limitConstraints = await client.query(
        'SELECT constraint_name, constraint_type, check_clause ' +
        'FROM information_schema.table_constraints tc ' +
        'LEFT JOIN information_schema.check_constraints cc ' +
        'ON cc.constraint_name = tc.constraint_name AND cc.constraint_schema = tc.constraint_schema ' +
        'WHERE tc.table_schema = $1 AND tc.table_name = $2',
        ['public', 'chattbm_auth_rate_limits']
      );
      const limitConstraintMap = new Map(limitConstraints.rows.map(row => [row.constraint_name, row]));
      const limitPrimary = limitConstraintMap.get('chattbm_auth_rate_limits_pkey');
      const limitCheck = limitConstraintMap.get('chattbm_auth_rate_limits_request_count_check');
      if (limitConstraintMap.size !== 2 || !limitPrimary || limitPrimary.constraint_type !== 'PRIMARY KEY' ||
          !limitCheck || limitCheck.constraint_type !== 'CHECK' ||
          !/request_count\\s*>=\\s*1/.test(limitCheck.check_clause || '')) {
        throw new Error('Migration 005 constraint preflight failed before migration 006.');
      }
    }
    const count = await client.query('SELECT COUNT(*)::int AS n FROM public.chattbm_users');
    if (count.rows[0].n !== 0) throw new Error('Refusing: isolated users table is not empty.');

    await client.query(sql);

    const required = id === '005'
      ? ['bucket_key', 'window_started_at', 'request_count', 'expires_at', 'updated_at']
      : ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at'];
    const table = id === '005' ? 'chattbm_auth_rate_limits' : 'chattbm_email_verification_tokens';
    const verified = await client.query(
      'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
      ['public', table]
    );
    const actual = new Set(verified.rows.map(row => row.column_name));
    if (!required.every(column => actual.has(column)) || actual.size !== required.length) {
      throw new Error('Post-migration column verification failed.');
    }
    const expectedIndexes = id === '005'
      ? ['chattbm_auth_rate_limits_pkey', 'chattbm_auth_rate_limits_expires_at_idx']
      : [
          'chattbm_email_verification_tokens_pkey',
          'chattbm_email_verification_tokens_token_hash_key',
          'chattbm_email_verification_tokens_user_id_idx',
          'chattbm_email_verification_tokens_expires_at_idx',
          'chattbm_email_verification_tokens_active_user_idx'
        ];
    const indexResult = await client.query(
      'SELECT indexname FROM pg_indexes WHERE schemaname = $1 AND tablename = $2',
      ['public', table]
    );
    const actualIndexes = new Set(indexResult.rows.map(row => row.indexname));
    if (!expectedIndexes.every(index => actualIndexes.has(index)) || actualIndexes.size !== expectedIndexes.length) {
      throw new Error('Post-migration index verification failed.');
    }
    const indexDefinitions = await client.query(
      'SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2',
      ['public', table]
    );
    const definitions = new Map(indexDefinitions.rows.map(row => [row.indexname, row.indexdef]));
    const expectedIndexFragments = id === '005'
      ? {
          chattbm_auth_rate_limits_pkey: 'USING btree (bucket_key)',
          chattbm_auth_rate_limits_expires_at_idx: 'USING btree (expires_at)'
        }
      : {
          chattbm_email_verification_tokens_pkey: 'USING btree (id)',
          chattbm_email_verification_tokens_token_hash_key: 'USING btree (token_hash)',
          chattbm_email_verification_tokens_user_id_idx: 'USING btree (user_id)',
          chattbm_email_verification_tokens_expires_at_idx: 'USING btree (expires_at)',
          chattbm_email_verification_tokens_active_user_idx: 'USING btree (user_id) WHERE (used_at IS NULL)'
        };
    for (const [name, fragment] of Object.entries(expectedIndexFragments)) {
      if (!definitions.get(name) || !definitions.get(name).includes(fragment)) {
        throw new Error('Index definition verification failed.');
      }
    }
    const constraintResult = await client.query(
      'SELECT tc.constraint_name, tc.constraint_type, cc.check_clause, rc.delete_rule ' +
      'FROM information_schema.table_constraints tc ' +
      'LEFT JOIN information_schema.check_constraints cc ON cc.constraint_name = tc.constraint_name AND cc.constraint_schema = tc.constraint_schema ' +
      'LEFT JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.constraint_schema ' +
      'WHERE tc.table_schema = $1 AND tc.table_name = $2',
      ['public', table]
    );
    const constraints = new Map(constraintResult.rows.map(row => [row.constraint_name, row]));
    if (id === '005') {
      const primary = constraints.get('chattbm_auth_rate_limits_pkey');
      const check = constraints.get('chattbm_auth_rate_limits_request_count_check');
      if (!primary || primary.constraint_type !== 'PRIMARY KEY' ||
          !check || check.constraint_type !== 'CHECK' ||
          !/request_count\s*>=\s*1/.test(check.check_clause || '')) {
        throw new Error('Rate-limit primary key/check constraint verification failed.');
      }
    } else {
      const primary = constraints.get('chattbm_email_verification_tokens_pkey');
      const unique = constraints.get('chattbm_email_verification_tokens_token_hash_key');
      const foreign = constraints.get('chattbm_email_verification_tokens_user_id_fkey');
      if (!primary || primary.constraint_type !== 'PRIMARY KEY' ||
          !unique || unique.constraint_type !== 'UNIQUE' ||
          !foreign || foreign.constraint_type !== 'FOREIGN KEY' || foreign.delete_rule !== 'CASCADE') {
        throw new Error('Email-token key/foreign-key verification failed.');
      }
      const userColumn = await client.query(
        "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chattbm_users' AND column_name = 'email_verified_at' AND data_type = 'timestamp with time zone' AND is_nullable = 'YES'"
      );
      if (userColumn.rowCount !== 1) throw new Error('email_verified_at verification failed.');
    }

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
