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
