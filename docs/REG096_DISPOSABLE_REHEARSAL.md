# REG-096 Disposable PostgreSQL Rehearsal Checklist

Status: test plan only; no schema migration or data import is implemented by this document
Branch: feature/founder-admin-design
Date: 2026-10-25

## Purpose

Define a repeatable, isolated rehearsal before implementing or approving any REG-096 PostgreSQL migration. This checklist uses synthetic fixtures only. It must never be run against a production database or a database containing real customer payment data.

## Entry gates

- [ ] Use Node.js 20 or newer.
- [ ] Use a dedicated disposable PostgreSQL database whose name ends in `_test`.
- [ ] Set `NODE_ENV=test` and configure `CHATTBM_MIGRATION_TEST_HOSTS` to the exact approved test host.
- [ ] Confirm the migration runner rejects any target that does not satisfy its test-only guard.
- [ ] Confirm no production URL, credential, provider secret, or real customer snapshot is present in the test environment.
- [ ] Record the current migration status and ensure no unexpected migration is pending.
- [ ] Use a fresh disposable database or a documented reset procedure before each clean-apply rehearsal.

Do not paste database URLs or credentials into logs, pull requests, test output, or chat.

## Synthetic fixture matrix

Use unmistakably synthetic identifiers such as `test-user-a`, `test-user-b`, `test-payment-a`, and `test-subscription-a`. Do not use real provider object IDs.

| Fixture | Expected property |
|---|---|
| Payment transaction A | `flutterwave`, `created`, version 1, owner test-user-a, unique idempotency key |
| Payment transaction B | `apple_iap`, a valid non-active lifecycle state, owner test-user-b, different idempotency key |
| Subscription A | Owner test-user-a, valid lifecycle, stable ID/version/timestamps |
| Entitlement A | References subscription A and the same owner; non-active state unless test authority explicitly proves activation |
| Provider reference A | Unique provider/object-type/object-ID tuple and a valid canonical association |
| Duplicate-idempotency attempt | Reuses an existing key; must return the contract-defined idempotent result or conflict, never create a second canonical transaction |
| Cross-owner entitlement | Entitlement owner differs from its subscription owner; must be rejected |
| Duplicate provider reference | Reuses the provider/object-type/object-ID tuple for another canonical object; must be rejected |
| Invalid lifecycle/provider | Values outside the domain enums; must be rejected |
| Missing subscription | Entitlement references a nonexistent subscription; must be rejected |

These are test scenarios, not approved production schema definitions. Resolve the polymorphic provider-reference association and cross-row ownership enforcement before writing the real migration.

## Rehearsal sequence

1. **Guard verification:** prove the runner refuses non-test environments, databases without the required test suffix, and hosts not explicitly allowlisted.
2. **Clean apply:** apply only the reviewed additive test migration; verify the migration ledger stores its identifier and checksums.
3. **Repeat apply:** run the migration command again; it must not apply the same migration twice.
4. **Checksum drift:** alter a temporary already-applied migration file; verification must fail closed. Restore the file after the test.
5. **Synthetic writes:** insert the fixture matrix through the repository boundary, not by bypassing domain validation.
6. **Constraint tests:** verify duplicate IDs, idempotency reuse, provider-reference duplication, invalid enum values, missing subscriptions, and cross-owner relationships fail as designed.
7. **Atomicity:** force a multi-record operation to fail mid-transaction; confirm no partial canonical state remains.
8. **Restart and concurrency:** verify data survives application restart and concurrent attempts cannot create duplicate canonical records.
9. **Outage behavior:** simulate a database failure; callers must receive a safe error, not success, an invented empty state, or an active entitlement.
10. **Rollback:** roll back only the empty disposable schema using the explicit runner command; verify rollback ordering and that no unrelated objects were removed.
11. **Repeatability:** recreate the disposable database and repeat from a clean state.
12. **Evidence:** capture test names, pass/fail results, migration IDs/checksums, and synthetic record counts only. Do not capture secrets or private data.

## Acceptance criteria

The rehearsal is not complete until all applicable cases pass on Node.js 20+ against a real disposable PostgreSQL instance. Tests that skip because `DATABASE_URL` is absent do not count as PostgreSQL integration evidence.

- [ ] Clean apply, repeat apply, checksum validation, and explicit rollback pass.
- [ ] Domain IDs, owners, lifecycle values, versions, timestamps, idempotency semantics, and provider references round-trip without mutation.
- [ ] Invalid ownership and duplicate identities are rejected rather than silently repaired.
- [ ] Multi-row operations are atomic.
- [ ] Restart, concurrent writes, and database outage cases pass.
- [ ] Migration logs contain no credentials or private customer content.
- [ ] The source snapshot and destination counts/fingerprints reconcile exactly in any future import rehearsal.
- [ ] A reviewer signs off the schema, import strategy, rollback plan, and operational window before any production migration is considered.

## Stop conditions

Stop and investigate if a migration target cannot be positively identified as disposable, any fixture conflicts with existing data, counts/fingerprints differ, a checksum changes unexpectedly, ownership is ambiguous, rollback would drop non-empty canonical tables, or an error is converted into an apparent success.

## Explicitly out of scope

This checklist does not implement SQL tables, a PostgreSQL repository, a data importer, a production migration, a payment provider call, customer entitlement activation, founder exemption, or product-access changes. Those require separate reviewed changes and explicit operational approval.
