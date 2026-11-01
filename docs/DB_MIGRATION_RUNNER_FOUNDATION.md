# REG-097 — Database Migration Runner Foundation

Status: draft implementation for review. The runner is not invoked during application startup and is not approved for production use.

## Scope

The initial runner is deliberately restricted to the isolated staging database `chattbm_staging_isolated` and two exact migration filenames:

1. `005_auth_rate_limits.sql`
2. `006_email_verification_tokens.sql`

It does not discover or replay every numbered SQL file. Duplicate 002 and 003 prefixes and existing bootstrap-created tables make blanket numeric replay unsafe.

## Required order and ledger

The runner uses `chattbm_schema_migrations`, keyed by the complete filename and storing a SHA-256 checksum.

- Migration 005 creates the shared authentication rate-limit table and expiry index.
- Migration 006 is refused unless 005 has a matching ledger record, its checksum matches the repository's 005 SQL, and the rate-limit table exists.
- Each migration requires an explicit confirmation string matching the exact target and filename.
- A previously recorded migration is accepted only when its checksum matches and its expected table is still present.
- A mismatch, unexpected pre-existing object, missing prerequisite, or incompatible verification timestamp stops execution for manual reconciliation.

Before schema writes, the runner verifies the connected database name, obtains an advisory lock, and performs preflight. Ledger creation, selected SQL, and ledger insertion occur in one transaction. A failure rolls back. The runner does not print the database URL and is not called from normal server startup.

## Test coverage

Unit tests cover target and confirmation rejection, migration allowlisting, transactional recording of 005, refusal to run 006 before 005, missing or mismatched 005 ledger/table state, checksum mismatch, existing token-table reconciliation, users-table prerequisite, timestamp type/nullability checks, and already-applied recognition.

CI tests use a simulated client. Passing them verifies runner logic, not the live Render database or provider connectivity.

## Required staging procedure — not authorized or executed

Before applying either migration:

1. Confirm the staging Render service points to `chattbm_staging_isolated` using dashboard metadata; do not expose credentials or connection strings.
2. Obtain a successful read-only schema inventory of that exact database, including users table, rate-limit table, verification column, token table, indexes, and migration ledger. Stop for manual reconciliation if objects exist without matching records.
3. Confirm the isolated database has no customer data and confirm the provider-supported backup.
4. Review the exact runner commit and SQL files.
5. Obtain separate explicit approval for each schema-write operation.
6. Apply 005 first; verify its table, columns, expiry index, and checksum ledger record.
7. Only then apply 006; verify the nullable timestamp column, token table, foreign key, unique token hash, expected indexes, and checksum ledger record.
8. Record the outcome and backup reference. Stop on any unexpected result; do not retry blindly.

The isolated staging database schema has not yet been inspected successfully. The earlier read-only Render connector attempt was blocked by the database IP allowlist. Therefore, neither migration may be invoked yet.

## Protections

- The runner is hard-coded to the isolated staging database only.
- Do not use it against production or either existing Render database.
- Do not change production deployment settings, staging branch configuration, or database allowlists as part of this work.
- Do not add automatic migrations to application startup or enforce email verification at login.
- Rollback should prefer application rollback while preserving additive schema. Destructive schema rollback requires separate review, verified backup, and explicit approval.

## Current decision

PR #53 remains Draft pending code review and successful CI on the latest commit. PR #52 remains separate and unmerged. No database migration has been executed.
