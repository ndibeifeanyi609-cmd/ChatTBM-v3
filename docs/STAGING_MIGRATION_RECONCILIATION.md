# Staging Database Migration Reconciliation Report

**Status:** Review document only. No migration has been executed or authorized.  
**Target:** Render database `chattbm-staging-isolated` (`chattbm_staging_isolated`).  
**Safety boundary:** Production database and production service are out of scope. This report does not authorize database writes, deployment, PR merge, or changes to database access rules.

## 1. Evidence reviewed

The report compares the read-only staging inventory from GitHub Actions Run #34 (`43486507387`, job `132096265797`, commit `46e7e36ee064c119f6a31089db0812d315b8199b`) with the repository migration files. Run #34 completed its read-only inspection but correctly exited non-zero because required schema objects are missing:

- `database/migrations/001_auth_accounts_sessions.sql`
- `database/migrations/002_chat_history.sql`
- `database/migrations/002_google_oauth_identities.sql`
- `database/migrations/003_context_records.sql`
- `database/migrations/003_google_oauth_states.sql`
- `database/migrations/004_password_reset_tokens.sql`
- `database/migrations/005_auth_rate_limits.sql`

The inventory connected to `chattbm_staging_isolated` in read-only mode. It reported nine existing application tables, two missing expected tables, no unexpected application tables, and **one row** in `chattbm_users` at the time of Run #34. This supersedes the earlier inventory's zero-user-row observation. The inventory did not execute DDL or change database contents. Complete column, index, and constraint metadata was emitted in the Run #34 job log.

## 2. Observed staging schema

Present tables:

- `chattbm_auth_sessions`
- `chattbm_chat_history`
- `chattbm_contexts`
- `chattbm_conversations`
- `chattbm_google_oauth_handoffs`
- `chattbm_google_oauth_states`
- `chattbm_memories`
- `chattbm_oauth_identities`
- `chattbm_users`

Missing expected tables:

- `chattbm_auth_rate_limits`
- `chattbm_password_reset_tokens`

No unexpected application tables were reported. The users table row count was **one** at the time of Run #34. Do not assume this count remains current.


## 2A. Latest read-only inventory evidence (Run #34)

Run #34 (`43486507387`) successfully connected to `chattbm_staging_isolated` with the read-only diagnostic. The workflow's final schema gate failed because expected schema objects are absent; this is a schema finding, not a connection timeout.

- Present application tables: the nine names listed in Section 2.
- Missing application tables: `chattbm_password_reset_tokens` and `chattbm_auth_rate_limits`.
- Missing expected migration tables: the same two tables.
- Unexpected application tables: none.
- `chattbm_users` row count: 1 (as of this inventory only).
- `chattbm_chat_history` indexes: only the primary-key index was reported; `chattbm_chat_history_updated_at_idx` from migration 002 was absent.
- Run #34 emitted full column, index, and constraint metadata. The metadata should be used for the next exact-definition comparison; the workflow did not write to the database.

The Run #34 workflow intentionally exits non-zero when required tables are absent. Do not rerun it expecting green until the schema differences have been reconciled and a separately approved staging change is completed.

## 3. Migration comparison

| Migration file | Observation | Assessment |
|---|---|---|
| `001_auth_accounts_sessions.sql` | Users and sessions tables, expected key relationships and session indexes were present in the inspected metadata. | Structurally consistent with the inspected definitions. This does not prove when or how the schema was created. |
| `002_chat_history.sql` | Chat history table and primary key were present, but `chattbm_chat_history_updated_at_idx` was absent from the complete Run #34 index definitions. | Confirmed schema mismatch requiring a reviewed reconciliation plan. The migration defines `(user_id, updated_at DESC)`; no equivalent index was reported under another name. |
| `002_google_oauth_identities.sql` | OAuth identities table, uniqueness constraints and user relationship were present. | Structurally consistent with inspected definitions; execution history remains unproven. |
| `003_context_records.sql` | Context table, primary key, user/interaction uniqueness and expected indexes/checks were present. | Structurally consistent with inspected definitions; execution history remains unproven. |
| `003_google_oauth_states.sql` | Google OAuth states table, primary key and expiry index were present. | Structurally consistent with inspected definitions; execution history remains unproven. |
| `004_password_reset_tokens.sql` | Password reset tokens table was absent. | Expected schema is missing; do not apply until migration preconditions and backup/restore gates are satisfied. |
| `005_auth_rate_limits.sql` | Auth rate limits table was absent. | Expected schema is missing; do not apply until migration preconditions and backup/restore gates are satisfied. |

The additional tables `chattbm_conversations`, `chattbm_google_oauth_handoffs`, and `chattbm_memories` were present but are not defined by the migration files listed above. Their provenance must be established from the complete repository history and schema ownership before any baseline is declared.

## 4. Migration-history ambiguity

The migration directory contains duplicate numeric prefixes:

- Two files begin with `002_`.
- Two files begin with `003_`.

A migration runner or ledger must therefore identify migrations by stable, unique identifiers and exact filenames, not by numeric prefix alone.

Table existence is not proof that a particular migration ran. The repository does not yet have verified historical migration records sufficient to establish that the existing staging schema was produced by these exact file versions.

Do not retroactively populate a migration ledger by assuming that present tables mean migrations were applied.

## 5. Required work before any staging write

1. **Resolve the chat-history index mismatch.** Run #34's complete index definitions show only `chattbm_chat_history_pkey` for `chattbm_chat_history`; the migration's `chattbm_chat_history_updated_at_idx` on `(user_id, updated_at DESC)` is absent and no equivalent index was reported. Prepare a narrowly scoped, reviewed reconciliation plan, including an existence check and impact assessment, before proposing SQL.
2. **Stabilize migration identity.** Assign each migration a unique immutable identifier independent of its numeric filename prefix. Record the exact filename and SHA-256 checksum.
3. **Reconcile existing schema history.** Establish the provenance of all existing application tables, especially the three tables not represented in the inspected migration set. Do not infer migration history from table existence.
4. **Review runner and ledger behavior.** Require checksum mismatch to stop execution; use an advisory lock; write migration and ledger record atomically; and independently verify schema before marking a migration applied.
5. **Verify backup and restore.** This gate has now passed for the tested encrypted staging artifact: Render created and uploaded the dump, and GitHub Actions Run #13 downloaded it from the approved R2 bucket, decrypted it, and restored it into a disposable PostgreSQL 18 instance. The restore check confirmed at least five `chattbm_` tables. This proves basic archive recoverability for that artifact; it does not replace the separate schema, migration-history, constraint, index, or data-integrity reviews.
6. **Review migration 004 and 005 preconditions.** Confirm exact table, constraint, index and foreign-key definitions against the current staging schema and runner behavior before proposing execution.
7. **Request separate explicit approval.** Any staging database write requires a separate approval after the above evidence is reviewed. Production remains prohibited.

## 6. Backup status

**Verified staging backup artifact:**

- R2 bucket: `chattbm-staging-backups` (private)
- Object: `chattbm-staging-20261113T130743Z-00e2145951d2170412bc0c7408dc9f1e.dump.gpg`
- SHA-256: `87161d32d15ac5c2027e61489561f99e9e7147d4bab2f8c7ea7a3ac556d80f33`
- Encrypted size: `25799` bytes
- Render Cron Job: completed successfully; upload and size verification reported successful
- GitHub Actions Run #13: completed successfully; selected this exact object, downloaded it, decrypted it, and restored it into disposable PostgreSQL 18
- Restore log: `RESTORE_VALIDATION_OK: core ChatTBM tables restored in disposable PostgreSQL.`

The earlier GitHub-runner attempt to connect directly to Render PostgreSQL failed with `SSL connection has been closed unexpectedly`. The workflow was changed so GitHub no longer connects to the staging database; it validates a backup produced by the Render-side job instead.

**Scope limitation:** Run #13's restore assertion checks for at least five `chattbm_` tables. It does not independently prove every expected table, column, constraint, index, row count, or application-level invariant. A stronger schema-specific restore validation remains desirable before migrations.

Do not broaden the staging database IP allowlist to `0.0.0.0/0`. Keep backup creation on the controlled Render staging-side path.

## 7. Explicit non-actions

At the time of this report:

- No staging migration has been run.
- No staging schema or data has been changed. Run #34 was read-only; it observed one existing user row and did not modify it.
- The encrypted backup/restore gate has passed for the artifact and scope recorded in Section 6; broader schema/data-integrity verification remains outstanding.
- No production database or production service has been touched.
- No draft pull request has been merged or marked ready for review.
- No database allowlist has been widened.

## 8. Decision

**Do not run migrations yet.** The basic encrypted backup/restore gate now passes, but schema reconciliation, migration identity/history, the chat-history index mismatch, and migration 004/005 preconditions remain unresolved. Complete those reviews and a stronger schema-specific restore check before submitting a separate staging-only migration plan for explicit approval.
