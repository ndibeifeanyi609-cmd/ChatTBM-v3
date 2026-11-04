'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const path = require('node:path');

const runner = path.join(__dirname, 'runIsolatedStagingMigration.js');
const databaseUrl = process.env.DATABASE_URL;
const baseEnv = {
  ...process.env,
  NODE_ENV: 'test',
  STAGING_MIGRATION_ALLOW_LOCAL_TEST_TARGET: 'true',
  STAGING_MIGRATION_DATABASE_URL: databaseUrl,
};

function invoke(id) {
  return spawnSync(process.execPath, [runner, id], {
    encoding: 'utf8',
    env: {
      ...baseEnv,
      STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:' + id,
    },
  });
}

test('actual migration runner applies 005 then 006 on disposable PostgreSQL', async t => {
  assert.ok(databaseUrl, 'DATABASE_URL must point to disposable CI PostgreSQL');
  const url = new URL(databaseUrl);
  assert.equal(url.hostname, 'localhost');
  assert.equal(url.pathname, '/chattbm_staging_isolated');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  t.after(async () => client.end());

  await client.query('DROP TABLE IF EXISTS chattbm_email_verification_tokens CASCADE');
  await client.query('DROP TABLE IF EXISTS chattbm_auth_rate_limits CASCADE');
  await client.query('DROP TABLE IF EXISTS chattbm_users CASCADE');
  await client.query('CREATE TABLE chattbm_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE)');

  const five = invoke('005');
  assert.equal(five.status, 0, five.stderr || five.stdout);
  assert.match(five.stdout, /Migration 005 applied, verified, and recorded/);

  const six = invoke('006');
  assert.equal(six.status, 0, six.stderr || six.stdout);
  assert.match(six.stdout, /Migration 006 applied, verified, and recorded/);

  const columns = await client.query(
    "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='chattbm_users' AND column_name='email_verified_at'"
  );
  assert.equal(columns.rowCount, 1);
  assert.equal(columns.rows[0].is_nullable, 'YES');

  const tokens = await client.query(
    "SELECT to_regclass('public.chattbm_email_verification_tokens') AS relation"
  );
  assert.equal(tokens.rows[0].relation, 'chattbm_email_verification_tokens');

  const history = await client.query(
    'SELECT migration_id, checksum_sha256, applied_at FROM public.chattbm_schema_migrations ORDER BY migration_id'
  );
  assert.deepEqual(history.rows.map(row => row.migration_id), ['005', '006']);
  assert.ok(history.rows.every(row => /^[a-f0-9]{64}$/.test(row.checksum_sha256)));
  assert.ok(history.rows.every(row => row.applied_at instanceof Date));

  const duplicateFive = invoke('005');
  assert.notEqual(duplicateFive.status, 0);
  assert.match(duplicateFive.stderr, /already recorded as applied/);

  // Remove only the disposable test's 006 ledger row to simulate a first
  // application against a deliberately malformed schema. The runner must roll back

  // the token table it creates inside its transaction.
  await client.query("DELETE FROM public.chattbm_schema_migrations WHERE migration_id = '006'");
  await client.query('DROP TABLE chattbm_email_verification_tokens');
  await client.query('ALTER TABLE chattbm_users DROP COLUMN email_verified_at');
  await client.query('ALTER TABLE chattbm_users ADD COLUMN email_verified_at INTEGER');

  const rejectedSix = invoke('006');
  assert.notEqual(rejectedSix.status, 0);
  assert.match(rejectedSix.stderr, /email_verified_at verification failed/);

  const rolledBack = await client.query(
    "SELECT to_regclass('public.chattbm_email_verification_tokens') AS relation"
  );
  assert.equal(rolledBack.rows[0].relation, null);
  const failedHistory = await client.query(
    "SELECT 1 FROM public.chattbm_schema_migrations WHERE migration_id = '006'"
  );
  assert.equal(failedHistory.rowCount, 0, 'failed migration must not leave a history record');
});
