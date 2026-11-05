'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { Client } = require('pg');
const path = require('node:path');

const runner = path.join(__dirname, 'runIsolatedStagingMigration.js');
const databaseUrl = process.env.DATABASE_URL;

function invoke(id) {
  return spawnSync(process.execPath, [runner, id], {
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      STAGING_MIGRATION_ALLOW_LOCAL_TEST_TARGET: 'true',
      STAGING_MIGRATION_DATABASE_URL: databaseUrl,
      STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:' + id
    }
  });
}

test('migration 004 is required, verified, and checksum-protected before 005 and 006', async t => {
  assert.ok(databaseUrl, 'DATABASE_URL must point to disposable CI PostgreSQL');
  const url = new URL(databaseUrl);
  assert.equal(url.hostname, 'localhost');
  assert.equal(url.pathname, '/chattbm_staging_isolated');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  t.after(async () => client.end());

  await client.query('CREATE TABLE chattbm_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE)');

  const fiveTooEarly = invoke('005');
  assert.notEqual(fiveTooEarly.status, 0);
  assert.match(fiveTooEarly.stderr, /Migration 004 is not recorded with the expected checksum/);

  const sql004 = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'migrations', '004_password_reset_tokens.sql'),
    'utf8'
  );
  const checksum004 = crypto.createHash('sha256').update(sql004).digest('hex');

  // Simulate an existing password-reset table without migration history.
  await client.query(sql004);
  const unrecorded = invoke('004');
  assert.notEqual(unrecorded.status, 0);
  assert.match(unrecorded.stderr, /Unexpected schema state before migration 004/);
  const noAdoption = await client.query(
    "SELECT 1 FROM public.chattbm_schema_migrations WHERE migration_id = '004'"
  );
  assert.equal(noAdoption.rowCount, 0);
  await client.query('ALTER TABLE chattbm_password_reset_tokens RENAME TO chattbm_password_reset_tokens_unrecorded');

  const four = invoke('004');
  assert.equal(four.status, 0, four.stderr || four.stdout);
  assert.match(four.stdout, /Migration 004 applied, verified, and recorded/);

  const schema = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='chattbm_password_reset_tokens'"
  );
  assert.deepEqual(new Set(schema.rows.map(row => row.column_name)),
    new Set(['id', 'user_id', 'token_hash', 'created_at', 'expires_at', 'used_at']));
  const indexes = await client.query(
    "SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='chattbm_password_reset_tokens'"
  );
  assert.equal(indexes.rowCount, 4);
  assert.ok(indexes.rows.some(row => row.indexname === 'chattbm_password_reset_tokens_user_created_idx' &&
    row.indexdef.includes('USING btree (user_id, created_at DESC)')));
  assert.ok(indexes.rows.some(row => row.indexname === 'chattbm_password_reset_tokens_expires_idx' &&
    row.indexdef.includes('USING btree (expires_at)')));
  const constraints = await client.query(
    "SELECT tc.constraint_name, tc.constraint_type, rc.delete_rule FROM information_schema.table_constraints tc LEFT JOIN information_schema.referential_constraints rc ON rc.constraint_name=tc.constraint_name AND rc.constraint_schema=tc.constraint_schema WHERE tc.table_schema='public' AND tc.table_name='chattbm_password_reset_tokens'"
  );
  assert.ok(constraints.rows.some(row => row.constraint_type === 'PRIMARY KEY'));
  assert.ok(constraints.rows.some(row => row.constraint_type === 'UNIQUE'));
  assert.ok(constraints.rows.some(row => row.constraint_type === 'FOREIGN KEY' && row.delete_rule === 'CASCADE'));

  const five = invoke('005');
  assert.equal(five.status, 0, five.stderr || five.stdout);

  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256=$1 WHERE migration_id='004'",
    ['0'.repeat(64)]
  );
  const sixBadChecksum = invoke('006');
  assert.notEqual(sixBadChecksum.status, 0);
  assert.match(sixBadChecksum.stderr, /Migration 004 is not recorded with the expected checksum/);
  const noEmailTokens = await client.query(
    "SELECT to_regclass('public.chattbm_email_verification_tokens') AS relation"
  );
  assert.equal(noEmailTokens.rows[0].relation, null);
  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256=$1 WHERE migration_id='004'",
    [checksum004]
  );

  const six = invoke('006');
  assert.equal(six.status, 0, six.stderr || six.stdout);
  const history = await client.query(
    'SELECT migration_id FROM public.chattbm_schema_migrations ORDER BY migration_id'
  );
  assert.deepEqual(history.rows.map(row => row.migration_id), ['004', '005', '006']);
});
