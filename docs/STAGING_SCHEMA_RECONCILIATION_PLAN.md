# Staging Schema Reconciliation Plan (Review Only)

**Status:** Draft proposal only. No SQL in this document has been executed.
**Target:** Render isolated staging database `chattbm_staging_isolated` only.
**Production:** Explicitly out of scope.
**Approval boundary:** This document does not authorize a database write, migration, deployment, PR merge, or database access-rule change.

## 1. Evidence basis

Latest read-only inventory: GitHub Actions Run #34 (`43486507387`, job `132096265797`).

Observed:
- Database identity: `chattbm_staging_isolated`.
- Nine expected application tables were present.
- `chattbm_password_reset_tokens` and `chattbm_auth_rate_limits` were absent.
- No unexpected application tables were reported.
- `chattbm_users` contained one row at inventory time.
- `chattbm_chat_history` had its primary-key index, but not the index defined by migration 002: `chattbm_chat_history_updated_at_idx` on `(user_id, updated_at DESC)`.

The inventory ran read-only. Its non-zero result is an intentional schema gate, not a connection failure.

## 2. Reconciliation A: chat-history index

### Intended definition

From `database/migrations/002_chat_history.sql`:

```sql
CREATE INDEX IF NOT EXISTS chattbm_chat_history_updated_at_idx
    ON chattbm_chat_history (user_id, updated_at DESC);
```

### Pre-write checks (read-only)

Before any staging write, inspect `pg_indexes` for every index on `public.chattbm_chat_history` and confirm:
1. No index with the intended name already exists with a different definition.
2. No equivalent index already exists under another name.
3. The table and both columns exist with compatible types.
4. The target database identity is exactly `chattbm_staging_isolated`.

The Run #34 inventory reported only `chattbm_chat_history_pkey` for this table, so the intended secondary index was not observed. The pre-write checks must nevertheless be repeated immediately before any approved change.

### Proposed staging-only DDL (not executed)

```sql
CREATE INDEX IF NOT EXISTS chattbm_chat_history_updated_at_idx
    ON public.chattbm_chat_history (user_id, updated_at DESC);
```

After an independently approved execution, query `pg_indexes` and compare the complete index definition to the intended definition. Do not treat `IF NOT EXISTS` alone as proof that an existing same-named index is correct.

## 3. Reconciliation B: migration 004 password-reset tokens

Source file: `database/migrations/004_password_reset_tokens.sql`.

The source defines:
- `chattbm_password_reset_tokens.id` as the text primary key.
- `user_id` as a non-null foreign key to `chattbm_users(id)`, with cascade delete.
- `token_hash` as non-null and unique; raw tokens must not be stored.
- `created_at` defaulting to `NOW()`.
- Non-null `expires_at` and nullable `used_at`.
- Indexes on `(user_id, created_at DESC)` and `expires_at`.

Run #34 found the table absent. Before proposing execution:
1. Reconfirm the table is absent in the isolated staging database.
2. Verify the exact `chattbm_users(id)` type and primary-key definition.
3. Verify there is no differently named equivalent table or pre-existing reset-token data.
4. Review the migration runner/ledger identity and checksum behavior.
5. Confirm backup/restore evidence and the staging-only target guard.

Do not infer migration history from table existence.

## 4. Reconciliation C: migration 005 shared auth rate limits

Source file: `database/migrations/005_auth_rate_limits.sql`.

The source defines:
- `bucket_key` text primary key.
- Non-null `window_started_at` timestamp with time zone.
- `request_count` integer with check constraint `request_count >= 1`.
- Non-null `expires_at`.
- `updated_at` timestamp with time zone defaulting to `NOW()`.
- Index on `expires_at`.

Run #34 found the table absent. Before proposing execution:
1. Reconfirm the table is absent in the isolated staging database.
2. Check application code expectations for the exact column names, types, defaults, and constraint.
3. Check for any equivalent rate-limit table or data under another name.
4. Review migration runner/ledger identity and checksum behavior.
5. Confirm backup/restore evidence and the staging-only target guard.

## 5. Migration identity and ordering blockers

The migration directory has duplicate numeric prefixes (two `002_` files and two `003_` files). A runner must use unique immutable migration IDs and exact filenames/checksums, not numeric prefixes alone.

The inspected schema also contains `chattbm_conversations`, `chattbm_google_oauth_handoffs`, and `chattbm_memories`, whose provenance must be established before a migration baseline is declared.

Do not retroactively mark migrations as applied based only on observed tables. Require checksum mismatch to stop, a transaction/atomic ledger record where supported, an advisory lock, and independent post-migration schema verification.

## 6. Safe execution sequence — requires separate approval

1. Finish the read-only definition/provenance review.
2. Confirm a fresh encrypted staging backup and successful disposable restore.
3. Present the exact SQL and expected effects for review.
4. Obtain explicit approval for staging-only writes.
5. Apply one narrowly scoped change at a time to `chattbm_staging_isolated` only.
6. Re-run the read-only inventory and verify exact table/index/constraint definitions.
7. Record migration identity and checksum only after independent verification.

**No production database, production service, or database allowlist change is permitted by this plan.**
