# Migration Ledger Contract

**Status:** Proposed ledger contract for review; not runtime implementation  
**Branch:** `docs/database-migration-baseline-design`  
**Related:** `DATABASE_MIGRATION_BASELINE_DESIGN.md`, `DATABASE_MIGRATION_MANIFEST_PROPOSAL.md`, `DATABASE_MIGRATION_SCHEMA_VERIFICATION.md`

## 1. Purpose

Define the minimum durable record required to distinguish migrations applied by a controlled runner from migrations adopted after verified inspection of an existing schema. The ledger must never be treated as proof that the schema is correct without checking its recorded identity and checksum.

## 2. Proposed ledger record

Proposed table name: `chattbm_schema_migrations`.

| Field | Required | Contract |
|---|---|---|
| `migration_id` | Yes | Stable unique ID from the reviewed manifest; primary key |
| `filename` | Yes | Exact relative path of the SQL file; unique |
| `checksum_sha256` | Yes | Lowercase 64-character SHA-256 hex digest of the exact SQL file bytes |
| `manifest_order` | Yes | Positive integer matching the reviewed manifest; unique |
| `execution_mode` | Yes | `runner` or `baseline_adoption` |
| `applied_at` | Yes | PostgreSQL-generated timestamp with time zone |
| `runner_version` | No | Version/commit identifier of the runner, null for baseline adoption |
| `evidence_reference` | Conditional | Required for baseline adoption; points to a reviewed, non-secret verification report |
| `adopted_by` | Conditional | Required for baseline adoption; authenticated operator identifier, not free-form secret data |

The final physical SQL types and constraints must be chosen during implementation review. At minimum, the table must enforce a primary key on `migration_id`, uniqueness of `filename`, uniqueness of `manifest_order`, non-null identity/checksum/mode/timestamp fields, and a check restricting `execution_mode` to the two supported values.

Do not store SQL contents, connection strings, credentials, access tokens, or user data in the ledger.

## 3. Checksum contract

- Compute SHA-256 over the exact bytes of the SQL file as committed; do not normalize line endings, whitespace, or encoding before hashing.
- The manifest must declare the expected checksum for every migration.
- Before any migration is considered or executed, compute the file checksum and compare it with the manifest.
- A missing file, malformed checksum, or mismatch is a hard failure before SQL execution.
- If a ledger row exists, its checksum, filename, and order must also match the reviewed manifest. Any mismatch is a hard failure.
- Never update a historical checksum in place to make a mismatch pass. A changed historical migration requires a separately reviewed repair/new-migration decision.

## 4. Baseline-adoption record rules

A baseline adoption is an audited statement that the schema already satisfies a migration's complete expected result. It is not a claim that the SQL file was historically executed.

Before inserting a `baseline_adoption` row:

1. Run the read-only schema verifier defined in `DATABASE_MIGRATION_SCHEMA_VERIFICATION.md`.
2. Require outcome `COMPLETE` for that migration.
3. Capture the verifier version, database identity in a non-secret form, timestamp, migration ID, filename, checksum, and the complete object-check results in a protected review artifact.
4. Require explicit approval for the specific database and exact migration IDs to adopt.
5. Insert only the approved records, with a reference to the evidence artifact and operator identity.
6. Re-read the ledger and re-run read-only verification to confirm consistency.

Do not adopt `ABSENT`, `PARTIAL_OR_CONFLICTING`, or `BLOCKED` migrations. A migration may not be adopted because a later migration or bootstrap happens to create one shared object. Every migration-specific expected object must be independently verified.

For migration 006, the `email_verified_at` column is not sufficient evidence. The token table, its columns, primary/unique/foreign-key constraints, and all three indexes must pass the schema verifier.

## 5. Runner-applied record rules

For a runner-applied migration:

1. Validate the manifest and checksum before opening an execution transaction.
2. Acquire the agreed PostgreSQL advisory lock (or an equivalently proven cross-process lock).
3. Re-check the ledger while holding the lock.
4. Verify prerequisites and ensure the migration is not already recorded.
5. Execute one migration in a transaction when all its statements support transactional execution.
6. Verify expected post-migration schema inside the transaction where feasible.
7. Insert the ledger row in the same transaction as the schema change.
8. Commit only when SQL, verification, and ledger insert all succeed.
9. On any failure, roll back the current migration and its ledger row, release the lock, and stop. Earlier committed migrations remain recorded.

If any statement cannot be safely run transactionally, the migration must be explicitly flagged and receive its own reviewed recovery protocol before runner support.

## 6. Existing ledger handling

- No ledger table: perform read-only baseline inspection first; never create the ledger as a side effect of inspection.
- Ledger exists and matches manifest: verify recorded schema before reporting migration COMPLETE.
- Ledger row exists but schema is missing or incompatible: stop with a ledger/schema conflict; do not silently re-run or delete the row.
- Schema is complete but ledger row is absent: classify as a baseline-adoption candidate, not automatically applied.
- Ledger contains unknown IDs, duplicate/invalid metadata, or entries absent from the manifest: stop for manual review.
- Manifest order must be contiguous and deterministic for the historical set. New migration order must be unique and greater than all existing manifest orders.

## 7. Audit and operational safeguards

- Ledger reads and schema verification must not expose secrets or application row contents.
- Record only metadata needed for audit; do not log raw tokens, SQL parameters containing user data, or database credentials.
- Use a least-privilege database role appropriate to the operation.
- Read-only inspection must use a role with no DDL/DML privileges where practical.
- Baseline adoption and migration execution must be separate explicit operations with separate approvals.
- A baseline adoption must never execute the migration SQL.
- A runner must never infer historical application from timestamps, deployment dates, filename prefixes, or application bootstrap behavior alone.

## 8. Required tests

1. Ledger constraints reject duplicate migration IDs, filenames, and order values.
2. Invalid execution modes and malformed checksums are rejected.
3. Exact-byte checksum matches pass; changed bytes fail.
4. Existing row metadata mismatch blocks execution.
5. Baseline adoption refuses every verifier outcome other than COMPLETE.
6. Baseline adoption records evidence metadata and performs no migration SQL.
7. Runner transaction failure leaves neither schema changes nor a ledger row for that migration.
8. Concurrent runner instances cannot apply the same migration.
9. Ledger/schema disagreement stops without auto-repair.
10. Unknown ledger entries stop reconciliation.
11. No inspection or verification path creates the ledger or mutates application data.

## 9. Current staging evidence and boundary

The latest read-only staging diagnostic reported no `chattbm_schema_migrations` ledger and no `chattbm_email_verification_tokens` table, while `chattbm_users.email_verified_at` was present. This is not sufficient to adopt migration 006. No ledger is authorized to be created on staging or production by this proposal.

This document is design-only. It does not create a ledger, execute SQL, implement a runner, change staging or production, authorize automatic production startup migrations, or authorize merging PR #52.
