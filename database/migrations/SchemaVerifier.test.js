'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyMigrationSchema, STATUSES } = require('./SchemaVerifier');

function mockClient(responses = []) {
  const calls = [];
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql === 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' || sql === 'ROLLBACK') return { rows: [] };
      const next = responses.shift();
      if (next instanceof Error) throw next;
      return next || { rows: [] };
    }
  };
}

test('requires a caller-owned client and explicit safe schema', async () => {
  await assert.rejects(() => verifyMigrationSchema({ schema: 'public' }), /caller-owned/);
  const client = mockClient();
  await assert.rejects(() => verifyMigrationSchema({ client, schema: 'public; DROP SCHEMA public' }), /schema name/);
  assert.equal(client.calls.length, 0);
});

test('uses a read-only transaction, catalog-only queries, and always rolls back', async () => {
  const client = mockClient();
  const result = await verifyMigrationSchema({ client, schema: 'public' });
  assert.equal(result.readOnly, true);
  assert.equal(client.calls[0].sql, 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(client.calls.at(-1).sql, 'ROLLBACK');
  assert.equal(client.calls.length, 6);
  for (const call of client.calls.slice(1, -1)) {
    assert.match(call.sql, /pg_catalog/);
    assert.deepEqual(call.params[0], 'public');
    assert.ok(Array.isArray(call.params[1]));
  }
  assert.equal(result.migrations.length, 8);
  assert.equal(result.migrations[0].status, STATUSES.ABSENT);
  assert.equal(result.migrations[1].status, STATUSES.BLOCKED);
});

test('classifies email_verified_at without the token table as partial', async () => {
  const tables = { rows: [{ table_name: 'chattbm_users', kind: 'r' }] };
  const columns = { rows: [{ table_name: 'chattbm_users', column_name: 'email_verified_at', data_type: 'timestamp with time zone', not_null: false, default_expr: null }] };
  const client = mockClient([tables, columns, { rows: [] }, { rows: [] }]);
  const result = await verifyMigrationSchema({ client, schema: 'public' });
  const migration = result.migrations.find(item => item.migrationId === '006_email_verification_tokens');
  assert.equal(migration.status, STATUSES.PARTIAL_OR_CONFLICTING);
  assert.ok(migration.reasons.includes('EMAIL_VERIFICATION_COLUMN_PRESENT_BUT_TOKEN_TABLE_ABSENT'));
});

test('catalog failure returns BLOCKED and attempts rollback', async () => {
  const client = mockClient([new Error('catalog denied')]);
  const result = await verifyMigrationSchema({ client, schema: 'public' });
  assert.ok(result.migrations.every(item => item.status === STATUSES.BLOCKED));
  assert.equal(client.calls.at(-1).sql, 'ROLLBACK');
});

test('never issues DDL, DML, ledger, or application-row queries', async () => {
  const client = mockClient();
  await verifyMigrationSchema({ client, schema: 'public' });
  const statements = client.calls.map(call => call.sql);
  assert.ok(statements.every(sql => !/\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\b/i.test(sql)));
  assert.ok(statements.every(sql => !/chattbm_schema_migrations/i.test(sql)));
  assert.ok(statements.every(sql => !/^SELECT \*/i.test(sql)));
});

test('uses a repeatable-read snapshot for consistent catalog inspection', async () => {
  const client = mockClient();
  await verifyMigrationSchema({ client, schema: 'public' });
  assert.equal(client.calls[0].sql, 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
});

test('verifier source remains loadable after syntax corrections', () => {
  assert.equal(typeof verifyMigrationSchema, 'function');
});
