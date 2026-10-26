# PostgreSQL Migration Test Strategy

**Status:** Design proposal only. No migration runner or production schema change is authorized by this document.
**Related evidence:** PR #48 and `docs/POSTGRES_MIGRATION_REVIEW_DECISION.md`.
**Scope:** Define disposable tests before implementation; preserve existing production data and legacy migration files.

## Known constraints

- Current SQL filenames have duplicate numeric prefixes (`002` and `003`); do not rename or delete legacy files as a shortcut.
- Startup bootstrap in `database/Postgres.js` and numbered SQL files currently overlap as schema-management paths.
- The live Render database has no identified common migration ledger. Its historical per-file migration execution is unknown.
- The live catalog comparison identified `chattbm_chat_history_updated_at_idx` as present in a legacy SQL definition but absent from the live index inventory. Investigate its workload value separately.
- The existing inventory test proves repeat application in one disposable PostgreSQL setup; it does not prove safe adoption of the existing live schema.

## Test scenarios required before choosing an implementation

### 1. Fresh database initialization

- Production Render database inventory reports PostgreSQL **18** (read-only metadata check on 2026-10-26). Use PostgreSQL 18 for the primary disposable test service; record the exact minor version in test output. Re-check the production major version before any rollout because it may change.
- Start a clean disposable PostgreSQL instance at the same major version used for the target deployment.
- Initialize schema using the proposed single authoritative path.
- Assert exact expected tables, columns, defaults, constraints, foreign keys, and indexes.
- Verify application startup and persistence integration tests.
- Run initialization a second time and assert the expected idempotent behavior.

### 2. Existing-schema baseline adoption

- Build a disposable database fixture from the reviewed schema inventory; do not copy user content, password hashes, OAuth tokens, or session values.
- Insert synthetic sentinel rows into representative user, conversation, chat-history, and memory tables before baseline adoption; capture their values and counts, then assert exact preservation after adoption.
- Adopt the proposed baseline without replaying legacy migrations against already-existing objects.
- Assert that adoption does not drop, rewrite, or silently weaken schema objects.
- Assert that the ledger clearly records a reviewed baseline while stating that historical per-file execution is unknown.
- Verify row counts or synthetic sentinel records remain unchanged where applicable.

### 3. Future migration behavior

- Apply a new migration with a unique immutable identifier and checksum.
- Re-run the runner and confirm the migration is not executed twice.
- Change a migration after it has been recorded and confirm checksum drift is rejected.
- Simulate migration failure; verify transaction rollback where supported, clear failure state, and a documented safe retry path.
- Test recovery from interrupted execution and concurrent runner starts.
- Confirm the runner refuses to apply legacy files automatically to an existing baseline.

### 4. Safety and rollout

- Confirm all migration tests are guarded to disposable databases and cannot use production `DATABASE_URL`.
- Verify backup and restore procedures using a non-production database.
- Document lock behavior, expected downtime, observability, rollback/forward-recovery, and operator stop conditions.
- Review the missing chat-history index independently, using representative synthetic data and query plans; do not bundle index repair with ledger adoption.
- Require a separate explicit approval before any production DDL or migration.

## Decision gates

Do not implement the runner until:
1. The schema comparison and ownership model are reviewed.
2. The authoritative schema path and empty-database initialization method are selected.
3. The test scenarios above are implemented and pass in disposable databases.
4. A backup/restore and rollout plan is reviewed.
5. Production execution is separately authorized.

## Current disposition

Design only. No production SQL has been executed. No legacy migration file should be renamed or deleted. Payment-provider integration remains deferred until the database strategy is reviewed and safely validated.
