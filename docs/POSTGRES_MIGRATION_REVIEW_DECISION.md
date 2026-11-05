# PostgreSQL Migration Reconciliation — Review Decision

**Status:** Review proposal only. No production action is authorized by this document.  
**Database:** Render `chattbm-db` / `chattbm_db`  
**Related work:** Draft PR #48

## Current evidence

- The disposable PostgreSQL 16 migration inventory passed and re-applied all seven existing SQL files twice.
- The live database has no identified common migration-ledger table.
- Duplicate numeric prefixes remain in the legacy SQL filenames. They must not be renamed or deleted as a compatibility shortcut.
- The live catalog comparison found one confirmed index difference: `chattbm_chat_history_updated_at_idx` is defined by `002_chat_history.sql` but absent from the live index list.
- Inspected live columns, key constraints, foreign keys, and key checks for migration-managed and bootstrap-only tables matched the available definitions.
- Historical execution of individual legacy migration files remains unknown.

## Review decisions proposed

### A. Missing index

Treat the missing index as a schema difference, not an automatic production repair. First inspect relevant query patterns and test with representative data on a disposable production-like database. If it is justified, propose a separate reviewed repair with a lock/concurrency plan. Do not bundle it with migration-ledger work.

### B. Migration history and future ledger

- Do not fabricate per-file execution history from the existence of schema objects.
- After a reviewer approves the full schema comparison, consider one explicit baseline record that states the existing schema was reviewed and legacy per-file history is unknown.
- Track only future migrations using unique immutable identifiers and checksums.
- Keep legacy files untouched and prevent a future runner from automatically replaying them against an existing database.
- Define a single authoritative schema-management path. Startup bootstrap and migration files must not remain competing sources of truth.
- Specify how an empty database is initialized before implementing a runner.

### C. Acceptance gates before any production change

1. Reviewer sign-off on the schema comparison.
2. Disposable tests for fresh initialization and baseline adoption.
3. Repeat-run, checksum-drift, failed-migration/retry, and recovery tests.
4. Passing startup and persistence integration tests.
5. Reviewed backup/restore and rollout plan.
6. Separate approval for any production DDL or migration.

## Current disposition

Inventory and planning only. No production writes, DDL, or migrations were run. PR #48 is open for review and remains unmerged. Because the repository has a single maintainer, this is a maintainer self-review checkpoint rather than independent approval. Flutterwave work remains deferred until the schema changeover plan is reviewed and the required acceptance gates are completed.