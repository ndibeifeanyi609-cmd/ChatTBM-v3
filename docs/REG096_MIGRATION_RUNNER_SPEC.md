# REG-096 Migration Runner Specification

Status: implementation-ready proposal pending review; no runner or schema changes
Branch: feature/founder-admin-design
Date: 2026-10-25

## Scope

Define a small, explicit migration runner for PostgreSQL-backed REG-096 persistence. This runner must not run automatically during normal application startup and must not activate founder access.

## Commands

Proposed command interface:

- `node scripts/db-migrate.js status` — report applied migration IDs and pending count, without exposing connection strings.
- `node scripts/db-migrate.js up` — apply pending forward migrations.
- `node scripts/db-migrate.js verify` — validate migration ledger and checksums without changing schema.
- `node scripts/db-migrate.js down <migration-id>` — explicit rollback of one reviewed migration, only when a down migration exists and preconditions pass.

The exact script and package scripts are proposals until approved. No implicit migrations from `npm start`.

## Migration file contract

- Store ordered, immutable migration pairs under `database/migrations/`.
- Use sortable IDs, e.g. `0001_reg096_payment_tables.up.sql` and `0001_reg096_payment_tables.down.sql`.
- Treat the up-file checksum as immutable after application.
- Every migration must state whether it is transaction-safe.
- Migrations must be additive first. Destructive changes require a separate approved migration and backup/restore plan.
- A missing down file makes a migration explicitly non-reversible; the runner must refuse rollback rather than guess.

## Ledger and concurrency

Use a dedicated ledger table, e.g. `chattbm_schema_migrations`, with:
- `migration_id TEXT PRIMARY KEY`
- `checksum_sha256 TEXT NOT NULL`
- `applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `runner_version TEXT NOT NULL`

Acquire a fixed PostgreSQL advisory lock before reading the ledger and hold it for the migration operation. Use one checked-out client for the lock and migration transaction. Always release the lock and client in `finally`.

For each pending migration:
1. Read and validate the migration files.
2. Compare applied ledger entries with their current checksums; stop on drift.
3. Begin a transaction.
4. Execute the SQL and insert the ledger row in the same transaction.
5. Commit only after both succeed; otherwise roll back.
6. Never mark a migration applied before the SQL commits.

Rollback:
1. Require the exact migration ID as an explicit argument.
2. Acquire the same advisory lock.
3. Confirm the migration is applied and checksum matches.
4. Require an available reviewed down file.
5. Execute down SQL and delete the ledger entry in one transaction.
6. Refuse to proceed when the rollback could destroy populated canonical payment data unless a migration-specific guard and explicit operator approval are present.

## Security and operational behavior

- Read connection settings only from the existing server environment.
- Never print `DATABASE_URL`, passwords, full connection strings, or SQL parameter values that contain customer/payment data.
- Use parameterized SQL for ledger operations.
- Do not accept migration file paths from user input; validate the requested migration ID against the discovered allowlist.
- Exit non-zero on any failure, checksum mismatch, lock timeout, missing file, or unexpected ledger state.
- Use a bounded lock timeout and connection timeout.
- Do not automatically retry non-idempotent migration SQL.
- Do not run migrations as part of the HTTP request path.
- Keep production execution manual and explicitly approved.

## Test strategy

Run against a disposable PostgreSQL instance, not the production database:

- status with no ledger and with applied/pending migrations;
- up on a clean database;
- second up is a no-op;
- checksum drift stops before any new migration is applied;
- two concurrent runners serialize using the advisory lock;
- SQL failure rolls back both DDL/DML and ledger insertion;
- process interruption leaves no false applied record;
- down refuses unknown, unapplied, checksum-drifted, or non-reversible migrations;
- down restores the expected empty schema for a disposable test migration;
- credentials are never included in output;
- migration failures exit non-zero.

## Gate before implementation

The runner is not safe to implement or execute until an isolated PostgreSQL test database is available and the repository owner approves the command contract. The REG-096 schema review must resolve ownership and polymorphic provider-reference constraints before any payment tables are migrated.

No code, production schema, payment records, or founder settings changed as part of this specification.
