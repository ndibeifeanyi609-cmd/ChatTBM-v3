# Migration Schema Verification Matrix

**Status:** Documentation-only verification specification  
**Branch:** `docs/database-migration-baseline-design`  
**Source reviewed:** Eight SQL files on `feature/email-verification`  
**Safety:** No SQL is executed by this document.

## Verification rules

A migration is eligible for baseline adoption only when every object listed for it is present and structurally compatible. Table existence alone is insufficient. Checks must inspect PostgreSQL catalogs (for example, `information_schema.columns`, `pg_constraint`, and `pg_indexes`) and compare types, nullability, defaults, constraints, foreign-key targets/actions, index key order, sort direction, and partial-index predicates.

Do not compare only generated constraint/index names where PostgreSQL may choose names automatically. Compare their definitions and semantics. Unexpected conflicting definitions are a hard stop, not an invitation to alter the existing schema.

## Per-migration acceptance criteria

### 001 — `001_auth_accounts_sessions.sql`

- `chattbm_users`: columns `id TEXT NOT NULL` primary key; `email_normalized TEXT NOT NULL` unique; `password_hash TEXT NOT NULL`; `email_verified_at TIMESTAMPTZ NULL`; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `disabled_at TIMESTAMPTZ NULL`.
- `chattbm_auth_sessions`: `id TEXT NOT NULL` primary key; `user_id TEXT NOT NULL` referencing `chattbm_users(id)` with `ON DELETE CASCADE`; `token_hash TEXT NOT NULL` unique; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `expires_at TIMESTAMPTZ NOT NULL`; `revoked_at TIMESTAMPTZ NULL`; `last_seen_at TIMESTAMPTZ NULL`.
- Indexes: `chattbm_auth_sessions_user_id_idx(user_id)`; `chattbm_auth_sessions_expires_at_idx(expires_at)`.
- Verify primary keys and unique constraints on users email and session token hash.

### 002 — `002_chat_history.sql`

- `chattbm_chat_history`: `user_id TEXT NOT NULL`, `conversation_id TEXT NOT NULL`, `messages JSONB NOT NULL`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Composite primary key exactly `(user_id, conversation_id)`.
- Foreign key `user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Check constraint requires `jsonb_typeof(messages) = 'array'`.
- Index `chattbm_chat_history_updated_at_idx(user_id, updated_at DESC)`.

### 002 — `002_google_oauth_identities.sql`

- `chattbm_oauth_identities`: `id TEXT NOT NULL` primary key; `user_id TEXT NOT NULL`; `provider TEXT NOT NULL`; `provider_subject TEXT NOT NULL`; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Foreign key `user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Unique constraints exactly on `(provider, provider_subject)` and `(user_id, provider)`.

### 003 — `003_context_records.sql`

- `chattbm_contexts`: `id TEXT NOT NULL` primary key; `user_id TEXT NOT NULL`; `interaction_id TEXT NOT NULL`; `version INTEGER NOT NULL`; `schema_version TEXT NOT NULL`; `lifecycle TEXT NOT NULL`; `created_at TIMESTAMPTZ NOT NULL`; `updated_at TIMESTAMPTZ NOT NULL`; `payload JSONB NOT NULL`.
- Foreign key `user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Check constraints: `version >= 1`; `jsonb_typeof(payload) = 'object'`.
- Unique constraint exactly on `(user_id, interaction_id)`.
- Indexes: `chattbm_contexts_user_created_idx(user_id, created_at DESC)`; `chattbm_contexts_user_updated_idx(user_id, updated_at DESC)`.

### 003 — `003_google_oauth_states.sql`

- `chattbm_google_oauth_states`: `state_hash TEXT NOT NULL` primary key; `link_user_id TEXT NULL`; `expires_at TIMESTAMPTZ NOT NULL`; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Nullable foreign key `link_user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Index `chattbm_google_oauth_states_expires_at_idx(expires_at)`.

### 004 — `004_password_reset_tokens.sql`

- `chattbm_password_reset_tokens`: `id TEXT NOT NULL` primary key; `user_id TEXT NOT NULL`; `token_hash TEXT NOT NULL` unique; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `expires_at TIMESTAMPTZ NOT NULL`; `used_at TIMESTAMPTZ NULL`.
- Foreign key `user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Indexes: `chattbm_password_reset_tokens_user_created_idx(user_id, created_at DESC)`; `chattbm_password_reset_tokens_expires_idx(expires_at)`.

### 005 — `005_auth_rate_limits.sql`

- `chattbm_auth_rate_limits`: `bucket_key TEXT NOT NULL` primary key; `window_started_at TIMESTAMPTZ NOT NULL`; `request_count INTEGER NOT NULL`; `expires_at TIMESTAMPTZ NOT NULL`; `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Check constraint `request_count >= 1`.
- Index `chattbm_auth_rate_limits_expires_at_idx(expires_at)`.
- No user foreign key is expected.

### 006 — `006_email_verification_tokens.sql`

- `chattbm_users.email_verified_at TIMESTAMPTZ NULL` must exist. This column is already created by migration 001, so it is not sufficient evidence by itself for migration 006.
- `chattbm_email_verification_tokens`: `id TEXT NOT NULL` primary key; `user_id TEXT NOT NULL`; `token_hash TEXT NOT NULL` unique; `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`; `expires_at TIMESTAMPTZ NOT NULL`; `used_at TIMESTAMPTZ NULL`.
- Foreign key `user_id -> chattbm_users(id)`, `ON DELETE CASCADE`.
- Indexes: `chattbm_email_verification_tokens_user_id_idx(user_id)`; `chattbm_email_verification_tokens_expires_at_idx(expires_at)`; partial index `chattbm_email_verification_tokens_active_user_idx(user_id) WHERE used_at IS NULL`.
- All three indexes and the table structure must be verified before migration 006 can be considered complete.

## Baseline outcomes

For each migration, reconciliation returns exactly one of:

- **COMPLETE:** every expected object is present and compatible; eligible for a separately approved baseline-ledger adoption.
- **ABSENT:** none of the migration-specific objects are present and prerequisites are satisfied; candidate to run only in an approved controlled environment.
- **PARTIAL_OR_CONFLICTING:** some expected objects are missing or definitions differ; stop. Do not insert a ledger row or execute the migration automatically.
- **BLOCKED:** prerequisites or catalog inspection are unavailable; stop without changes.

If an object is shared with bootstrap or another migration (notably `chattbm_users` and `email_verified_at`), it may support multiple checks but must not be treated as proof that each migration ran. The report must identify the evidence for each migration separately.

## Required tests before implementation approval

1. Fixture schemas matching each migration exactly are classified COMPLETE.
2. A missing index, altered column type, wrong nullability, wrong foreign-key delete action, or missing check constraint is classified PARTIAL_OR_CONFLICTING.
3. Migration 006 with only `email_verified_at` present is PARTIAL_OR_CONFLICTING, not COMPLETE.
4. A missing prerequisite user table is BLOCKED for dependent migrations.
5. Existing test rows remain unchanged during read-only reconciliation.
6. The checker performs no DDL/DML and creates no ledger.
7. Catalog-query failure returns BLOCKED and never falls back to optimistic adoption.

## Boundary

This specification is not an executable checker or migration runner. It changes no SQL, does not connect to Render, does not create a ledger, and does not authorize staging or production writes or merging PR #52.
