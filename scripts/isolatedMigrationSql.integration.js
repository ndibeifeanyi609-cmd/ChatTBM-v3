'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });
const migration = name => fs.readFileSync(path.join(__dirname, '..', 'database', 'migrations', name), 'utf8');

test('migrations 005 and 006 apply and verify on disposable PostgreSQL', async t => {
  await client.connect();
  t.after(async () => client.end());

  await client.query('CREATE TABLE chattbm_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE)');
  await client.query('BEGIN');
  await client.query(migration('005_auth_rate_limits.sql'));
  const rateColumns = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='chattbm_auth_rate_limits'"
  );
  assert.deepEqual(new Set(rateColumns.rows.map(row => row.column_name)),
    new Set(['bucket_key', 'window_started_at', 'request_count', 'expires_at', 'updated_at']));
  const rateIndexes = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='chattbm_auth_rate_limits'"
  );
  assert.deepEqual(new Set(rateIndexes.rows.map(row => row.indexname)),
    new Set(['chattbm_auth_rate_limits_pkey', 'chattbm_auth_rate_limits_expires_at_idx']));
  const rateCheck = await client.query(
    "SELECT check_clause FROM information_schema.check_constraints WHERE constraint_schema='public' AND constraint_name='chattbm_auth_rate_limits_request_count_check'"
  );
  assert.equal(rateCheck.rowCount, 1);
  assert.match(rateCheck.rows[0].check_clause, /request_count\s*>=\s*1/);
  await client.query('COMMIT');

  await client.query('BEGIN');
  await client.query(migration('006_email_verification_tokens.sql'));
  const verifiedAt = await client.query(
    "SELECT data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='chattbm_users' AND column_name='email_verified_at'"
  );
  assert.equal(verifiedAt.rowCount, 1);
  assert.equal(verifiedAt.rows[0].data_type, 'timestamp with time zone');
  assert.equal(verifiedAt.rows[0].is_nullable, 'YES');
  const tokenColumns = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='chattbm_email_verification_tokens'"
  );
  assert.deepEqual(new Set(tokenColumns.rows.map(row => row.column_name)),
    new Set(['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']));
  const fk = await client.query(
    "SELECT rc.delete_rule FROM information_schema.referential_constraints rc WHERE rc.constraint_schema='public' AND rc.constraint_name='chattbm_email_verification_tokens_user_id_fkey'"
  );
  assert.equal(fk.rows[0]?.delete_rule, 'CASCADE');
  await client.query('COMMIT');

  await client.query('BEGIN');
  await client.query('CREATE TABLE rollback_probe (id INTEGER)');
  await client.query('ROLLBACK');
  const probe = await client.query("SELECT to_regclass('public.rollback_probe') AS relation");
  assert.equal(probe.rows[0].relation, null);
});
