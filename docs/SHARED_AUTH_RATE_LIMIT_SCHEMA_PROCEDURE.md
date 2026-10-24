# Shared Authentication Rate Limiting — Schema Procedure

## Current approved stage
Test-only schema setup. This document does not authorize production schema changes or enable the PostgreSQL adapter in authentication routes.

## Disposable CI database
The dedicated GitHub Actions workflow starts PostgreSQL 16 with database `chattbm_test`. The integration test must verify that the connection host is loopback and the database name is exactly `chattbm_test` before connecting. It applies `database/migrations/005_auth_rate_limits.sql` only in that isolated database.

## Required implementation procedure
1. Keep migration SQL repeatable with `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
2. Test the migration twice in the disposable database to confirm repeatability.
3. Verify table columns, primary key, check constraint, and expiry index after application.
4. Exercise concurrent upserts from separate store instances and verify counters are unique and sequential.
5. Clean only the known hashed test keys; do not delete all production or shared rows as a cleanup strategy.
6. Never add this migration to automatic production startup in the same change as the adapter.
7. Before any production rollout, select a reviewed migration mechanism, run a backup/rollback review, apply the schema in a separately approved deployment step, verify it read-only, and only then consider enabling the adapter behind an explicit configuration flag.

## Current repository caveat
Existing schema setup is partly performed by `database/Postgres.js`; numbered SQL migration files also exist, and a general migration ledger/runner has not been confirmed. Therefore this new migration must not be assumed to run automatically.

## Production gate
No Render SQL, production schema write, or route wiring is part of this procedure. Those require a separate review and explicit approval.
