'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const runner = path.join(__dirname, 'runIsolatedStagingMigration.js');

function invoke(args, extraEnv = {}) {
  return spawnSync(process.execPath, [runner, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv }
  });
}

test('migration runner refuses unsupported migration before connecting', () => {
  const result = invoke(['007'], {
    STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:007',
    STAGING_MIGRATION_DATABASE_URL: 'postgres://user:pass@localhost:5432/chattbm_staging_isolated'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Specify exactly migration 005 or 006/);
});

test('migration runner requires explicit confirmation', () => {
  const result = invoke(['005'], {
    STAGING_MIGRATION_CONFIRM: '',
    STAGING_MIGRATION_DATABASE_URL: 'postgres://user:pass@dpg-dbicflmc6qcc73d97u60-a:5432/chattbm_staging_isolated'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Explicit migration confirmation is missing/);
});

test('migration runner requires a configured connection', () => {
  const result = invoke(['005'], {
    STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:005',
    STAGING_MIGRATION_DATABASE_URL: ''
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Migration connection is not configured/);
});

test('migration runner rejects a database name outside the isolated target', () => {
  const result = invoke(['005'], {
    STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:005',
    STAGING_MIGRATION_DATABASE_URL: 'postgres://user:pass@dpg-dbicflmc6qcc73d97u60-a:5432/postgres'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing unexpected database target/);
});

test('migration runner rejects a host outside the isolated target allowlist', () => {
  const result = invoke(['005'], {
    STAGING_MIGRATION_CONFIRM: 'chattbm_staging_isolated:005',
    STAGING_MIGRATION_DATABASE_URL: 'postgres://user:pass@localhost:5432/chattbm_staging_isolated'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing unexpected database target/);
});
