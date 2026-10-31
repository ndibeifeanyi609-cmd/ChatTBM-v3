# Database Migration Baseline and Ledger Design

**Status:** Approved design; implementation not yet authorized  
**Scope:** Repository migration design and disposable-database verification only  
**Related:** `database/Postgres.js`, `database/migrations/*.sql`, `docs/SHARED_AUTH_RATE_LIMIT_SCHEMA_PROCEDURE.md`, `docs/PLUGIN_DECISIONS.md`

## 1. Purpose

Establish a safe, auditable way to reconcile ChatTBM's existing PostgreSQL schema with its numbered SQL migrations, then apply future migrations in a deterministic order.

This design does not authorize SQL changes to staging or production, a production startup migration runner, merging PR #52, or changing existing user data.

## 2. Verified current-state findings

The reviewed repository has two schema mechanisms:

- `database/Postgres.js` creates core tables during `initializeDatabase()`.
- `database/migrations/` contains eight SQL files.

The migration directory currently contains duplicate numeric prefixes:

- `002_chat_history.sql`
- `002_google_oauth_identities.sql`
- `003_context_records.sql`
- `003_google_oauth_states.sql`

The SQL files use repeatable `IF NOT EXISTS` statements, but repeatability alone does not prove that a migration has been applied or that its resulting schema is correct.

The read-only staging diagnostic observed:

- `chattbm_users.email_verified_at` exists.
- `chattbm_email_verification_tokens` was not present in the reported schema inventory.
- `chattbm_schema_migrations` does not exist.
- No migration records were returned.

Therefore migration 006 is **not verified as fully applied**. The presence of its user column is only partial schema evidence. A future baseline reconciliation must verify the token table, columns, constraints, and indexes before recording migration 006 as applied.

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

## 4. Migration identity and ordering

The existing SQL filenames are historical artifacts and must not be silently renamed or rewritten as part of this design.

Before a runner is implemented, introduce a reviewed, explicit migration manifest that lists every existing filename exactly once in a deterministic order. The manifest must resolve the duplicate 002 and 003 prefixes explicitly. The initial proposed ordering is:

1. `001_auth_accounts_sessions.sql`
2. `002_chat_history.sql`
3. `002_google_oauth_identities.sql`
4. `003_context_records.sql`
5. `003_google_oauth_states.sql`
6. `004_password_reset_tokens.sql`
7. `005_auth_rate_limits.sql`
8. `006_email_verification_tokens.sql`

This is a proposed deterministic ordering, not proof that every migration has been applied in every environment. The runner must use the manifest rather than relying on numeric-prefix sorting. New migrations must receive unique, monotonically increasing identifiers after the historical set has been reconciled.

## 5. Migration ledger

Proposed table: `chattbm_schema_migrations`.

Minimum fields:

| Field | Purpose |
| --- | --- |
| `migration_id` | Stable unique identity from the reviewed manifest |
| `filename` | Exact historical SQL filename |
| `checksum` | SHA-256 checksum of the exact migration file bytes |
| `applied_at` | Timestamp recorded by PostgreSQL |
| `execution_mode` | Distinguishes a verified baseline adoption from runner execution |

The implementation may add runner/version metadata if justified by tests. The ledger must have a primary key or unique constraint on `migration_id`, and must prevent duplicate filename registration.

A checksum mismatch for an already-recorded migration is a hard failure. The runner must not silently update the checksum or re-run modified historical SQL.

## 6. Existing-database baseline reconciliation

A new database and an existing database require different paths.

### New database

- Establish the required bootstrap prerequisites.
- Apply the reviewed migration manifest in order.
- Record each successful migration in the ledger in the same transaction as its schema change, where transaction semantics permit.
- Verify the final schema against expected objects.

### Existing database without a ledger

- Inspect tables, columns, types, nullability, defaults, indexes, constraints, and relevant foreign keys.
- Compare the observed schema with each migration's complete expected result.
- Adopt a migration into the ledger only when all required schema objects for that migration are present and compatible.
- Do not infer that a migration is complete from one matching table or column.
- If a migration is partially present, record no successful application for it; stop and require a reviewed reconciliation plan.
- Do not drop, truncate, rewrite, or bulk-update existing application data during baseline adoption.

### Specific migration 006 handling

The observed staging schema already has `chattbm_users.email_verified_at`, but the diagnostic did not find `chattbm_email_verification_tokens`.

Accordingly:

- Do not mark migration 006 as applied based only on the column.
- Verify the token table and all three expected indexes plus column definitions and constraints.
- If they remain absent, the migration remains pending.
- Its `ADD COLUMN IF NOT EXISTS` statement should safely preserve the existing column when the reviewed migration is later run in a controlled, approved step.

## 7. Bootstrap and runner boundary

For the initial rollout, `database/Postgres.js` remains responsible for connection setup and current legacy bootstrap compatibility.

The migration runner must not be enabled on production startup until:

- the legacy bootstrap schema is inventoried;
- all historical migrations have a verified baseline strategy;
- duplicate numbering is resolved by the explicit manifest;
- clean-database and existing-database paths pass disposable tests;
- migration failure and restart behavior are verified;
- backup and rollback procedures are reviewed.

After those gates, a separate implementation decision may determine whether the runner is an explicit deployment command or a controlled startup phase. This design does not choose automatic production startup execution.

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

All tests below must use a dedicated disposable PostgreSQL database with explicit safeguards. No shared or Render database may be used for destructive tests.

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

The tests must also verify expected column types/nullability, indexes, primary/foreign keys, and constraints—not only table existence.

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
2. **Manifest:** Add and review the explicit historical migration manifest.
3. **Ledger design:** Finalize ledger constraints, checksum encoding, and baseline-adoption representation.
4. **Runner implementation:** Implement only after the manifest and ledger contract are approved.
5. **Disposable verification:** Pass the full matrix in Section 9.
6. **Documentation/checkpoint:** Record test evidence, backup/rollback procedure, and exact remaining risks.
7. **Staging approval:** Request approval for a specific staging database operation.
8. **Production approval:** Treat production as a separate release gate.

## 12. Explicitly out of scope

- Running SQL against staging or production.
- Creating the ledger on any Render database.
- Applying migration 006.
- Enabling automatic migrations during production startup.
- Merging PR #52 or changing its review status.
- Enforcing email verification at login.
- Enabling any feature that depends on a schema change.

## 13. Current decision

**Approved:** Design the baseline-and-ledger approach and prepare for isolated implementation/testing.

**Not approved:** Repository migration-runner implementation, Render database writes, staging rollout, production rollout, or PR #52 merge.

The next implementation proposal must be reviewed against this document before code or database changes are made.
