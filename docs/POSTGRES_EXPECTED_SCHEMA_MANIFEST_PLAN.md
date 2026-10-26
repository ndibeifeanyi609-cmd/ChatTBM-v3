# PostgreSQL Expected-Schema Manifest — Reconciliation Plan

**Status:** Inventory and review checklist only. This is not an executable manifest and must not be used to authorize baseline adoption or schema changes.

## Scope

The production catalog inventory for `chattbm-db` contains 11 application tables:

- `chattbm_auth_rate_limits`
- `chattbm_auth_sessions`
- `chattbm_chat_history`
- `chattbm_contexts`
- `chattbm_conversations`
- `chattbm_google_oauth_handoffs`
- `chattbm_google_oauth_states`
- `chattbm_memories`
- `chattbm_oauth_identities`
- `chattbm_password_reset_tokens`
- `chattbm_users`

The source definitions are split across `database/Postgres.js`, `memory/PostgresMemoryPersistence.js`, and seven files under `database/migrations/`. None alone is a complete authority.

## Source ownership map

| Object | Source definition | Review status |
|---|---|---|
| `chattbm_users` | `database/Postgres.js`; `001_auth_accounts_sessions.sql` | Compare all columns/defaults/constraints |
| `chattbm_auth_sessions` | `database/Postgres.js`; `001_auth_accounts_sessions.sql` | Compare all columns/defaults/constraints/indexes |
| `chattbm_conversations` | `database/Postgres.js` | No corresponding legacy migration found in current seven-file inventory |
| `chattbm_contexts` | `database/Postgres.js`; `003_context_records.sql` | Compare checks, unique constraint, indexes |
| `chattbm_chat_history` | `database/Postgres.js`; `002_chat_history.sql` | Known index discrepancy below |
| `chattbm_oauth_identities` | `database/Postgres.js`; `002_google_oauth_identities.sql` | Compare both unique constraints |
| `chattbm_google_oauth_states` | `database/Postgres.js`; `003_google_oauth_states.sql` | Compare nullable FK and expiry index |
| `chattbm_google_oauth_handoffs` | `database/Postgres.js` | No corresponding legacy migration found in current seven-file inventory |
| `chattbm_memories` | `memory/PostgresMemoryPersistence.js` | Compare JSON check, uniqueness, index |
| `chattbm_password_reset_tokens` | `004_password_reset_tokens.sql` | Owning runtime persistence/controller path still needs confirmation |
| `chattbm_auth_rate_limits` | `005_auth_rate_limits.sql` | Compare check constraint and expiry index |

## Known discrepancies and uncertainties

1. `chattbm_chat_history_updated_at_idx` is declared by `002_chat_history.sql` but absent from the read-only production index inventory. Do not create it during baseline adoption.
2. `database/Postgres.js` startup bootstrap does not define `chattbm_password_reset_tokens`, `chattbm_auth_rate_limits`, or `chattbm_memories`. Those objects have separate source definitions or owners and must not be inferred from bootstrap alone.
3. The current legacy SQL files contain duplicate numeric prefixes (`002` and `003`); prefix number is not a unique migration identity.
4. Current source definitions use `CREATE TABLE IF NOT EXISTS`; this makes startup repeatable but does not reconcile an already-existing table's columns or constraints.
5. The inventory establishes current schema shape only. It does not establish when, or whether, any individual legacy file historically executed.

## Required reconciliation procedure

For every table, construct a reviewed expected object with:

- Ordered columns: name, type, nullability, default, identity/generated attributes if any.
- Primary, unique, foreign-key, and check constraints, including definitions and validation/deferrability properties.
- Indexes: name, uniqueness, access method, ordered key/include columns or expressions, sort/null ordering, predicate, and validity.
- Explicit handling of expected extras and missing objects. Do not ignore objects solely because they lack a matching source file.

Compare this source-derived manifest against a separately captured read-only production catalog and a disposable PostgreSQL 18 fixture. Record each difference as accepted, unresolved, or separately planned; never auto-repair during comparison.

## Acceptance gates

- [ ] Locate and review the runtime owner of password-reset token storage.
- [ ] Reconcile every live column and default against its source.
- [ ] Reconcile all constraints and indexes, including objects not represented in startup bootstrap.
- [ ] Decide how the known missing chat-history index will be evaluated separately.
- [ ] Freeze a versioned canonical manifest and fingerprint format.
- [ ] Test matching, missing-object, extra-object, type/default drift, and ordering-determinism cases in disposable PostgreSQL 18.
- [ ] Obtain review before any baseline adoption implementation is considered complete.

Production remains read-only and untouched by this plan.

## Password-reset catalog comparison (read-only, 2026-10-26)

Compared the live `chattbm_password_reset_tokens` catalog with `database/migrations/004_password_reset_tokens.sql` and runtime use in `auth/PasswordResetService.js`.

- **Columns match the migration:** `id` text NOT NULL; `user_id` text NOT NULL; `token_hash` text NOT NULL; `created_at` timestamptz NOT NULL DEFAULT `now()`; `expires_at` timestamptz NOT NULL; `used_at` nullable timestamptz.
- **Constraints match the intended definitions:** primary key on `id`, unique constraint on `token_hash`, and foreign key `user_id` → `chattbm_users(id)` with `ON DELETE CASCADE`.
- **Indexes present:** primary-key index; unique token-hash index; `chattbm_password_reset_tokens_user_created_idx` on `(user_id, created_at DESC)`; and `chattbm_password_reset_tokens_expires_idx` on `(expires_at)`.
- **Result:** no discrepancy observed for this table in the queried columns, constraints, and indexes.

This is a metadata-only read. It does not establish historical migration execution and does not imply that the other ten tables have been reconciled. No production writes were performed.


## Shared authentication rate-limit catalog comparison (read-only, 2026-10-26)

Compared production metadata for `chattbm_auth_rate_limits` against `database/migrations/005_auth_rate_limits.sql` and runtime use in `auth/PostgresRateLimitStore.js`.

- **Columns match:** `bucket_key` text NOT NULL; `window_started_at` timestamptz NOT NULL; `request_count` integer NOT NULL; `expires_at` timestamptz NOT NULL; `updated_at` timestamptz NOT NULL DEFAULT `now()`.
- **Constraints match:** primary key on `bucket_key` and check `request_count >= 1`.
- **Indexes present:** primary-key index on `bucket_key` and `chattbm_auth_rate_limits_expires_at_idx` on `expires_at`.
- **Runtime alignment:** store upserts buckets, reads/updates `request_count`, timestamps, and expiry, and deletes expired rows in bounded batches. The `updated_at` default exists, though runtime explicitly supplies `NOW()`.
- **Result:** no discrepancy observed in the queried columns, constraints, and indexes.

This comparison is metadata-only. It does not prove historical migration execution and does not reconcile the other tables. No production writes were performed.


## Memory persistence catalog comparison (read-only, 2026-10-26)

Compared production metadata for `chattbm_memories` against `memory/PostgresMemoryPersistence.js`.

- **All 8 columns match:** `id`, `user_id`, `memory_type`, `subject`, `lifecycle`, `payload` (jsonb), `created_at` (timestamptz), and `updated_at` (timestamptz). All are NOT NULL; no column defaults were observed.
- **Constraints match:** primary key on `id`; unique constraint on `(user_id, memory_type, subject)`; check that `payload` is a JSON object.
- **Indexes present:** primary-key index, unique identity index, and `chattbm_memories_user_lifecycle_idx` on `(user_id, lifecycle)`.
- **Result:** no discrepancy observed in the queried columns, defaults, constraints, and indexes.

The comparison was metadata-only and did not inspect memory payloads or prove historical initialization/migration execution. No production writes were performed.

