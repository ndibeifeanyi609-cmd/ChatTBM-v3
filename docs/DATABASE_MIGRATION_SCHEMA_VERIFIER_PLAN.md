# Read-Only Schema Verifier Implementation Plan

**Status:** Implementation plan only; code changes not yet authorized  
**Target branch for any future implementation:** a new isolated branch from the reviewed feature branch  
**Repository source reviewed:** `database/Postgres.js` and the eight SQL migrations on `feature/email-verification`

## 1. Goal

Build a standalone, read-only PostgreSQL schema verifier that classifies each historical migration as `COMPLETE`, `ABSENT`, `PARTIAL_OR_CONFLICTING`, or `BLOCKED`. It must not apply SQL, create a ledger, modify schema, or read application row contents.

## 2. Important bootstrap finding

The current `database/Postgres.js` `initializeDatabase()` issues DDL during application initialization. It creates or indexes several objects that overlap the migration set:

- `chattbm_users`
- `chattbm_auth_sessions` and its two indexes
- `chattbm_contexts` and its two indexes
- `chattbm_chat_history`
- `chattbm_oauth_identities`
- `chattbm_google_oauth_states` and its expiry index

It also creates `chattbm_conversations` and `chattbm_google_oauth_handoffs`, which are not represented by the eight reviewed migration files.

Consequences:
- The verifier must assess the migration-specific expected objects, not assume bootstrap execution equals migration execution.
- It must report bootstrap-only objects separately as informational inventory, not assign them to a migration.
- A clean-database runner design must later resolve bootstrap-versus-migration ordering. That issue is outside this verifier's scope.

## 3. Proposed module boundary

Proposed future module: `database/migrations/SchemaVerifier.js`.

Responsibilities:
1. Accept an already-created PostgreSQL client/connection from the caller; do not create its own pool or read `DATABASE_URL`.
2. Execute only catalog reads.
3. Inspect the exact schema selected by the caller; do not assume a schema name silently.
4. Return structured, deterministic findings for the eight manifest entries.
5. Never create a ledger or invoke `initializeDatabase()`.

Non-responsibilities:
- No migration execution.
- No baseline adoption or ledger insertion.
- No schema repair, DDL, DML, or cleanup.
- No automatic connection to staging or production.
- No application startup integration or route exposure.

## 4. Read-only enforcement

The verifier should:
- Require a caller-supplied connection whose database role has catalog-read access and no DDL/DML privileges where practical.
- Begin a read-only transaction (`BEGIN READ ONLY`) and always end it with `ROLLBACK` or a safe transaction close.
- Use fixed, parameterized catalog queries; never interpolate user-controlled schema/table identifiers into SQL.
- Avoid selecting from application tables. Inspect only PostgreSQL catalog metadata.
- Avoid logging connection strings, credentials, raw tokens, SQL contents, or application row data.
- Return `BLOCKED` if read-only transaction setup, catalog inspection, or transaction cleanup fails.
- Have tests assert no DDL/DML statements are issued.

A read-only transaction is an additional safeguard, not a substitute for a least-privilege database role.

## 5. Catalog evidence to collect

For each expected object, inspect:
- Relation existence and relation kind.
- Column names, PostgreSQL data types, nullability, and default expressions.
- Primary keys, unique constraints, check constraints, and foreign keys.
- Foreign-key referenced relation/columns and delete action.
- Index key columns and order, uniqueness, and partial-index predicate.
- Expected schema qualification.

Normalize catalog output into stable semantic structures before comparison. Do not depend solely on auto-generated constraint names. Compare index and constraint definitions, not merely object names.

## 6. Classification algorithm

For each migration:
1. Load the exact expected-object specification from the reviewed manifest/schema contract.
2. Confirm prerequisite objects are inspectable.
3. Collect catalog metadata for all expected objects.
4. If inspection is incomplete or prerequisite metadata is unavailable, return `BLOCKED`.
5. If none of the migration-specific objects exist and prerequisites are satisfied, return `ABSENT`.
6. If every expected object exists and is semantically compatible, return `COMPLETE`.
7. If some expected objects are missing, or any definition conflicts, return `PARTIAL_OR_CONFLICTING`.
8. Include a per-object evidence list and stable reason codes. Do not return a single optimistic status based only on a table or column.

Shared bootstrap objects may satisfy an expected-object check for a migration, but must not establish historical execution. The verifier reports schema compatibility only.

For migration 006, `chattbm_users.email_verified_at` is shared with migration 001. Migration 006 cannot be COMPLETE unless the token table, its complete columns and constraints, and all three indexes are compatible.

## 7. Suggested result shape

The exact public API should be finalized before implementation. A candidate result:

```js
{
  verifierVersion: "1",
  schema: "caller-selected-schema",
  readOnly: true,
  migrations: [{
    migrationId: "006_email_verification_tokens",
    status: "PARTIAL_OR_CONFLICTING",
    reasons: ["EXPECTED_TABLE_MISSING"],
    objects: [{
      name: "chattbm_email_verification_tokens",
      status: "MISSING"
    }]
  }]
}
```

The result must not include connection details, user data, secret values, or raw SQL. It should include enough catalog evidence to explain each status without exposing sensitive application information.

## 8. Test plan

Use only a disposable local/CI PostgreSQL database. Tests must not use Render staging or production.

Required fixtures:
- Empty schema with prerequisite absent.
- Exact schema for each migration.
- All bootstrap-created objects present but no ledger.
- Missing one required index.
- Wrong column type or nullability.
- Wrong foreign-key target or delete action.
- Missing unique/check constraint.
- Incorrect partial-index predicate for migration 006.
- Migration 006 with only `email_verified_at` present.
- Catalog permission denied or query failure.
- Two schemas with similarly named objects to verify schema qualification.

Required safety assertions:
- No DDL/DML statements are issued.
- No ledger table is created.
- Existing fixture rows are not read or modified.
- The verifier never invokes application bootstrap.
- Catalog errors classify as BLOCKED.
- Repeated runs return the same deterministic result for an unchanged schema.

## 9. Implementation gates

Before writing code, obtain separate approval for:
- The module path and exported API.
- The supported PostgreSQL version range.
- The caller-owned connection and read-only role strategy.
- The expected schema selection behavior.
- The result shape and reason codes.
- The disposable PostgreSQL test environment.

After implementation, complete unit tests, disposable-Postgres integration tests, failure tests, and a code review. Only then propose the separate ledger/runner implementation.

## 10. Safety boundary

This plan authorizes no code implementation, no database connection, no staging or production inspection, no schema writes, no ledger creation, no migration execution, and no PR #52 merge. It is a design artifact only.
