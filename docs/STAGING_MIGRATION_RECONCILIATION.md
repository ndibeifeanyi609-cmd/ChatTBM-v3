# Staging Database Migration Reconciliation Report

**Status:** Review document only. No migration has been executed or authorized.  
**Target:** Render database `chattbm-staging-isolated` (`chattbm_staging_isolated`).  
**Safety boundary:** Production database and production service are out of scope. This report does not authorize database writes, deployment, PR merge, or changes to database access rules.

## 1. Evidence reviewed

The report compares the read-only staging inventory from GitHub Actions run `42478802644` (job `128726001394`) with the repository migration files:

- `database/migrations/001_auth_accounts_sessions.sql`
- `database/migrations/002_chat_history.sql`
- `database/migrations/002_google_oauth_identities.sql`
- `database/migrations/003_context_records.sql`
- `database/migrations/003_google_oauth_states.sql`
- `database/migrations/004_password_reset_tokens.sql`
- `database/migrations/005_auth_rate_limits.sql`

The inventory connected to the isolated staging database in read-only mode. It reported nine existing application tables, two missing expected tables, no unexpected application tables, and zero rows in the users table. The inventory did not execute DDL or change database contents.

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

No unexpected application tables were reported. The users table row count was zero at the time of the inventory.

## 3. Migration comparison

| Migration file | Observation | Assessment |
|---|---|---|
| `001_auth_accounts_sessions.sql` | Users and sessions tables, expected key relationships and session indexes were present in the inspected metadata. | Structurally consistent with the inspected definitions. This does not prove when or how the schema was created. |
| `002_chat_history.sql` | Chat history table and primary key were present, but `chattbm_chat_history_updated_at_idx` was absent. | Confirmed schema mismatch requiring a reviewed reconciliation plan. |
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

1. **Resolve the chat-history index mismatch.** Prepare a narrowly scoped, reviewed reconciliation for the absent `chattbm_chat_history_updated_at_idx`. Verify the exact intended index definition and confirm whether an equivalent index exists under another name before proposing SQL.
2. **Stabilize migration identity.** Assign each migration a unique immutable identifier independent of its numeric filename prefix. Record the exact filename and SHA-256 checksum.
3. **Reconcile existing schema history.** Establish the provenance of all existing application tables, especially the three tables not represented in the inspected migration set. Do not infer migration history from table existence.
4. **Review runner and ledger behavior.** Require checksum mismatch to stop execution; use an advisory lock; write migration and ledger record atomically; and independently verify schema before marking a migration applied.
5. **Verify backup and restore.** The prior GitHub-runner backup attempt failed during the external PostgreSQL connection with `SSL connection has been closed unexpectedly`. No dump, object-storage upload/download, or restore verification was completed. A verified backup/restore is therefore still a blocking gate.
6. **Review migration 004 and 005 preconditions.** Confirm exact table, constraint, index and foreign-key definitions against the current staging schema and runner behavior before proposing execution.
7. **Request separate explicit approval.** Any staging database write requires a separate approval after the above evidence is reviewed. Production remains prohibited.

## 6. Backup status

The manual-only encrypted staging backup workflow has been merged, but the attempted run did not complete. It did not produce a verified backup artifact or a successful restore. Workflow existence and successful code checks are not evidence of a completed backup.

Do not broaden the staging database IP allowlist to `0.0.0.0/0` to work around the connection failure. Prefer a controlled staging-side execution path using the Render private network, subject to separate review and approval.

## 7. Explicit non-actions

At the time of this report:

- No staging migration has been run.
- No staging schema or data has been changed.
- No verified backup/restore has been completed.
- No production database or production service has been touched.
- No draft pull request has been merged or marked ready for review.
- No database allowlist has been widened.

## 8. Decision

**Do not run migrations yet.** The next safe engineering task is to finish the schema reconciliation and migration-history design, then establish a verified staging backup/restore path. Only after those gates pass should a separate staging-only migration plan be submitted for approval.
