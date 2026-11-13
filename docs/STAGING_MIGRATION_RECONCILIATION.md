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


## 3A. Repository initialization provenance review (read-only)

The repository source was inspected to identify the origin of the three present tables not represented in migration files 001–005:

| Table | Repository initializer | Finding |
|---|---|---|
| `chattbm_conversations` | `database/Postgres.js`, `initializeDatabase()` | Created by application startup SQL; primary key and unique `(user_id, conversation_key)` match the inventory. No user foreign key is declared by this initializer. |
| `chattbm_google_oauth_handoffs` | `database/Postgres.js`, `initializeDatabase()` | Created by application startup SQL; primary key on `handoff_hash`, user foreign key, and expiry index are represented in the inventory. |
| `chattbm_memories` | `memory/PostgresMemoryPersistence.js`, `initialize()` | Created by Memory persistence initialization; primary key, unique `(user_id, memory_type, subject)`, JSON object check, and `(user_id, lifecycle)` index are represented in the inventory. The initializer does not declare a user foreign key. |

The same `database/Postgres.js` initializer also creates users, contexts, chat history, OAuth identities, Google OAuth states, and auth sessions. Those definitions align with the corresponding present tables at the column/index/constraint level reviewed in Run #34, subject to the explicit chat-history index difference below.

### Exact initialization-versus-inventory differences

1. `chattbm_chat_history`: the runtime initializer in `database/Postgres.js` creates the table and primary key but does not create `chattbm_chat_history_updated_at_idx`. Migration `002_chat_history.sql` does define that index. Run #34 reports only the primary-key index. This is a real difference between the migration definition and the runtime initializer, not evidence that the index exists under another name.
2. `chattbm_conversations`: application initializer creates it outside the migration set. The observed primary key and unique user/conversation key match. The initializer intentionally has no declared FK to users.
3. `chattbm_memories`: application initializer creates it outside the migration set. Its observed uniqueness and lifecycle index match the initializer. The initializer has no declared FK to users.
4. `chattbm_google_oauth_handoffs`: application initializer creates it outside the migration set, including the expiry index; observed metadata matches.

This source review establishes where the current application code declares these tables. It does **not** prove when the live staging objects were created, which historical code version created them, or whether the live schema has never drifted. Runtime initialization is also not a substitute for a migration ledger.

### Baseline decision

Do not add the three initializer-owned tables to the migration ledger as though historical migration execution were proven. A future baseline must explicitly record their source as application-initializer-managed (with the exact reviewed source revision), separately from migration-managed objects, and must only be created after a fresh read-only inventory and independent definition comparison. Do not change the initializers or staging database as part of this reconciliation review.


## 3B. Missing-table application contract review (read-only)

The application consumers and their SQL were inspected alongside migrations 004 and 005.

### `chattbm_password_reset_tokens` — migration 004

Application consumer: `auth/PasswordResetService.js`.

The service requires:
- `id` as a text identifier.
- `user_id` as text referencing `chattbm_users(id)), with cascade deletion consistent with the migration.
- A unique `token_hash`; the service stores a SHA-256 digest, not the raw reset token.
- `created_at` defaulting to `NOW()`, `expires_at`, and nullable `used_at`.
- Indexes on `(user_id, created_at DESC)` and `expires_at` as supplied by migration 004.

The migration's columns and constraints support the observed service SQL: create/reset invalidation, token lookup under row lock, one-time consumption, expiry check, and invalidation of remaining tokens. The users table is present and uses a text primary key, matching the migration's FK type. This is a source-level compatibility review, not proof of staging execution readiness or data state.

### `chattbm_auth_rate_limits` — migration 005

Application consumer: `auth/PostgresRateLimitStore.js`.

The adapter requires:
- `bucket_key` as text primary key (an HMAC-SHA-256 hex digest).
- `window_started_at`, `request_count`, `expires_at`, and `updated_at`.
- The `request_count >= 1` check.
- The expiry index used by bounded cleanup.

Its atomic upsert increments or resets counters based on expiry; cleanup selects expired buckets with `FOR UPDATE SKIP LOCKED` and deletes them. Migration 005 supplies the required columns, check, and index. The integration test `tests/sharedAuthRateLimit.integration.test.js` is explicitly gated to a local disposable database named `chattbm_test`; its setup executes migration 005 twice and tests the adapter there. That test is not evidence that migration 005 has run in staging.

### Review conclusion

At source level, migrations 004 and 005 appear compatible with their current application consumers and with the existing text primary key on `chattbm_users`. Run #34 reports both target tables absent, so there is no existing target-table definition to compare in staging. The migrations' `IF NOT EXISTS` clauses do not remove the need for fresh preflight checks, database identity verification, backup validation, and the guarded runner/ledger. No staging SQL was executed.


## 6A. Restore-validation coverage audit (Run #13, read-only)

The successful restore workflow was inspected at the exact job-log level (Run #13, job `132078771489`) and compared with its workflow patch in PR #77.

Verified by Run #13:
- The workflow selected the encrypted staging dump from the approved private R2 bucket.
- It decrypted the selected artifact successfully.
- `pg_restore --exit-on-error` restored the archive into a disposable PostgreSQL 18 database.
- The post-restore assertion counted public base tables whose names begin with `chattbm_` and required only that the count be at least five.
- The job completed successfully and emitted `RESTORE_VALIDATION_OK`.

**Coverage limitation:** this assertion does not check the exact expected table set, columns and types, nullability/defaults, primary/foreign/unique/check constraints, indexes, or representative data invariants/row counts. Therefore, Run #13 proves encrypted archive decryption and basic restore execution, but does not yet satisfy the stronger schema-specific restore gate required before migration work.

### Required next restore-validation enhancement

A separately reviewed workflow change should validate the restored disposable database against an explicit, version-controlled expected schema manifest. At minimum it should:
1. Assert the exact expected application table names, including the two currently missing tables only if the backup is expected to contain them; do not silently assume they exist.
2. Compare each restored table's columns, PostgreSQL types, nullability and defaults against the reviewed source definitions.
3. Compare primary keys, foreign keys, unique constraints, check constraints and indexes, including the missing chat-history updated-at index as an explicit expected mismatch rather than weakening the assertion.
4. Record non-sensitive row counts and validate selected referential/data invariants without printing user data.
5. Fail closed on unexpected or missing objects and emit a concise redacted diff.
6. Keep all restore operations confined to the disposable PostgreSQL service. Do not connect the restore validator to Render staging or production.

Until that enhanced validation passes, treat the existing backup as recoverable at the archive/basic-restore level only. Do not run staging migrations on the strength of Run #13 alone.



## 3C. Recovered Run #34 metadata detail (read-only)

The complete Run #34 job log was recovered and parsed again during this review. It contains:

- **56 column records** across the nine present application tables, including PostgreSQL data types and nullability.
- **23 index definitions** across those tables.
- **100 constraint metadata records**, including primary-key, unique, foreign-key, check, and catalog-derived not-null entries.

This confirms the inventory log contains enough column and index detail to build a more exact restore comparison for the objects that were present in the staging snapshot. It also independently confirms that `chattbm_chat_history` has only `chattbm_chat_history_pkey`; the expected `chattbm_chat_history_updated_at_idx` is absent.

**Metadata limitation:** the inventory's constraint output records foreign-key constraint names and local columns, but does not reliably expose the referenced table/column pair for those rows. The 100 records also include generated not-null checks, so that number must not be interpreted as 100 independent business constraints. A future manifest must derive FK targets and full check expressions from reviewed SQL/source definitions or improve the read-only inventory query. Do not fill those fields by guessing.

No database operation was performed while recovering or reviewing this log. The schema remains incomplete: the two expected migration tables are absent, and the chat-history index mismatch remains unresolved.



## 3D. Inventory endpoint ownership and constraint-metadata blocker

The read-only GitHub Actions workflow in `.github/workflows/staging-connection-check.yml` calls the Render diagnostic endpoint at `/api/internal/staging-db-check` and prints the returned `schema.columns`, `schema.indexes`, and `schema.constraints` arrays. PR #78 changes retry behavior and logging in that workflow; it does not implement the database metadata query itself.

A repository code search for the endpoint path, its schema response fields, and the staging diagnostic token found only workflow callers, not the deployed diagnostic service's route/query implementation. Therefore, the complete FK target and check-expression metadata cannot safely be added by editing the caller workflow alone.

### Required next step

Locate and inspect the source repository/service that deploys `chattbm-staging-db-check.onrender.com`. In that service, review the read-only SQL used to construct `schema.constraints` and extend it to return, at minimum:

- constraint type and name;
- ordered local column list;
- referenced schema, table, and ordered referenced column list for foreign keys;
- full check expression from PostgreSQL's catalog definition;
- deferrability and validation status where applicable.

Use PostgreSQL catalog joins (including `pg_constraint`, `pg_class`, `pg_namespace`, `pg_attribute`, and `pg_get_constraintdef`) with deterministic ordering. Keep the endpoint read-only and return metadata only; do not include row values or secrets. Add tests against a disposable PostgreSQL instance that includes composite foreign keys and check constraints before deploying any diagnostic-service change.

Until that service source is located and reviewed, do not claim that the inventory contains complete constraint definitions and do not generate a constraint validator from the incomplete array. No Render configuration, staging database, or production resource was changed by this review.
