# REG-096 Migration Runner — Safety Contract

Status: implementation gate; disposable PostgreSQL workflow verified
Branch: feature/founder-admin-design

## Allowed implementation scope

The first runner implementation must manage only the migration ledger and a harmless disposable test migration. It must not migrate canonical payment/subscription/entitlement data yet.

## Mandatory safeguards

- Never run as part of application startup.
- Refuse `up` and `down` unless `NODE_ENV=test` or `CHATTBM_MIGRATION_ALLOW_NONTEST=true` is explicitly set. Production must additionally require a separately reviewed explicit opt-in.
- Before any write operation, query `current_database()` and `current_user`; by default require a database name ending in `_test`. Never log the connection string.
- Use the existing `pg` dependency, one checked-out client, bounded lock/statement timeouts, and a session advisory lock held through migration transactions.
- Allowlist migration IDs discovered from the fixed migrations directory; never accept arbitrary paths.
- Store and verify SHA-256 checksums. Applied migration checksum drift must stop execution before any further migration is applied.
- Execute migration SQL and ledger writes in the same transaction. Roll back on failure and release the advisory lock/client in `finally`.
- Rollback requires an exact applied ID and a reviewed down file. No automatic rollback or data-destructive payment migration.
- Exit non-zero on errors; do not print secrets, customer data, or raw connection details.

## Test gate

The GitHub Actions disposable PostgreSQL workflow has been verified successful. Extend it to run integration tests for a clean up, repeated up, status/verify, checksum drift, SQL failure rollback, and down of a harmless test migration. The workflow must remain independent of Render secrets and production configuration.

## Not authorized yet

This contract does not authorize payment schema migration, importing existing JSON records, changing production tables, enabling founder access, changing subscriptions, or merging/deploying PR #46. The canonical payment schema review's ownership and polymorphic provider-reference questions remain open.
