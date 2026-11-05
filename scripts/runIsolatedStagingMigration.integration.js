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
  await client.query('DROP TABLE IF EXISTS chattbm_password_reset_tokens CASCADE');
  await client.query('DROP TABLE IF EXISTS chattbm_auth_rate_limits CASCADE');
  await client.query('DROP TABLE IF EXISTS chattbm_users CASCADE');
  await client.query('CREATE TABLE chattbm_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE)');

  const fiveBeforeFour = invoke('005');
  assert.notEqual(fiveBeforeFour.status, 0);
  assert.match(fiveBeforeFour.stderr, /Migration 004 is not recorded with the expected checksum/);

  // An existing password-reset table without history must not be adopted.
  const sql004 = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'migrations', '004_password_reset_tokens.sql'),
    'utf8'
  );
  const checksum004 = crypto.createHash('sha256').update(sql004).digest('hex');
  await client.query(sql004);
  const unrecordedFour = invoke('004');
  assert.notEqual(unrecordedFour.status, 0);
  assert.match(unrecordedFour.stderr, /Unexpected schema state before migration 004/);
  const noFourHistory = await client.query(
    "SELECT to_regclass('public.chattbm_schema_migrations') AS relation"
  );
  assert.equal(noFourHistory.rows[0].relation, null,
    'failed first migration must roll back creation of the history table');
  await client.query('DROP TABLE chattbm_password_reset_tokens CASCADE');

  const four = invoke('004');
  assert.equal(four.status, 0, four.stderr || four.stdout);
  assert.match(four.stdout, /Migration 004 applied, verified, and recorded/);

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
  assert.deepEqual(history.rows.map(row => row.migration_id), ['004', '005', '006']);
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


test('runner rejects checksum tampering, populated users, and an unrecorded existing schema', async t => {
  assert.ok(databaseUrl, 'DATABASE_URL must point to disposable CI PostgreSQL');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  t.after(async () => client.end());

  const sql005 = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'migrations', '005_auth_rate_limits.sql'),
    'utf8'
  );
  const validChecksum = crypto.createHash('sha256').update(sql005).digest('hex');

  const sql004 = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'migrations', '004_password_reset_tokens.sql'),
    'utf8'
  );
  const validFourChecksum = crypto.createHash('sha256').update(sql004).digest('hex');
  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = '004'",
    ['0'.repeat(64)]
  );
  const badFourChecksum = invoke('006');
  assert.notEqual(badFourChecksum.status, 0);
  assert.match(badFourChecksum.stderr, /Migration 004 is not recorded with the expected checksum/);
  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = '004'",
    [validFourChecksum]
  );

  // Tampered history must block 006 before any schema change.
  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = '005'",
    ['0'.repeat(64)]
  );
  const badChecksum = invoke('006');
  assert.notEqual(badChecksum.status, 0);
  assert.match(badChecksum.stderr, /Migration 005 is not recorded with the expected checksum/);
  const noTokensAfterChecksumFailure = await client.query(
    "SELECT to_regclass('public.chattbm_email_verification_tokens') AS relation"
  );
  assert.equal(noTokensAfterChecksumFailure.rows[0].relation, null);

  await client.query(
    "UPDATE public.chattbm_schema_migrations SET checksum_sha256 = $1 WHERE migration_id = '005'",
    [validChecksum]
  );

  // A populated users table must stop migration 006 without deleting user data.
  await client.query('ALTER TABLE public.chattbm_users DROP COLUMN email_verified_at');
  await client.query('ALTER TABLE public.chattbm_users ADD COLUMN email_verified_at TIMESTAMPTZ');
  await client.query(
    "INSERT INTO public.chattbm_users (id, email) VALUES ('migration-safety-user', 'migration-safety@example.test')"
  );
  const populated = invoke('006');
  assert.notEqual(populated.status, 0);
  assert.match(populated.stderr, /isolated users table is not empty/);
  const retainedUser = await client.query(
    "SELECT COUNT(*)::int AS count FROM public.chattbm_users WHERE id = 'migration-safety-user'"
  );
  assert.equal(retainedUser.rows[0].count, 1);
  const noTokensForPopulatedTarget = await client.query(
    "SELECT to_regclass('public.chattbm_email_verification_tokens') AS relation"
  );
  assert.equal(noTokensForPopulatedTarget.rows[0].relation, null);
  await client.query("DELETE FROM public.chattbm_users WHERE id = 'migration-safety-user'");

  // Existing schema without a trustworthy history entry must not be adopted.
  await client.query("DELETE FROM public.chattbm_schema_migrations WHERE migration_id = '005'");
  const unrecordedExisting = invoke('005');
  assert.notEqual(unrecordedExisting.status, 0);
  assert.match(unrecordedExisting.stderr, /Unexpected schema state before migration 005/);
  const noFabricatedHistory = await client.query(
    "SELECT 1 FROM public.chattbm_schema_migrations WHERE migration_id = '005'"
  );
  assert.equal(noFabricatedHistory.rowCount, 0);
  const existingRateTable = await client.query(
    "SELECT to_regclass('public.chattbm_auth_rate_limits') AS relation"
  );
  assert.equal(existingRateTable.rows[0].relation, 'chattbm_auth_rate_limits');
});
