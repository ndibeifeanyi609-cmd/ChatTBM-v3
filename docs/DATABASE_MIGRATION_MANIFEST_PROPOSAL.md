# Database Migration Manifest Proposal

**Status:** Explicit migration order approved; remaining manifest rules are still proposals  
**Branch:** `docs/database-migration-baseline-design`  
**Scope:** Historical migration inventory and deterministic ordering only

## Purpose

The existing migration filenames contain duplicate numeric prefixes. A runner must not infer order by sorting those prefixes. This proposal assigns each existing file a unique manifest order while preserving every historical filename and SQL body.

## Approved manifest order

The user approved this explicit order on 2026-10-31:

| Order | Stable migration ID | Existing filename | Schema objects |
|---:|---|---|---|
| 1 | `001_auth_accounts_sessions` | `001_auth_accounts_sessions.sql` | `chattbm_users`, `chattbm_auth_sessions` |
| 2 | `002_chat_history` | `002_chat_history.sql` | `chattbm_chat_history` |
| 3 | `002_google_oauth_identities` | `002_google_oauth_identities.sql` | `chattbm_oauth_identities` |
| 4 | `003_context_records` | `003_context_records.sql` | `chattbm_contexts` |
| 5 | `003_google_oauth_states` | `003_google_oauth_states.sql` | `chattbm_google_oauth_states` |
| 6 | `004_password_reset_tokens` | `004_password_reset_tokens.sql` | `chattbm_password_reset_tokens` |
| 7 | `005_auth_rate_limits` | `005_auth_rate_limits.sql` | `chattbm_auth_rate_limits` |
| 8 | `006_email_verification_tokens` | `006_email_verification_tokens.sql` | `chattbm_users.email_verified_at`, `chattbm_email_verification_tokens` |

The stable ID is the filename without the `.sql` extension. The manifest's explicit order is authoritative; the numeric filename prefix is not sufficient to establish order.

## Dependency review

- Migration 001 creates `chattbm_users`, which is referenced by migrations 002, 003, and 004.
- Both migration 002 files depend on `chattbm_users`.
- Both migration 003 files depend on `chattbm_users`.
- Migration 004 depends on `chattbm_users`.
- Migration 005 has no foreign-key dependency on the user table in its current SQL.
- Migration 006 alters `chattbm_users` and creates a token table referencing it.
- The current `database/Postgres.js` bootstrap already creates several of these objects. This is why a clean sequential replay cannot be assumed to describe the state of an existing database.

The approved order satisfies the dependencies visible in the inspected SQL. It does not establish that migrations were historically executed in this order in any deployed environment.

## Requirements for a future executable manifest

Before implementation, the manifest contract must specify:

1. Unique stable ID for every file.
2. Unique positive integer order for every file.
3. Exact relative SQL file path.
4. SHA-256 checksum computed from the exact file bytes at runtime or during a reviewed release process.
5. Explicit dependency IDs where a migration depends on earlier schema.
6. A validation that rejects duplicate IDs, duplicate order values, missing files, unlisted SQL files, and dependency cycles.
7. No implicit application based solely on directory scanning or filename prefix sorting.

A checksum must not be copied into this proposal as a permanent value without a defined byte encoding and a review process that updates the manifest when a new migration is intentionally added.

## Baseline adoption constraints

The manifest is not a record of deployed migration history. For an existing database without a ledger, a migration may be adopted into the ledger only after every expected object for that migration has been verified. Partial schema matches must stop reconciliation and require a separate reviewed plan.

In particular, the observed staging presence of `chattbm_users.email_verified_at` does not prove migration 006 is complete; the token table and its indexes must also be verified.

## Review decisions

- [x] Explicit order above approved by the user.
- [ ] Filename-derived stable IDs approved.
- [ ] Dependency declarations as part of the future manifest approved.
- [ ] Checksum verification as a hard failure on mismatch approved.

## Safety boundary

This is a documentation proposal only. It does not add a runtime manifest, migration runner, ledger table, or SQL changes. It does not authorize staging or production database writes or merging PR #52.
