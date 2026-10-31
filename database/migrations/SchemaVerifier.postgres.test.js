'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Client } = require('pg');
const { verifyMigrationSchema, STATUSES } = require('./SchemaVerifier');

const schema = 'chattbm_schema_verifier_test';
const migrationFiles = [
  '001_auth_accounts_sessions.sql',
  '002_chat_history.sql',
  '002_google_oauth_identities.sql',
  '003_context_records.sql',
  '003_google_oauth_states.sql',
  '004_password_reset_tokens.sql',
  '005_auth_rate_limits.sql',
  '006_email_verification_tokens.sql'
];

test('verifies all reviewed migrations against disposable PostgreSQL 18 schema', async () => {
  const connectionString = process.env.SCHEMA_VERIFIER_DATABASE_URL;
  assert.ok(connectionString, 'SCHEMA_VERIFIER_DATABASE_URL must point to the disposable CI PostgreSQL service');

  const client = new Client({ connectionString });
  await client.connect();
  let schemaCreated = false;
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    await client.query(`SET search_path TO ${schema}`);

    for (const filename of migrationFiles) {
      const migrationPath = path.join(__dirname, filename);
      const sql = await fs.readFile(migrationPath, 'utf8');
      await client.query(sql);
    }

    const result = await verifyMigrationSchema({ client, schema });
    assert.equal(result.readOnly, true);
    assert.equal(result.migrations.length, 8);
    for (const migration of result.migrations) {
      assert.equal(migration.status, STATUSES.COMPLETE, migration.migrationId + ': ' + migration.reasons.join(','));
    }
  } finally {
    if (schemaCreated) {
      await client.query('RESET search_path');
      await client.query(`DROP SCHEMA ${schema} CASCADE`);
    }
    await client.end();
  }
});


test('classifies absent, partial, and conflicting schemas in disposable PostgreSQL 18', async () => {
  const connectionString = process.env.SCHEMA_VERIFIER_DATABASE_URL;
  assert.ok(connectionString, 'SCHEMA_VERIFIER_DATABASE_URL must point to the disposable CI PostgreSQL service');

  const client = new Client({ connectionString });
  const schemas = [
    'chattbm_schema_verifier_empty',
    'chattbm_schema_verifier_partial',
    'chattbm_schema_verifier_conflict'
  ];
  const created = [];
  try {
    await client.connect();

    for (const schemaName of schemas) {
      await client.query(`CREATE SCHEMA ${schemaName}`);
      created.push(schemaName);
    }

    const empty = await verifyMigrationSchema({ client, schema: schemas[0] });
    const emptyById = new Map(empty.migrations.map(item => [item.migrationId, item]));
    assert.equal(emptyById.get('001_auth_accounts_sessions').status, STATUSES.ABSENT);
    assert.equal(emptyById.get('005_auth_rate_limits').status, STATUSES.ABSENT);
    assert.equal(emptyById.get('002_chat_history').status, STATUSES.BLOCKED);

    await client.query(`CREATE TABLE ${schemas[1]}.chattbm_users (id text PRIMARY KEY, email_verified_at timestamptz)`);
    const partial = await verifyMigrationSchema({ client, schema: schemas[1] });
    const emailVerification = partial.migrations.find(item => item.migrationId === '006_email_verification_tokens');
    assert.equal(emailVerification.status, STATUSES.PARTIAL_OR_CONFLICTING);
    assert.ok(emailVerification.reasons.includes('EMAIL_VERIFICATION_COLUMN_PRESENT_BUT_TOKEN_TABLE_ABSENT'));

    await client.query(`CREATE TABLE ${schemas[2]}.chattbm_auth_rate_limits (
      bucket_key text PRIMARY KEY,
      window_started_at timestamptz NOT NULL,
      request_count text NOT NULL,
      expires_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    const conflict = await verifyMigrationSchema({ client, schema: schemas[2] });
    const rateLimits = conflict.migrations.find(item => item.migrationId === '005_auth_rate_limits');
    assert.equal(rateLimits.status, STATUSES.PARTIAL_OR_CONFLICTING);
    assert.ok(rateLimits.objects.some(item => item.name === 'chattbm_auth_rate_limits' && item.status === 'CONFLICTING'));
  } finally {
    for (const schemaName of created.reverse()) {
      await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    }
    await client.end();
  }
});
