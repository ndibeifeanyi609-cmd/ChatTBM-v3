# Staging Database Migration Runbook

## Status and scope
Documentation and review procedure only. This runbook does not authorize or execute database changes.

The read-only staging inventory reported two expected tables missing:
- `chattbm_password_reset_tokens`
- `chattbm_auth_rate_limits`

Repository migrations:
- `database/migrations/004_password_reset_tokens.sql`
- `database/migrations/005_auth_rate_limits.sql`

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

Both scripts use `IF NOT EXISTS`. That does not prove an existing object has the correct definition and does not replace migration history or schema-drift checks.

## Phase 4 — Backup and execution plan
Before any separately authorized staging write:
1. Confirm a recent, restorable staging backup and document restore steps.
2. Verify service isolation and staging-only credentials.
3. Use a reviewed migration runner, not ad hoc SQL in a production console.
4. Verify database identity, acquire a migration lock, validate checksums/history, and re-check preconditions.
5. Apply each migration transactionally where supported; write its ledger record in the same transaction.
6. Stop on errors. Capture redacted diagnostics; do not automatically retry uncertain operations.
7. Do not improvise rollback; use a separately reviewed restore or corrective-migration plan.

This document does not approve a runner or migration execution.

## Phase 5 — Read-only verification
After a separately approved migration, verify:
- Database is `chattbm_staging_isolated` and diagnostic confirms read-only mode.
- Both expected tables exist.
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
- Read-only staging inventory completed.
- Two expected tables above were reported missing.
- Migration history is not established.
- No migration was executed during runbook preparation.
- No database write is authorized by this document.
