# Shared Authentication Rate Limiting — Schema Procedure

## Current approved stage

Documentation and disposable-database verification only. This procedure does not authorize a Render migration, production schema change, production route wiring, or activation of the PostgreSQL authentication adapter.

## Known repository schema behavior

`database/Postgres.js` creates `chattbm_users` during application initialization. Its declared columns include `email_verified_at TIMESTAMPTZ`. This is application bootstrap behavior, not proof that numbered migration 006 has been applied.

The numbered migrations have separate responsibilities:

- `005_auth_rate_limits.sql` creates `chattbm_auth_rate_limits`.
- `006_email_verification_tokens.sql` adds `email_verified_at` if absent and creates `chattbm_email_verification_tokens`.

Because bootstrap can create some of the same schema elements as a numbered migration, column existence alone must never be used to infer that a migration was applied.

## Read-only inventory before any migration

For the exact target database, first capture and review a read-only inventory. It must identify:

1. The database name and server identity.
2. Whether `chattbm_users`, `chattbm_auth_rate_limits`, `chattbm_email_verification_tokens`, and `chattbm_schema_migrations` exist.
3. Every relevant column's name, data type, nullability, and default.
4. Primary keys, unique/check/foreign-key constraints, delete rules, indexes, and index definitions.
5. The user-row count, without selecting or exposing user data.
6. Any migration-history entries and their checksums, if a history table exists.

Compare the inventory against the exact checked-in SQL and the application bootstrap definitions. Save the inventory as a review artifact. Do not create a migration-history table or insert history rows during this read-only phase.

## Interpretation of the observed isolated staging snapshot

The read-only inventory previously obtained for `chattbm_staging_isolated` showed an empty `chattbm_users` table with the expected account columns, including `email_verified_at`. It did not show the rate-limit table or email-verification-token table.

That snapshot is evidence only for the time it was taken; repeat the inventory immediately before any future approved action. The presence of `email_verified_at` is consistent with `database/Postgres.js` bootstrap and does not establish that migration 006 ran. The missing rate-limit table means migration 005 was not reflected in that inventory.

## Baseline and migration-history rules

1. Never mark a migration as applied merely because some of its columns or tables already exist.
2. Never fabricate a historical migration record or checksum.
3. A migration-history ledger must describe changes that were actually applied and verified, or a separately reviewed, explicitly approved baseline-adoption decision.
4. The current isolated runner proposal uses strict checks and requires migration 005 to be recorded with the exact current SQL checksum before it will run migration 006. Do not bypass this prerequisite by manually inserting a ledger row.
5. If an existing database has a matching schema but no trustworthy history, stop. Produce a schema-diff and data-impact review, then design a separately reviewed adoption procedure. The current runner does not implement safe adoption of an existing untracked schema.
6. If the schema partially matches, differs from the migration, or contains unexpected objects, stop. Do not use `IF NOT EXISTS` as a substitute for schema verification.
7. The current runner refuses to proceed when `chattbm_users` contains rows. If that guard blocks a target, do not delete users or weaken the guard. A separate data-preserving migration plan and approval are required.

## Disposable PostgreSQL verification

Before considering any staging action:

1. Use only a fresh disposable PostgreSQL database in CI or an equivalent isolated test environment.
2. Verify the target host and exact database name before connecting.
3. Test migration 005, inspect all columns, defaults, indexes, and constraints, and test reapplication behavior.
4. Test migration 006 only after 005 is recorded through the runner's normal transaction path with the expected checksum.
5. Test duplicate application, checksum mismatch, unexpected pre-existing objects, malformed history schema, and rollback after a forced verification failure.
6. Confirm that a failed migration leaves neither partial schema changes nor a history record.
7. Keep test cleanup restricted to objects and data created by that disposable test.

## Controlled staging sequence — not yet authorized

A future staging change must be a separate, explicitly approved operation:

1. Confirm the exact staging target and take/verify a restorable backup.
2. Repeat the read-only inventory and compare it with the reviewed migration SQL.
3. Review the proposed migration order, ledger semantics, rollback/recovery plan, and expected schema diff.
4. Obtain explicit approval for the specific target and migration.
5. Apply one migration at a time through the reviewed manual runner; never through application startup.
6. Verify the result using a separate read-only connection and compare it with the expected schema.
7. Record the outcome and retain the pre/post inventory and backup details.

Any mismatch, unexpected row count, checksum difference, TLS failure, or verification failure is a stop condition. Do not proceed to the next migration.

## Production gate

No Render SQL, production schema write, migration-history adoption, or route wiring is part of this procedure. Each requires its own review, backup/rollback plan, and explicit approval. The disposable CI tests do not authorize staging or production execution.
