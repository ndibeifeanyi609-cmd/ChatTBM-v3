# PR #79 Migration Runner Review

**Review status:** Static review only; PR #79 remains Draft and unmerged.
**Scope:** `feat/staging-migration-ledger-procedure`.
**No workflow was run. No database was contacted or modified.**

## What is sound

- Uses an explicit manifest with unique filename-based migration IDs, addressing duplicate numeric prefixes.
- Calculates SHA-256 checksums from exact SQL file contents.
- Requires a separate staging approval phrase for `--apply`.
- Rejects any database name other than `chattbm_staging_isolated`.
- Uses a session advisory lock and records each migration in the same transaction as its DDL.
- Refuses to create a first-time ledger when existing `chattbm_%` tables are already present, rather than guessing historical migration state.
- The workflow integration test uses a disposable PostgreSQL service, not the Render staging database.

## Blocking review findings before this runner is considered safe for a real staging target

### 1. Database host is not constrained

The runner validates only the database name. A connection string pointing to a different server with a database also named `chattbm_staging_isolated` passes the current guard. The approval phrase is not a substitute for target identity.

**Required:** add a fail-closed host/target allowlist or another independently verified staging identity. Keep the disposable CI service explicitly supported. Never accept a production host merely because its database name matches.

### 2. Unknown ledger entries are silently ignored

The runner loads every ledger row into `appliedMap`, but only checks manifest entries. A ledger row whose `migration_id` is absent from the manifest is not rejected. This can hide drift or a changed/shortened manifest.

**Required:** fail before applying anything if any recorded migration ID is not present in the manifest. Also verify ledger IDs are in the expected manifest order.

### 3. The tests do not cover critical refusal paths

Current integration coverage proves first application and rerun on an empty disposable database. It does not test:
- existing application tables with no ledger (baseline refusal);
- an unknown ledger migration ID;
- a checksum mismatch;
- a wrong database name or disallowed host;
- missing explicit approval for `--apply`;
- transaction rollback after a migration fails.

**Required:** add isolated tests for these refusal and rollback cases. Keep all test databases disposable.

### 4. No staging baseline procedure exists yet

The actual isolated staging database already contains application tables and has no confirmed migration ledger (based on the prior read-only inventory and review). The runner intentionally refuses to initialize a ledger in that state. This is correct and must not be bypassed.

**Required:** establish an independently reviewed baseline mapping for every existing table/index/constraint to its source migration or documented origin. Do not insert ledger rows or mark migrations applied until that mapping is proven from the live read-only schema evidence.

## Additional observations

- The manifest currently contains seven SQL files (001, two 002 files, two 003 files, 004, 005); no 006 migration file appeared in the branch's migrations directory listing.
- The integration workflow's PostgreSQL service is disposable and starts empty, which is appropriate for clean-install testing but does not prove compatibility with the already-populated Render staging schema.
- The workflow sets the approval phrase in its disposable test job. That phrase must never be copied into Render production/staging environment configuration as a substitute for explicit change approval.

## Recommended next sequence

1. Keep PR #79 Draft.
2. Address host/target validation and unknown-ledger rejection.
3. Add refusal/rollback tests in the disposable PostgreSQL job.
4. Complete the read-only schema-to-migration baseline mapping.
5. Only after separate explicit approval, consider a narrowly scoped staging-only migration execution plan.

**No merge, deployment, live staging migration, or production action is authorized by this review.**
