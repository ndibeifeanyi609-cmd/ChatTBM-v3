'use strict';

// Manual, read-only TLS connectivity check for the isolated staging database.
// This script never executes migration SQL or writes to the database.
const { Client } = require('pg');

const databaseName = 'chattbm_staging_isolated';
const allowedHosts = new Set([
  'dpg-dbicflmc6qcc73d97u60-a',
  'dpg-dbicflmc6qcc73d97u60-a.ohio-postgres.render.com'
]);

async function main() {
  if (process.argv.length !== 2) {
    throw new Error('This check takes no command-line arguments.');
  }
  const connectionString = process.env.STAGING_MIGRATION_DATABASE_URL;
  if (!connectionString) throw new Error('Migration connection is not configured.');

  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      decodeURIComponent(url.pathname.slice(1)) !== databaseName ||
      !allowedHosts.has(url.hostname)) {
    throw new Error('Refusing unexpected database target.');
  }

  const client = new Client({
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    database: databaseName,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 8000,
    statement_timeout: 10000
  });

  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const result = await client.query(
      "SELECT current_database() AS database_name, " +
      "current_setting('transaction_read_only') AS read_only, " +
      "inet_server_addr()::text AS server_address"
    );
    if (result.rows[0].database_name !== databaseName ||
        result.rows[0].read_only !== 'on') {
      throw new Error('Database identity or read-only verification failed.');
    }
    await client.query('ROLLBACK');
    console.log('Verified TLS connection and read-only transaction for isolated staging.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw new Error('Read-only connection check failed: ' + error.message);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
