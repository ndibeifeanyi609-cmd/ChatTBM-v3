# Staging Database Migration Runbook

## Status and scope
Documentation and review procedure only. This runbook does not authorize or execute database changes.

The read-only staging inventory previously reported these missing tables:
- `chattbm_password_reset_tokens`
- `chattbm_auth_rate_limits`

The email-verification migration additionally introduces `email_verified_at` on `chattbm_users` and `chattbm_email_verification_tokens`.

Relevant repository migrations, in dependency order:
- `database/migrations/004_password_reset_tokens.sql`
- `database/migrations/005_auth_rate_limits.sql`
- `database/migrations/006_email_verification_tokens.sql`

A general-purpose migration ledger and runner have not been established. Do not assume numbered SQL files are applied automatically.

## Safety invariants
1. Staging and production credentials must remain separate.
2. Before any write, a migration tool must verify the connected database is exactly `chattbm_staging_isolated`.
3. Never log connection strings, passwords, tokens, or raw secrets.
4. Never run migrations from application startup.
5. Stop on unexpected database identity, schema drift, failed preconditions, or ambiguous history.
6. Read-only inventory is verification, not authorization to write.

## Phase 1 — Establish migration history
1. Inspect all migration files in order and identify dependencies.
2. Inspect staging schema and migration metadata using read-only queries.
3. Determine whether target tables, indexes, and constraints already exist.
4. Compare exact definitions, not merely object names.
5. Review deployment logs and backups for evidence of prior application.
6. Do not infer a migration was applied merely because a table exists.
7. If history remains ambiguous, stop and prepare a reconciliation plan; do not blindly replay or mark migrations applied.

## Phase 2 — Migration ledger requirements
A separately reviewed runner should maintain:
- Stable migration identifier and filename.
- SHA-256 checksum of exact migration contents.
- Applied timestamp and runner version.
- Execution outcome.

Requirements:
- Unique migration identifiers.
- Checksum mismatch is a hard stop.
- Ledger record and migration execute in the same transaction.
- Serialize concurrent runners using an advisory lock or equivalent.
- Never mark a migration applied without independently verifying its schema result.
- Do not retroactively create/populate a ledger until existing history is reconciled.

## Phase 3 — Review target migrations

### 004 — password reset tokens
File: `database/migrations/004_password_reset_tokens.sql`

Creates `chattbm_password_reset_tokens`, references `chattbm_users(id)`, stores token hashes, and defines user/expiry indexes.

Before application:
- Confirm `chattbm_users` exists with a compatible primary key and type.
- Confirm table, indexes, and constraints do not exist with conflicting definitions.
- Preserve the rule that raw reset tokens are never stored.

### 005 — authentication rate limits
File: `database/migrations/005_auth_rate_limits.sql`

Creates `chattbm_auth_rate_limits` with a bucket primary key, request-count check, timestamps, and expiry index.

Before application:
- Check for conflicting existing objects.
- Review bucket-key and expiry semantics against the application adapter.
- Confirm PostgreSQL version compatibility.

### 006 — email verification
File: `database/migrations/006_email_verification_tokens.sql`

Adds nullable `email_verified_at` to `chattbm_users`, creates `chattbm_email_verification_tokens` with a foreign key to users, stores token hashes, and defines user, expiry, and active-user indexes.

Before application:
- Confirm `chattbm_users` exists and `id` is compatible with TEXT foreign-key type.
- Inspect existing `email_verified_at`, token table, indexes, and constraints for exact definition compatibility.
- Confirm existing user data and email-verification semantics are preserved.

All three scripts use `IF NOT EXISTS` in places. That does not prove an existing object has the correct definition and does not replace migration history or schema-drift checks.

## Phase 4 — Isolated test coverage
The CI workflow runs PostgreSQL integration tests against an ephemeral local `chattbm_test` database only.

- Migration 004: `tests/passwordResetMigration.integration.test.js`
- Migration 005: `tests/sharedAuthRateLimit.integration.test.js`
- Migration 006: `tests/emailVerificationPostgres.integration.test.js`

Destructive tests require explicit environment opt-in and validate that the connection is local and the database name is exactly `chattbm_test`. These tests are not staging migration approval and do not validate the current staging database's history.

## Phase 5 — Backup and execution plan
Before any separately authorized staging write:
1. Confirm a recent, restorable staging backup and document restore steps.
2. Verify service isolation and staging-only credentials.
3. Use a reviewed migration runner, not ad hoc SQL in a production console.
4. Verify database identity, acquire a migration lock, validate checksums/history, and re-check preconditions.
5. Apply each migration transactionally where supported; write its ledger record in the same transaction.
6. Stop on errors. Capture redacted diagnostics; do not automatically retry uncertain operations.
7. Do not improvise rollback; use a separately reviewed restore or corrective-migration plan.

This document does not approve a runner or migration execution.

## Phase 6 — Read-only verification
After a separately approved migration, verify:
- Database is `chattbm_staging_isolated` and diagnostic confirms read-only mode.
- Expected tables and column exist.
- Columns, types, nullability, defaults, keys, constraints, and indexes match reviewed definitions.
- Ledger identifiers and checksums match repository files.
- Existing user/application data remain intact.
- No unexpected schema objects appeared.

Table existence alone is insufficient.

## Approval gates
- This runbook is a proposed procedure, not execution approval.
- Migration ledger/runner implementation requires separate review.
- Any staging write requires separate explicit approval.
- Production requires its own backup, rollout, verification, and approval plan.

## Current checkpoint
- Read-only staging inventory previously completed; two tables were reported missing.
- Migration history remains unestablished.
- Isolated CI tests validate SQL behaviour on disposable databases only.
- No migration has been executed against staging or production by this work.
- No database write is authorized by this document.
