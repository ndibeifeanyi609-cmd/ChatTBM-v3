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
