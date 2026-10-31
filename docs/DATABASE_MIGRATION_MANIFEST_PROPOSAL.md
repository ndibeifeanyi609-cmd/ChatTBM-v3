# Database Migration Manifest Proposal

**Status:** Explicit migration order approved; SQL review completed; remaining manifest rules are proposals  
**Branch:** `docs/database-migration-baseline-design`  
**Scope:** Historical migration inventory and deterministic ordering only

## Purpose

The existing migration filenames contain duplicate numeric prefixes. A runner must not infer order by sorting those prefixes. This proposal assigns each existing file a unique manifest order while preserving every historical filename and SQL body.

## Approved manifest order

The user approved this explicit order on 2026-10-31:

| Order | Stable migration ID | Existing filename | Main schema objects |
|---:|---|---|---|
| 1 | `001_auth_accounts_sessions` | `001_auth_accounts_sessions.sql` | `chattbm_users` (including `email_verified_at`), `chattbm_auth_sessions` |
| 2 | `002_chat_history` | `002_chat_history.sql` | `chattbm_chat_history` |
| 3 | `002_google_oauth_identities` | `002_google_oauth_identities.sql` | `chattbm_oauth_identities` |
| 4 | `003_context_records` | `003_context_records.sql` | `chattbm_contexts` |
| 5 | `003_google_oauth_states` | `003_google_oauth_states.sql` | `chattbm_google_oauth_states` |
| 6 | `004_password_reset_tokens` | `004_password_reset_tokens.sql` | `chattbm_password_reset_tokens` |
| 7 | `005_auth_rate_limits` | `005_auth_rate_limits.sql` | `chattbm_auth_rate_limits` |
| 8 | `006_email_verification_tokens` | `006_email_verification_tokens.sql` | `chattbm_email_verification_tokens`; adds `email_verified_at` only if absent |

The stable ID is the filename without the `.sql` extension. The manifest's explicit order is authoritative; the numeric filename prefix is not sufficient to establish order.

## SQL dependency review

All eight SQL files were inspected on `feature/email-verification`.

- Migration 001 creates `chattbm_users` and `chattbm_auth_sessions`. It already defines `chattbm_users.email_verified_at`.
- Both migration 002 files create tables with foreign keys to `chattbm_users`.
- Both migration 003 files create tables with foreign keys to `chattbm_users`.
- Migration 004 creates password-reset tokens with a foreign key to `chattbm_users`.
- Migration 005 creates shared authentication rate-limit buckets and has no user-table foreign key.
- Migration 006 runs `ADD COLUMN IF NOT EXISTS email_verified_at` and creates `chattbm_email_verification_tokens` plus its three indexes. Since migration 001 already defines the column, the column alone cannot prove migration 006 is complete.
- The current `database/Postgres.js` bootstrap already creates several of these objects. A clean sequential replay therefore cannot be assumed to describe the state of an existing database.

The approved order satisfies the dependencies visible in the inspected SQL. It does not establish that migrations were historically executed in this order in any deployed environment.

## Important verification consequence for migration 006

A complete schema check for migration 006 must verify the token table, its expected columns, its unique token-hash constraint, and all three expected indexes. The presence of `chattbm_users.email_verified_at` is insufficient because migration 001 already creates that column. Staging diagnostic evidence so far found the column but did not find `chattbm_email_verification_tokens`; migration 006 must therefore not be adopted into a ledger based on the column alone.

## Requirements for a future executable manifest

Before implementation, the manifest contract must specify:

1. Unique stable ID for every file.
2. Unique positive integer order for every file.
3. Exact relative SQL file path.
4. SHA-256 checksum computed from the exact file bytes at runtime or during a reviewed release process.
5. Explicit dependency IDs where a migration depends on earlier schema.
6. Validation rejecting duplicate IDs, duplicate order values, missing files, unlisted SQL files, and dependency cycles.
7. No implicit application based solely on directory scanning or filename-prefix sorting.

A checksum must not be copied into this proposal as a permanent value without a defined byte encoding and a review process that updates the manifest when a new migration is intentionally added.

## Baseline adoption constraints

The manifest is not a record of deployed migration history. For an existing database without a ledger, a migration may be adopted into the ledger only after every expected object for that migration has been verified. Partial schema matches must stop reconciliation and require a separate reviewed plan.

## Review decisions

- [x] Explicit order above approved by the user.
- [ ] Filename-derived stable IDs approved.
- [ ] Dependency declarations as part of the future manifest approved.
- [ ] Checksum verification as a hard failure on mismatch approved.

## Safety boundary

This is a documentation proposal only. It does not add a runtime manifest, migration runner, ledger table, or SQL changes. It does not authorize staging or production database writes or merging PR #52.
