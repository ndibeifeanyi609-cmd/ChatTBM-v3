# Database Migration Baseline and Ledger Design

**Status:** Approved design; implementation not yet authorized  
**Scope:** Repository migration design and disposable-database verification only  
**Related:** `database/Postgres.js`, `database/migrations/*.sql`, `docs/SHARED_AUTH_RATE_LIMIT_SCHEMA_PROCEDURE.md`, `docs/PLUGIN_DECISIONS.md`, `docs/DATABASE_MIGRATION_MANIFEST_PROPOSAL.md`, `docs/DATABASE_MIGRATION_SCHEMA_VERIFICATION.md`, `docs/DATABASE_MIGRATION_LEDGER_CONTRACT.md`

## 1. Purpose

Establish a safe, auditable way to reconcile ChatTBM's existing PostgreSQL schema with its numbered SQL migrations, then apply future migrations in a deterministic order.

This design does not authorize SQL changes to staging or production, a production startup migration runner, merging PR #52, or changing existing user data.

## 2. Verified current-state findings

The reviewed repository has two schema mechanisms:

- `database/Postgres.js` creates core tables during `initializeDatabase()`.
- `database/migrations/` contains eight SQL files.

The migration directory contains duplicate numeric prefixes: two files each with prefixes 002 and 003. The SQL files use repeatable `IF NOT EXISTS` statements, but repeatability alone does not prove that a migration has been applied or that its resulting schema is correct.

The read-only staging diagnostic observed:

- `chattbm_users.email_verified_at` exists.
- `chattbm_email_verification_tokens` was not present in the reported schema inventory.
- `chattbm_schema_migrations` does not exist.
- No migration records were returned.

Therefore migration 006 is **not verified as fully applied**. The presence of its user column is only partial schema evidence. A future baseline reconciliation must verify the token table, columns, constraints, and all three indexes before recording migration 006 as applied.

## 3. Design principles

1. Preserve existing bootstrap behavior during the initial migration-system rollout.
2. Never blindly replay all historical SQL files against an existing database.
3. Treat schema inspection as evidence, not as a substitute for migration history.
4. Use stable migration identities and deterministic ordering.
5. Record checksums so edits to historical migration SQL are detected.
6. Run migrations transactionally where PostgreSQL supports the statements involved.
7. Fail closed on unknown, partial, or conflicting schema states.
8. Separate schema application from feature enablement and route rollout.
9. Test all behavior against a disposable PostgreSQL database before staging approval.
10. Keep staging and production writes behind separate, explicit approvals.

## 4. Migration identity and approved ordering

The existing SQL filenames are historical artifacts and must not be silently renamed or rewritten as part of this design.

The user approved the following explicit historical order on 2026-10-31. The manifest must use these exact entries and order; numeric filename prefixes are not sufficient:

1. `001_auth_accounts_sessions.sql`
2. `002_chat_history.sql`
3. `002_google_oauth_identities.sql`
4. `003_context_records.sql`
5. `003_google_oauth_states.sql`
6. `004_password_reset_tokens.sql`
7. `005_auth_rate_limits.sql`
8. `006_email_verification_tokens.sql`

The proposed stable ID is each filename without `.sql`. The SQL dependency review found this order satisfies visible foreign-key prerequisites. It does not establish historical execution order in any deployed environment. See `DATABASE_MIGRATION_MANIFEST_PROPOSAL.md` for the complete mapping and manifest requirements.

## 5. Migration ledger contract

Proposed table: `chattbm_schema_migrations`. The detailed contract is in `DATABASE_MIGRATION_LEDGER_CONTRACT.md`.

The proposed record includes:

- `migration_id`: stable unique manifest identity; primary key.
- `filename`: exact relative SQL path; unique.
- `checksum_sha256`: lowercase SHA-256 digest of exact committed SQL bytes.
- `manifest_order`: unique positive integer matching the reviewed manifest.
- `execution_mode`: `runner` or `baseline_adoption`.
- `applied_at`: database-generated timestamp with time zone.
- `runner_version`: optional runner version/commit; null for baseline adoption.
- `evidence_reference` and `adopted_by`: required for baseline adoption.

Checksum mismatch, unknown migration IDs, schema/ledger disagreement, and malformed metadata are hard failures. Baseline adoption and runner execution are distinct operations and require separate approvals. A baseline adoption records verified existing schema; it does not execute historical SQL.

## 6. Existing-database baseline reconciliation

A new database and an existing database require different paths.

### New database

- Establish and document the required bootstrap prerequisites.
- Apply the reviewed migration manifest in order.
- Record each successful migration in the ledger in the same transaction as its schema change, where transaction semantics permit.
- Verify the final schema against the schema verification matrix.
- Resolve the interaction between current `initializeDatabase()` bootstrap DDL and migration execution before implementation; do not assume both can be run in either order without tests.

### Existing database without a ledger

- Perform read-only inspection of tables, columns, types, nullability, defaults, indexes, constraints, and relevant foreign keys.
- Compare the observed schema with each migration's complete expected result using `DATABASE_MIGRATION_SCHEMA_VERIFICATION.md`.
- Adopt a migration into the ledger only when its verifier outcome is `COMPLETE` and a separate approval identifies the exact database and migration IDs.
- Do not infer that a migration is complete from one matching table or column.
- If a migration is partial or conflicting, record no successful application for it; stop and require a reviewed reconciliation plan.
- Do not drop, truncate, rewrite, or bulk-update existing application data during baseline adoption.
- Read-only inspection must not create the ledger as a side effect.

### Specific migration 006 handling

The observed staging schema already has `chattbm_users.email_verified_at`, but the diagnostic did not find `chattbm_email_verification_tokens`.

Accordingly:

- Do not mark migration 006 as applied based only on the column.
- Verify the token table, its expected columns and constraints, and all three expected indexes.
- If any required object is absent or incompatible, migration 006 is not eligible for baseline adoption.
- Its `ADD COLUMN IF NOT EXISTS` statement should preserve the existing column when the reviewed migration is later run in a controlled, approved step.

## 7. Bootstrap and runner boundary

For the initial rollout, `database/Postgres.js` remains responsible for connection setup and current legacy bootstrap compatibility.

The migration runner must not be enabled on production startup until:

- the legacy bootstrap schema is inventoried;
- all historical migrations have a verified baseline strategy;
- the approved explicit manifest is implemented and validated;
- clean-database and existing-database paths pass disposable tests;
- migration failure and restart behavior are verified;
- backup and rollback procedures are reviewed.

A separate implementation decision must determine whether the runner is an explicit deployment command or a controlled startup phase. This design does not authorize automatic production startup execution.

## 8. Transaction, locking, and failure behavior

The implementation must:

- acquire a PostgreSQL advisory lock or equivalent coordination mechanism so two instances cannot apply the same migration concurrently;
- use a transaction for each migration and its ledger insert when the SQL is transaction-compatible;
- roll back the migration and ledger insert together on failure;
- leave earlier successful migrations recorded;
- stop immediately on an unexpected schema state or checksum mismatch;
- never continue to later migrations after a failure;
- avoid logging connection strings, credentials, raw tokens, or sensitive row data.

Any migration containing statements that cannot run inside a transaction must be explicitly identified and receive a separately reviewed execution strategy.

## 9. Disposable-database verification matrix

All tests must use a dedicated disposable PostgreSQL database with explicit safeguards. No shared or Render database may be used for destructive tests.

| Scenario | Required result |
| --- | --- |
| Empty database | Manifest applies in deterministic order; expected schema and ledger rows exist |
| Existing bootstrap-created schema, no ledger | Verified baseline adoption; no historical data loss |
| Fully initialized schema | Reconciliation is idempotent |
| Partial migration schema | Runner stops; no false ledger entry |
| Migration run twice | Second run performs no duplicate application |
| Checksum changed after ledger entry | Hard failure; no SQL execution |
| Two concurrent runner processes | Only one process applies a given migration |
| Migration SQL failure | Current migration and ledger insert roll back |
| Restart after earlier successful migrations | Completed migrations remain recorded; runner resumes safely |
| Existing user and conversation records | Counts and representative records remain unchanged |

Tests must verify expected column types/nullability, defaults, indexes, primary/foreign keys, and check/unique constraints—not only table existence. Include the specific partial migration 006 fixture described in the schema verification document.

## 10. Backup and rollback requirements

Before any staging schema write is proposed:

1. Confirm which Render PostgreSQL instance belongs to the staging service.
2. Confirm a recent restorable backup or snapshot and document its recovery procedure.
3. Review whether each planned migration is additive and whether rollback is a forward fix or restore.
4. Define a read-only post-application verification query set.
5. Obtain explicit approval for the exact staging operation.

Production requires a separate review and approval. A successful staging migration does not authorize production execution.

## 11. Implementation sequence and gates

1. **Inventory:** Complete the schema-object inventory and migration dependency review.
2. **Manifest:** Review and finalize the approved explicit historical manifest, stable IDs, dependencies, and exact-byte checksums.
3. **Schema verifier:** Implement and test the read-only schema verification matrix in a disposable database.
4. **Ledger contract:** Finalize ledger constraints, checksum encoding, and baseline-adoption evidence.
5. **Runner implementation:** Implement only after separate approval of the implementation scope.
6. **Disposable verification:** Pass the full matrix in Section 9.
7. **Documentation/checkpoint:** Record test evidence, backup/rollback procedure, and exact remaining risks.
8. **Staging approval:** Request approval for a specific staging database operation.
9. **Production approval:** Treat production as a separate release gate.

## 12. Explicitly out of scope

- Running SQL against staging or production.
- Creating the ledger on any Render database.
- Applying migration 006.
- Enabling automatic migrations during production startup.
- Merging PR #52 or changing its review status.
- Enforcing email verification at login.
- Enabling any feature that depends on a schema change.

## 13. Current decision

**Approved:** Documentation and design of the baseline-and-ledger approach, the explicit historical migration order, and the schema/ledger contracts.

**Not approved:** Runtime migration manifest, schema-checker implementation, migration-runner implementation, Render database writes, staging rollout, production rollout, or PR #52 merge.

Any implementation must be separately proposed and approved before code or database changes are made.
