# PostgreSQL Schema Reconciliation Plan

**Status:** Proposal only; do not execute against production.  
**Inventory date:** 2026-10-26  
**Production database:** Render `chattbm-db` / `chattbm_db`

## Evidence gathered

- A disposable PostgreSQL 16 GitHub Actions run successfully initialized the schema, applied all seven existing SQL files once, and applied them again.
- The fresh disposable database had no migration ledger.
- The read-only Render inventory found the expected core account, session, chat history, context, OAuth, memory, password-reset, and rate-limit tables.
- No common migration-ledger table name was found in the live public schema.
- Duplicate numeric prefixes exist among current SQL files: `002_chat_history.sql`, `002_google_oauth_identities.sql`, `003_context_records.sql`, and `003_google_oauth_states.sql`.
- The live index inventory did not include `chattbm_chat_history_updated_at_idx`, although that index is defined in `002_chat_history.sql` and not created by `database/Postgres.js`.
- Read-only catalog comparison of the migration-defined tables confirmed the inspected primary keys, unique constraints, foreign keys with their expected `ON DELETE CASCADE` behavior, and checks for JSONB array/object payloads and `version >= 1` / `request_count >= 1` are present.
- The indexes defined by the SQL files were compared against `pg_indexes`: the expected index set is present except `chattbm_chat_history_updated_at_idx`. The core tables also have the expected columns, nullability, and defaults in the inspected column inventory.
- The startup-bootstrap-only tables `chattbm_conversations`, `chattbm_google_oauth_handoffs`, and `chattbm_memories` were also checked read-only. Their inspected columns, nullability/defaults, primary/unique constraints, JSON object check on memories, and handoff-to-user cascading foreign key match the visible bootstrap/schema expectations.
- This completes the catalog comparison of the current `chattbm_%` tables against the available bootstrap and migration definitions at the table/column/constraint/index level. Historical migration execution remains unknown, and this inspection does not assess application-level data validity or workload-specific index performance.

## What the evidence does and does not establish

This evidence establishes the current visible schema and a successful test of repeat-applying the current SQL files in a disposable database. It does not identify which historical migration commands, if any, were executed against Render. The live schema may have been created through startup bootstrap, migration files, or other reviewed operations. Absence of a ledger is not proof that no migrations were ever run.

## Proposed approach

### 1. Finish read-only comparison

- Compare the full live table/column, constraint, and index catalog against both `database/Postgres.js` and every existing migration file.
- Verify exact definitions, not only names.
- Capture row counts only where useful and safe; never inspect or export user content, password hashes, OAuth tokens, or session/token values.
- Keep all SQL read-only during this phase.

### 2. Treat the missing chat-history index as a separate schema-repair question

- Check the query patterns and expected performance benefit before deciding it is required.
- In a disposable production-like database, test creating the index and measure the effect.
- For production, propose a separately reviewed operation with a suitable lock/concurrency strategy for the actual table size and PostgreSQL version.
- Do not create it during this inventory phase and do not bundle it with a ledger baseline.

### 3. Introduce future migration tracking without falsifying history

- Do not rename or delete existing SQL files to resolve the duplicate prefixes.
- Do not infer historical application from the existence of tables or indexes.
- Design a ledger for new migrations with unique immutable identifiers, checksums, timestamps, and transactional failure behavior where PostgreSQL supports it.
- Use a distinct, unambiguous naming convention for all new migration files; do not reuse existing numeric prefixes.
- Record the existing database as a reviewed baseline only after schema comparison and explicit approval. Make the baseline state clear that earlier per-file execution history is unknown; do not mark every old file as historically applied without evidence.
- Keep the startup bootstrap and migration runner from competing as independent schema authorities. The changeover plan must specify which path owns future schema changes and how deployment order avoids breaking existing instances.

### 4. Test before proposing deployment

- Exercise a fresh database with the migration runner from empty state.
- Exercise a disposable production-like schema with the proposed baseline procedure.
- Verify repeat runs, checksum mismatch handling, partial failure/retry behavior, constraints, indexes, and preservation of existing data.
- Confirm startup and persistence integration tests pass.
- Review a backup/restore and rollback plan before any production schema operation.

## Explicit safety boundaries

- No production migration or DDL was executed during the inventory.
- Do not execute SQL that changes production schema until a reviewed plan and explicit approval exist.
- Do not rename/delete the existing SQL files as a shortcut.
- Keep PR #48 in Draft; this proposal is not an authorization to merge or deploy.
- Defer Flutterwave integration until the schema ownership and migration-history reconciliation plan is reviewed.
