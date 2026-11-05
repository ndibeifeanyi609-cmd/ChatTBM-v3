'use strict';

// Manual-only. Never import this file from server.js.
// Run each migration separately with an explicit confirmation value.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');

const migrations = {
  '004': '004_password_reset_tokens.sql',
  '005': '005_auth_rate_limits.sql',
  '006': '006_email_verification_tokens.sql'
};
const databaseName = 'chattbm_staging_isolated';
const hosts = new Set([
  'dpg-dbicflmc6qcc73d97u60-a',
  'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com'
]);
const localTestTarget = process.env.NODE_ENV === 'test' &&
  process.env.STAGING_MIGRATION_ALLOW_LOCAL_TEST_TARGET === 'true';


async function verifyPasswordResetSchema(client, phase) {
  const table = 'chattbm_password_reset_tokens';
  const columns = await client.query(
    'SELECT column_name, data_type, is_nullable, column_default ' +
    'FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
    ['public', table]
  );
  const expectedColumns = {
    id: ['text', 'NO', null],
    user_id: ['text', 'NO', null],
    token_hash: ['text', 'NO', null],
    created_at: ['timestamp with time zone', 'NO', 'now()'],
    expires_at: ['timestamp with time zone', 'NO', null],
    used_at: ['timestamp with time zone', 'YES', null]
  };
  if (columns.rowCount !== Object.keys(expectedColumns).length) {
    throw new Error('Migration 004 ' + phase + ' column verification failed.');
  }
  for (const row of columns.rows) {
    const expected = expectedColumns[row.column_name];
    if (!expected || row.data_type !== expected[0] || row.is_nullable !== expected[1] ||
        (expected[2] === null ? row.column_default !== null :
          !String(row.column_default || '').toLowerCase().includes(expected[2]))) {
      throw new Error('Migration 004 ' + phase + ' column definition verification failed.');
    }
  }
  const indexes = await client.query(
    'SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2',
    ['public', table]
  );
  const expectedIndexes = {
    chattbm_password_reset_tokens_pkey: 'USING btree (id)',
    chattbm_password_reset_tokens_token_hash_key: 'USING btree (token_hash)',
    chattbm_password_reset_tokens_user_created_idx: 'USING btree (user_id, created_at DESC)',
    chattbm_password_reset_tokens_expires_idx: 'USING btree (expires_at)'
  };
  if (indexes.rowCount !== Object.keys(expectedIndexes).length) {
    throw new Error('Migration 004 ' + phase + ' index verification failed.');
  }
  for (const row of indexes.rows) {
    if (!expectedIndexes[row.indexname] || !row.indexdef.includes(expectedIndexes[row.indexname])) {
      throw new Error('Migration 004 ' + phase + ' index definition verification failed.');
    }
  }
  const constraints = await client.query(
    "SELECT conname AS constraint_name, contype AS constraint_type, " +
    "pg_get_constraintdef(oid) AS definition " +
    "FROM pg_constraint WHERE conrelid = 'public.chattbm_password_reset_tokens'::regclass " +
    "AND contype IN ('p', 'u', 'f')"
  );
  const primary = constraints.rows.find(row =>
    row.constraint_type === 'p' && row.definition === 'PRIMARY KEY (id)'
  );
  const unique = constraints.rows.find(row =>
    row.constraint_type === 'u' && row.definition === 'UNIQUE (token_hash)'
  );
  const foreign = constraints.rows.find(row =>
    row.constraint_type === 'f' &&
    row.definition === 'FOREIGN KEY (user_id) REFERENCES chattbm_users(id) ON DELETE CASCADE'
  );
  if (constraints.rowCount !== 3 || !primary || !unique || !foreign) {
    throw new Error('Migration 004 ' + phase + ' key/foreign-key verification failed.');
  }
}

async function run() {
  const id = process.argv[2];
  if (!Object.prototype.hasOwnProperty.call(migrations, id) || process.argv.length !== 3) {
    throw new Error('Specify exactly migration 004, 005, or 006.');
  }
  if (process.env.STAGING_MIGRATION_CONFIRM !== databaseName + ':' + id) {
    throw new Error('Explicit migration confirmation is missing.');
  }
  const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('Migration connection is not configured.');

  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      decodeURIComponent(url.pathname.slice(1)) !== databaseName ||
      !(hosts.has(url.hostname) || (localTestTarget && ['localhost', '127.0.0.1'].includes(url.hostname)))) {
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
    ssl: localTestTarget ? false : { rejectUnauthorized: true },
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

    // Serialize migration attempts and persist an immutable checksum record in
    // the same transaction as the schema change.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('chattbm_schema_migrations'))");
    await client.query(
      'CREATE TABLE IF NOT EXISTS public.chattbm_schema_migrations (' +
      'migration_id TEXT PRIMARY KEY CHECK (migration_id ~ \'^[0-9]{3}$\'), ' +
      'checksum_sha256 TEXT NOT NULL CHECK (checksum_sha256 ~ \'^[a-f0-9]{64}$\'), ' +
      'applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
    );
    const historyColumns = await client.query(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns " +
      "WHERE table_schema='public' AND table_name='chattbm_schema_migrations'"
    );
    const historyDefinitions = new Map(historyColumns.rows.map(row => [row.column_name, row]));
    const expectedHistoryColumns = {
      migration_id: ['text', 'NO', null],
      checksum_sha256: ['text', 'NO', null],
      applied_at: ['timestamp with time zone', 'NO', 'now()']
    };
    if (historyDefinitions.size !== 3) {
      throw new Error('Migration history table schema is not recognized.');
    }
    for (const [name, expected] of Object.entries(expectedHistoryColumns)) {
      const actual = historyDefinitions.get(name);
      if (!actual || actual.data_type !== expected[0] || actual.is_nullable !== expected[1] ||
          (expected[2] === null ? actual.column_default !== null :
            !String(actual.column_default || '').toLowerCase().includes(expected[2]))) {
        throw new Error('Migration history table column definition is not recognized.');
      }
    }
    const historyConstraints = await client.query(
      "SELECT conname, contype, pg_get_constraintdef(oid) AS definition " +
      "FROM pg_constraint WHERE conrelid = 'public.chattbm_schema_migrations'::regclass " +
      "AND contype IN ('p', 'c')"
    );
    const historyConstraintMap = new Map(historyConstraints.rows.map(row => [row.conname, row]));
    const historyPrimary = historyConstraintMap.get('chattbm_schema_migrations_pkey');
    const migrationIdCheck = historyConstraintMap.get('chattbm_schema_migrations_migration_id_check');
    const checksumCheck = historyConstraintMap.get('chattbm_schema_migrations_checksum_sha256_check');
    if (historyConstraintMap.size !== 3 ||
        !historyPrimary || historyPrimary.contype !== 'p' ||
        !migrationIdCheck || migrationIdCheck.contype !== 'c' ||
        !/migration_id.*\^\[0-9\]\{3\}\$/.test(migrationIdCheck.definition || '') ||
        !checksumCheck || checksumCheck.contype !== 'c' ||
        !/checksum_sha256.*\^\[a-f0-9\]\{64\}\$/.test(checksumCheck.definition || '')) {
      throw new Error('Migration history table constraints are not recognized.');
    }
    const prior = await client.query(
      'SELECT checksum_sha256 FROM public.chattbm_schema_migrations WHERE migration_id = $1',
      [id]
    );
    if (prior.rowCount) {
      if (prior.rows[0].checksum_sha256 !== checksum) {
        throw new Error('Recorded migration checksum differs from the current SQL file.');
      }
      throw new Error('Migration ' + id + ' is already recorded as applied.');
    }

    const requiredPrior = id === '005' ? ['004'] : id === '006' ? ['004', '005'] : [];
    for (const priorId of requiredPrior) {
      const priorSql = fs.readFileSync(
        path.join(__dirname, '..', 'database', 'migrations', migrations[priorId]), 'utf8'
      );
      const expectedChecksum = crypto.createHash('sha256').update(priorSql).digest('hex');
      const recorded = await client.query(
        'SELECT checksum_sha256 FROM public.chattbm_schema_migrations WHERE migration_id = $1',
        [priorId]
      );
      if (recorded.rowCount !== 1 || recorded.rows[0].checksum_sha256 !== expectedChecksum) {
        throw new Error('Migration ' + priorId + ' is not recorded with the expected checksum.');
      }
    }

    const stateResult = await client.query(
      "SELECT to_regclass('public.chattbm_users') IS NOT NULL AS users, " +
      "to_regclass('public.chattbm_password_reset_tokens') IS NOT NULL AS password_resets, " +
      "to_regclass('public.chattbm_auth_rate_limits') IS NOT NULL AS limits, " +
      "to_regclass('public.chattbm_email_verification_tokens') IS NOT NULL AS tokens"
    );
    const state = stateResult.rows[0];
    if (!state.users) throw new Error('Required users table is missing.');
    if (id === '004' && (state.password_resets || state.limits || state.tokens)) {
      throw new Error('Unexpected schema state before migration 004.');
    }
    if (id === '005' && (!state.password_resets || state.limits || state.tokens)) {
      throw new Error('Unexpected schema state before migration 005.');
    }
    if (id === '006' && (!state.password_resets || !state.limits || state.tokens)) {
      throw new Error('Migration 004/005 is not verified, or migration 006 already exists.');
    }
    if (id !== '004') await verifyPasswordResetSchema(client, 'preflight');
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
        "SELECT conname AS constraint_name, " +
        "CASE contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'c' THEN 'CHECK' END AS constraint_type, " +
        "pg_get_constraintdef(oid) AS check_clause " +
        "FROM pg_constraint " +
        "WHERE conrelid = 'public.chattbm_auth_rate_limits'::regclass AND contype IN ('p', 'c')"
      );
      const limitConstraintMap = new Map(limitConstraints.rows.map(row => [row.constraint_name, row]));
      const limitPrimary = limitConstraintMap.get('chattbm_auth_rate_limits_pkey');
      const limitCheck = limitConstraintMap.get('chattbm_auth_rate_limits_request_count_check');
      if (limitConstraintMap.size !== 2 || !limitPrimary || limitPrimary.constraint_type !== 'PRIMARY KEY' ||
          !limitCheck || limitCheck.constraint_type !== 'CHECK' ||
          !/request_count\s*>=\s*1/.test(limitCheck.check_clause || '')) {
        throw new Error('Migration 005 constraint preflight failed before migration 006.');
      }
    }
    const count = await client.query('SELECT COUNT(*)::int AS n FROM public.chattbm_users');
    if (count.rows[0].n !== 0) throw new Error('Refusing: isolated users table is not empty.');

    await client.query(sql);

    const required = id === '004'
      ? ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']
      : id === '005'
        ? ['bucket_key', 'window_started_at', 'request_count', 'expires_at', 'updated_at']
        : ['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at'];
    const table = id === '004' ? 'chattbm_password_reset_tokens'
      : id === '005' ? 'chattbm_auth_rate_limits' : 'chattbm_email_verification_tokens';
    const verified = await client.query(
      'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
      ['public', table]
    );
    const actual = new Set(verified.rows.map(row => row.column_name));
    if (!required.every(column => actual.has(column)) || actual.size !== required.length) {
      throw new Error('Post-migration column verification failed.');
    }
    const expectedIndexes = id === '004'
      ? ['chattbm_password_reset_tokens_pkey', 'chattbm_password_reset_tokens_token_hash_key', 'chattbm_password_reset_tokens_user_created_idx', 'chattbm_password_reset_tokens_expires_idx']
      : id === '005'
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
    const expectedIndexFragments = id === '004'
      ? {
          chattbm_password_reset_tokens_pkey: 'USING btree (id)',
          chattbm_password_reset_tokens_token_hash_key: 'USING btree (token_hash)',
          chattbm_password_reset_tokens_user_created_idx: 'USING btree (user_id, created_at DESC)',
          chattbm_password_reset_tokens_expires_idx: 'USING btree (expires_at)'
        }
      : id === '005'
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
    if (id === '004') {
      await verifyPasswordResetSchema(client, 'post-migration');
    } else if (id === '005') {
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

    await client.query(
      'INSERT INTO public.chattbm_schema_migrations (migration_id, checksum_sha256) VALUES ($1, $2)',
      [id, checksum]
    );
    await client.query('COMMIT');
    console.log('Migration ' + id + ' applied, verified, and recorded. SHA-256: ' + checksum);
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
