# PostgreSQL Existing-Schema Baseline Adoption Contract

**Status:** Design proposal only. No implementation or production operation is authorized by this document.

## Purpose

Define a safe, explicit operation for recording that an existing ChatTBM PostgreSQL schema has been inspected and accepted as the starting point for future versioned migrations. Adoption must not imply that historical SQL files were executed, and must not replay or modify application schema/data.

## Non-goals

- Do not execute, replay, rename, delete, or rewrite legacy SQL migration files.
- Do not create or alter application tables, columns, constraints, or indexes during adoption.
- Do not infer historical migration execution from the current schema.
- Do not run against production as part of CI, tests, startup, deploy, or application boot.
- Do not combine baseline adoption with payment/provider rollout or any other schema change.

## Proposed operation

A future explicit CLI command (name not yet committed) may adopt a schema only after a separately reviewed expected-schema manifest and fingerprint algorithm are implemented.

The operation must:

1. Require an explicit opt-in flag and a database connection supplied specifically for the operation; never run automatically at server startup.
2. Refuse unless the target is explicitly configured as a disposable/test database during automated tests. Production adoption requires a separate reviewed rollout plan and explicit approval.
3. Acquire a transaction-scoped advisory lock so concurrent attempts cannot create conflicting baseline records.
4. Inspect a defined, versioned schema manifest covering relevant public tables, columns/types/nullability, constraints, and indexes. Exclude volatile data and environment-specific values. The manifest and canonicalization algorithm must be reviewed before implementation.
5. Compare the live schema to the expected manifest. If objects are missing, extra, or incompatible, stop before writing the baseline record; never repair the schema implicitly.
6. Record one immutable baseline entry containing a unique baseline identifier, manifest/fingerprint algorithm version, schema fingerprint, adoption timestamp, and an explicit statement that historical per-file execution is **unknown / not asserted**. Do not store credentials or customer data.
7. Commit the baseline record only after all validations succeed. Any error must roll back the baseline record.
8. On a second identical invocation, return a clear “already adopted” result without changing the record. If a baseline exists but the schema fingerprint or manifest version differs, fail closed; do not silently refresh it.
9. Avoid logging connection strings, secrets, or application row contents.

## Required disposable PostgreSQL 18 tests

Use only a loopback connection to a database named exactly `chattbm_test`; tests must refuse all other targets.

- **Expected schema:** matching fixture adopts successfully and stores the expected metadata.
- **Data preservation:** insert deterministic sentinel rows into representative user, conversation, chat-history, and memory tables; capture exact values/counts and verify unchanged after adoption.
- **No schema mutation:** compare schema fingerprints and relevant catalog definitions before and after; adoption changes only the dedicated migration metadata object(s) approved by the eventual implementation.
- **No legacy replay:** instrument the operation and assert that no legacy SQL file is opened or executed.
- **Idempotence:** second adoption returns already-adopted and leaves baseline metadata unchanged.
- **Mismatch refusal:** missing, extra, or incompatible schema objects cause refusal with no baseline record and no data changes.
- **Concurrent attempts:** parallel invocations result in exactly one baseline record and deterministic outcomes.
- **Failure rollback:** injected failure during metadata write leaves no partial baseline.
- **Unknown history:** persisted metadata explicitly says historical file execution is unknown, never “all migrations applied.”

## Initial source-of-truth inventory (read-only)

The current `main` version of `database/Postgres.js` was inspected for this proposal. Its startup bootstrap creates or ensures these application objects:

- Tables: `chattbm_conversations`, `chattbm_users`, `chattbm_contexts`, `chattbm_chat_history`, `chattbm_oauth_identities`, `chattbm_google_oauth_states`, `chattbm_google_oauth_handoffs`, and `chattbm_auth_sessions`.
- Explicit secondary indexes: `chattbm_contexts_user_created_idx`, `chattbm_contexts_user_updated_idx`, `chattbm_google_oauth_states_expires_at_idx`, `chattbm_google_oauth_handoffs_expires_at_idx`, `chattbm_auth_sessions_user_id_idx`, and `chattbm_auth_sessions_expires_at_idx`.

This bootstrap inventory is not a complete canonical schema manifest: PostgreSQL creates indexes for primary/unique constraints too, and table definitions include constraints and defaults that must be represented in the manifest.

Known source discrepancy requiring separate review: `database/migrations/002_chat_history.sql` declares `chattbm_chat_history_updated_at_idx`, but `database/Postgres.js` does not create that index. Prior read-only production inventory found it absent in the live database. Baseline adoption must not create it or silently treat this mismatch as resolved.

The bootstrap source does not create `chattbm_password_reset_tokens`, `chattbm_auth_rate_limits`, or `chattbm_memories`. These objects therefore require explicit comparison against their owning persistence code and SQL definitions before selecting the manifest. Their absence from this bootstrap is not evidence that they are absent from production.

These are source-code observations, not proof of historical migration execution. No production write or migration was performed during this inventory.

## Legacy SQL inventory (read-only)

The seven SQL files currently present under `database/migrations/` were inspected without executing them:

- `001_auth_accounts_sessions.sql`: users and auth sessions, plus session indexes.
- `002_chat_history.sql`: chat-history table and `chattbm_chat_history_updated_at_idx`.
- `002_google_oauth_identities.sql`: OAuth identity mapping and uniqueness constraints.
- `003_context_records.sql`: contexts table, checks/uniqueness, and context indexes.
- `003_google_oauth_states.sql`: OAuth state table and expiry index.
- `004_password_reset_tokens.sql`: password-reset token table and user/expiry indexes.
- `005_auth_rate_limits.sql`: shared rate-limit buckets and expiry index.

Duplicate numeric prefixes mean a future runner must not treat the numeric prefix as a globally unique migration identity. These files remain untouched and must not be replayed as part of baseline adoption.

The inspected `memory/MemoryPersistence.js` is file-backed (default path under `storage/memory.json`), not evidence of a PostgreSQL `chattbm_memories` table. The previously observed live table `chattbm_memories` therefore needs its actual owning persistence implementation and schema source located before it is included in a canonical manifest. Do not assume the file-backed store and the live table are interchangeable.

## Memory persistence owner identified (read-only)

The PostgreSQL owner is `memory/PostgresMemoryPersistence.js`. Its `initialize()` function defines `chattbm_memories` with columns `id`, `user_id`, `memory_type`, `subject`, `lifecycle`, `payload`, `created_at`, and `updated_at`; it has a JSON-object check, uniqueness on `(user_id, memory_type, subject)`, and index `chattbm_memories_user_lifecycle_idx` on `(user_id, lifecycle)`. The module uses the shared pool from `database/Postgres.js`.

This identifies the schema owner in source, but does not by itself prove the live table matches the source or establish the full manifest. The PostgreSQL memory table must be included in disposable schema comparisons and the read-only production catalog inventory.

## Remaining manifest candidates

Across the inspected bootstrap, legacy SQL, and memory persistence owner, the source-defined tables include users, conversations, contexts, chat history, OAuth identities, Google OAuth states and handoffs, auth sessions, password-reset tokens, auth rate limits, and memories. The live inventory also included these eleven application tables. The expected manifest must still be reconciled object-by-object with the live catalog, including every column/type/default/nullability, primary and unique constraints, foreign keys, checks, and indexes. Source overlap and `CREATE TABLE IF NOT EXISTS` do not prove catalog equivalence.

## Read-only production catalog comparison (2026-10-26)

A read-only query was run against the confirmed Render database `chattbm-db` (`chattbm_db`, PostgreSQL 18). It retrieved public-schema column metadata, index definitions, and constraint definitions for `chattbm_%` application objects. No data rows were selected and no writes were performed.

Observed catalog facts:

- All 11 expected application tables appeared in the column inventory: `chattbm_auth_rate_limits`, `chattbm_auth_sessions`, `chattbm_chat_history`, `chattbm_contexts`, `chattbm_conversations`, `chattbm_google_oauth_handoffs`, `chattbm_google_oauth_states`, `chattbm_memories`, `chattbm_oauth_identities`, `chattbm_password_reset_tokens`, and `chattbm_users`.
- The live index inventory contains the expected primary-key and unique indexes for these tables, along with the source-defined secondary indexes inspected earlier, with one known exception below.
- **Confirmed discrepancy:** `chattbm_chat_history_updated_at_idx` is absent from the live index inventory even though `database/migrations/002_chat_history.sql` defines it.
- The returned columns include expected timestamp defaults such as `now()` on selected `created_at` and `updated_at` fields; most application timestamp fields have no default. The complete raw catalog result should be compared to the reviewed source manifest before claiming exact equivalence.
- PostgreSQL catalog output includes generated NOT NULL constraints as well as primary/unique, foreign-key, and check constraints. The manifest algorithm must normalize these consistently rather than compare constraint names alone.

This was a metadata-only read. It did not read application row values, establish when any legacy file was executed, or modify the database. The missing index remains unresolved and must be assessed separately; baseline adoption must not create it.

## Proposed deterministic schema fingerprint contract (design only)

Do not hash raw `pg_dump` output or the order returned by catalog queries. A future implementation should build a versioned canonical JSON document from ordered catalog queries, then compute SHA-256 over the UTF-8 bytes of that canonical document.

### Canonical inputs

For the explicitly scoped application schema, include:

1. PostgreSQL server major version and fingerprint-format version.
2. Each application table's schema/name.
3. Columns ordered by ordinal position: name, ordinal position, normalized type identity (schema-qualified user-defined types; built-in type identity), nullability, and normalized default/generated/identity expression where applicable.
4. Constraints by table and semantic definition: primary key, unique, foreign key including referenced columns and delete/update/match actions, check expression, and deferrability/validation state where applicable. Represent NOT NULL from column metadata rather than separately hashing PostgreSQL's generated NOT NULL constraint names.
5. Indexes by table and semantic definition: access method, uniqueness, key and included columns/expressions in order, sort/null ordering, collation/opclass where relevant, predicate, and validity/readiness. Include the index whose absence is already known as an explicit expected object so it causes a manifest mismatch rather than being silently ignored.
6. The approved list of application objects. Unexpected application tables/indexes/constraints in the scoped namespace must cause a mismatch unless the manifest explicitly allows them.

### Canonicalization and exclusions

- Use fixed field names, stable lexical ordering for object collections, ordinal order for columns and index keys, UTF-8, and a specified JSON canonicalization with no insignificant whitespace.
- Normalize catalog expressions consistently on the supported PostgreSQL major version; do not use lossy regex substitutions to remove casts or qualifiers.
- Exclude rows/data, sequence current values, OIDs, owner/grant/ACL details, statistics, physical storage layout, query plans, and volatile timestamps from the schema fingerprint. If any of those become part of a separate security/operational check, report them separately rather than silently folding them into this fingerprint.
- Do not compare generated constraint names as the source of semantic truth. Preserve explicit application constraint/index names where those names are part of the reviewed contract.
- Store the fingerprint-format version with the digest. A format change requires a new version and explicit revalidation, not automatic baseline replacement.

### Validation gates before coding

1. Build the expected manifest from reviewed source definitions and the read-only live catalog—not by running legacy SQL against production.
2. Run a dry-run comparator against the disposable PostgreSQL 18 fixture and the read-only live catalog export.
3. Ensure the known missing `chattbm_chat_history_updated_at_idx` is reported as a mismatch. Do not add it during adoption.
4. Review all extra/missing objects and defaults/constraints; only after the source and live manifests reconcile should the hash implementation be written.
5. Unit-test deterministic output under shuffled catalog result order, plus changes to each included property, and verify excluded row data does not affect the digest.

This section specifies an approach, not a completed fingerprint implementation or a claim that the live schema matches the expected schema.

## Schema authority still required

Before implementation, review and approve:

- The canonical schema manifest and its relationship to `database/Postgres.js` startup bootstrap and legacy SQL definitions.
- Whether a dedicated migration metadata table is acceptable and its exact minimal schema.
- Fingerprint canonicalization, including ordering and treatment of indexes, constraints, extensions, and PostgreSQL-version-specific catalog fields.
- A read-only production inventory and backup/restore/rollback plan. The known missing `chattbm_chat_history_updated_at_idx` must be evaluated separately; adoption must not create it.
- The command/API boundary and explicit production authorization gate.

## Acceptance criteria

This proposal is not implementation evidence. It is accepted for implementation only when the schema authority and metadata contract above are reviewed. A passing test must demonstrate all required disposable cases; documentation alone does not establish safety.

Production remains untouched until a separate plan is reviewed and explicitly approved.
