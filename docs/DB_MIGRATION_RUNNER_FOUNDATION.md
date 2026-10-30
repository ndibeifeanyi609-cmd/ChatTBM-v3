# REG-097 — Database Migration Runner Foundation

Status: draft implementation and review documentation. This runner is not approved
for production use and does not run automatically during application startup.

## Scope of this foundation

The initial runner is deliberately restricted to:

- Database name: `chattbm_staging_isolated`
- Migration file: `006_email_verification_tokens.sql`
- Explicit command confirmation matching the selected database and filename
- A PostgreSQL migration ledger named `chattbm_schema_migrations`

This is not yet a general-purpose migration framework. It does not discover or
apply every SQL file in `database/migrations`.

## Why migrations are not batch-applied

The repository contains duplicate numeric migration prefixes, including two
`002` files and two `003` files. The existing application bootstrap also
creates some core tables independently of the numbered SQL files. Therefore,
sorting by numeric prefix and replaying every file cannot be assumed safe.

Any future general migration system must define stable ordering and unique
migration identity (for example, the complete filename), document dependencies,
and reconcile existing deployed schemas before adopting a migration ledger.

## Runner safety behavior

Before any schema write, the runner:

1. Validates the exact allowed migration filename and target database name.
2. Requires the exact explicit confirmation string.
3. Connects using the configured `DATABASE_URL` without printing it.
4. Verifies `current_database()` matches `chattbm_staging_isolated`.
5. Acquires a PostgreSQL advisory lock.
6. Inspects whether `chattbm_users` exists, whether
   `email_verified_at` exists, whether
   `chattbm_email_verification_tokens` exists, and whether the migration
   ledger exists.

The runner stops if the required users table is missing. It also stops for
manual reconciliation when email-verification schema objects already exist
but migration 006 does not have a matching recorded checksum. It must not
silently adopt unknown schema state as a successfully applied migration.

If a matching ledger record exists, the runner compares the stored SHA-256
checksum with the selected SQL. A mismatch stops execution. A matching record
returns `already-applied` without rerunning the SQL.

For a clean eligible schema, the runner creates the ledger (if needed), executes
the selected SQL, and inserts the filename/checksum record in one transaction.
The advisory lock is released in a `finally` path. A failure rolls back the
transaction.

The runner is not called by `server.js` or normal application startup.

## Test coverage

The isolated unit tests cover:

- Required CLI arguments and exact migration allowlist
- Rejection of database targets other than isolated staging
- Rejection when the connected database identity does not match
- Rejection when the required users table is absent
- Rejection when verification schema exists without a matching migration record
- Preflight occurring before ledger creation
- Transactional migration and checksum recording
- Checksum mismatch rejection
- Recognition of an already-recorded matching migration

GitHub Actions runs `npm run test:db-migrate` on the migration-runner workflow.
Passing these tests verifies runner behavior against the test doubles; it does
not verify the live Render database's current schema.

## Required staging procedure — not yet authorized or executed

Before applying migration 006 to any database:

1. Confirm the Render staging service is mapped to the isolated staging database
   using dashboard metadata, without exposing credentials or connection strings.
2. Obtain a read-only schema inventory of that exact database. Confirm the
   users table, verification column, token table, indexes, and migration ledger
   state. If any verification objects exist without a matching migration record,
   stop for manual reconciliation.
3. Confirm the isolated database contains no customer data and take a
   provider-supported backup or snapshot.
4. Review the exact migration SQL and runner commit. Confirm the database name
   and the expected migration filename.
5. Obtain explicit approval for the staging schema write before invoking the
   runner with its required exact confirmation argument.
6. After application, verify the column, token table, foreign key, unique
   token-hash constraint, expected indexes, and ledger checksum using read-only
   queries. Do not read or export user email addresses.
7. Record the outcome and backup reference. Stop on any unexpected result;
   do not retry blindly.

The isolated staging database's schema has not yet been inspected successfully.
An earlier read-only attempt was blocked by the Render database IP allowlist.
Consequently, the runner must not be invoked yet.

## Production and existing database protections

- Do not point this initial runner at production or either pre-existing Render
  database. Its hard-coded database allowlist is intentionally limited to the
  isolated staging database.
- Do not change production deployment settings, staging branch configuration,
  or existing database connection settings as part of this foundation.
- Do not add automatic migrations to application startup.
- Do not enforce email verification at login as part of REG-097.
- Do not automatically drop the nullable verification column, token table, or
  migration ledger during rollback. Prefer application rollback while preserving
  additive schema; destructive rollback requires a separate review, verified
  backup, and explicit approval.

## Current decision

PR #53 remains Draft pending final code/documentation review and a successful
CI run on the latest commit. PR #52 remains separate and unmerged. No database
migration has been run by this work.
