# PostgreSQL Migration Reconciliation Checkpoint

**Status:** Read-only inventory completed; no production schema changes made.  
**Date:** 2026-10-26  
**Production database inspected:** Render database `chattbm-db` (`chattbm_db`). Do not record connection strings or credentials here.

## Findings

### Disposable PostgreSQL 16 test

GitHub Actions run #24 of `Shared Auth Rate Limit Tests` completed successfully. The migration inventory test:

- Ran the existing `database/Postgres.js` startup bootstrap against disposable `chattbm_test`.
- Discovered seven SQL files under `database/migrations/`.
- Applied each SQL file once and then a second time without an error.
- Found no migration-ledger-like table in the fresh disposable database.
- Reported duplicate numeric prefixes `002` and `003`.

This proves repeat-application compatibility in that test setup only. It does not establish the production database's historical migration sequence.

### Read-only Render inventory

The selected Render database was queried through a read-only transaction. The public schema contains:

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

No public table matching common migration-ledger names (including schema-migration, Knex, Sequelize, or migration-history patterns) was found. The inspected live tables and columns include the expected account/session, chat history, context, Google OAuth, password-reset, and shared auth rate-limit structures.

## Interpretation

The current repository has two schema-management paths:

1. `database/Postgres.js` creates core tables during startup with `CREATE TABLE IF NOT EXISTS`.
2. Numbered SQL files under `database/migrations/` also create or index several of those tables, and include additive tables such as password-reset tokens and auth rate limits.

The live schema inventory and absence of a recognizable ledger do **not** prove which SQL files were historically executed, whether a different tool was used in the past, or whether all constraints/indexes match the repository definitions. Existing tables could have been created by startup bootstrap, SQL files, or prior manual/automated operations.

## Required next steps — no execution against production

1. Compare live constraints and indexes with each migration and the bootstrap definitions using read-only catalog queries.
2. Design a migration-history reconciliation/backfill proposal that preserves existing data and never assumes historical migrations were applied just because tables exist.
3. Decide how to resolve duplicate numeric prefixes `002` and `003` for future ordering, without renaming or deleting the existing SQL files as a compatibility shortcut.
4. Add a migration ledger only after a reviewed plan defines how existing installations are baselined safely.
5. Test the proposal in a fresh disposable database and a production-like schema clone before any deployment.

**Safety boundary:** No migrations were run against Render. No production tables, rows, indexes, or constraints were changed. Do not proceed to payment-provider integration until migration reconciliation is reviewed and verified.
