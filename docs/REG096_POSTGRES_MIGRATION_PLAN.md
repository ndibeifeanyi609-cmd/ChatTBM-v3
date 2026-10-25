# REG-096 PostgreSQL Migration Plan

Status: design proposal only; no migration or production data changes
Branch: feature/founder-admin-design
Date: 2026-10-25

## Objective

Move canonical REG-096 payment, subscription, entitlement, provider-reference, and idempotency state from local JSON/in-process-only persistence to shared PostgreSQL persistence while preserving the existing domain contract. This plan does not implement founder access or change customer access behavior.

## Non-negotiable constraints

- PostgreSQL becomes the durable canonical store only after reviewed migration, repository, and rollout verification.
- Preserve every canonical ID, user owner, lifecycle state, version, timestamp, provider reference, and idempotency key.
- Do not fabricate payments, subscriptions, provider events, or active entitlements.
- Never activate an entitlement without the existing contract's verified payment/subscription authority.
- Preserve idempotency conflict behavior and immutable identity/ownership rules.
- Do not enable founder exemption or set the production founder ID as part of this work.
- Do not log database URLs, credentials, payment details, provider secrets, or private user content.
- No migration or rollout runs against production until backup and restore are tested and explicit approval is received.

## Proposed migration convention

Use numbered SQL migrations under `database/migrations/`, for example:

- `0001_reg096_payment_tables.up.sql`
- `0001_reg096_payment_tables.down.sql`

A small migration runner must:
1. Connect using the existing `DATABASE_URL`.
2. Create a migration ledger table if absent.
3. Acquire a PostgreSQL advisory lock so only one runner applies migrations at a time.
4. Apply each migration transactionally where supported.
5. Record the migration identifier only after successful application.
6. Refuse to silently skip checksum/content drift.
7. Report status without printing credentials.
8. Require an explicit command to roll back; application startup must never auto-run destructive rollback.

The exact runner and migration naming convention require review before code is added. Do not extend `initializeDatabase()` startup DDL to silently mutate payment schemas.

## Canonical table design (proposal)

The SQL must be derived from actual domain object shapes and existing contract constraints, then reviewed before implementation. At minimum, evaluate:

- `chattbm_payment_transactions`: canonical ID, user ID, provider, idempotency key, lifecycle, version, timestamps, and validated request/result fields needed by existing APIs.
- `chattbm_subscriptions`: canonical ID, user ID, lifecycle, version, timestamps, and required contract relationships.
- `chattbm_entitlements`: canonical ID, user ID, subscription ID (foreign key), lifecycle, version, timestamps.
- `chattbm_provider_references`: canonical ID, user ID, provider, object type, provider object ID, association, version, timestamps.
- A unique idempotency constraint matching current contract semantics.
- A unique provider-reference key over provider, object type, and provider object ID.
- Foreign keys and indexes chosen only after confirming deletion/retention requirements and existing object shapes.

Do not store raw provider credentials. Avoid a broad JSONB-only design if it would prevent the database from enforcing ownership, uniqueness, or lifecycle invariants. Preserve compatibility for any fields currently returned by the public domain interfaces.

## Safe rollout sequence

### Phase 0 — baseline and backup
- Capture test fixtures and current persistence/registry behavior.
- Establish where production JSON storage physically resides and whether it is persistent; do not assume Render disk durability.
- Take an approved backup of any real payment data, protect it, and test restore in an isolated environment.
- Record counts by object type and validation results without exposing sensitive records.

### Phase 1 — schema and runner
- Implement the reviewed migration ledger and lock.
- Apply additive schema to an isolated PostgreSQL database.
- Test clean apply, repeat apply, checksum mismatch, lock contention, interrupted migration, and explicit rollback.
- Verify rollback only removes newly created schema when empty; never drop production data silently.

### Phase 2 — repository adapter
- Introduce a persistence interface and a PostgreSQL implementation that matches existing domain methods.
- Preserve return shapes and error behavior, including conflicts and idempotent duplicates.
- Add transaction boundaries for operations that must update more than one canonical table.
- Do not dual-write to JSON and PostgreSQL without an explicit consistency and recovery design.

### Phase 3 — import and reconciliation
- Build an offline, repeatable import tool for a validated snapshot, with a dry-run mode.
- Validate duplicate IDs, owners, idempotency keys, provider-reference uniqueness, lifecycle states, and subscription/entitlement relationships before writes.
- Compare source/destination counts and deterministic record fingerprints.
- Abort on any conflict; never guess which conflicting record is correct.
- Keep the source snapshot unchanged and securely retained until restore and reconciliation sign-off.

### Phase 4 — verification and cutover
- Run the existing full test suite plus PostgreSQL integration and failure tests on Node.js 20+.
- Test concurrent writes, process restarts, multiple app instances, database outage, transaction rollback, and retry/idempotency.
- Cut over only with an approved maintenance/consistency plan and tested rollback to the previous persistence implementation.
- Verify canonical payment/entitlement reads and writes end to end before enabling any product-access gate.
- Keep founder exemption disabled throughout.

## Required tests

- All payment, subscription, entitlement, and provider-reference lifecycle tests pass unchanged or have reviewed contract-preserving updates.
- Same idempotency key produces the same canonical result; conflicting reuse fails.
- Same provider reference cannot be associated with conflicting canonical objects.
- User ownership is immutable and cross-user reads fail.
- Database errors never become success, active entitlement, or fabricated empty state.
- Atomic operations remain atomic after process interruption.
- Data survives process restart and is shared across instances.
- Migration up/down and backup/restore are verified against a disposable database.
- No provider credential or private customer content appears in logs.
- Existing authentication, rate limits, and provider safety limits are unchanged.

## Rollback

Rollback must be a deliberate operational procedure, not an automatic response to a failed request:

1. Stop new payment mutations during the approved cutback window.
2. Take a protected snapshot of the PostgreSQL state and preserve logs.
3. Verify the pre-cutover snapshot and consistency boundary.
4. Switch back only if no post-cutover canonical updates would be lost; otherwise reconcile those updates first.
5. Do not run down migrations that would drop tables containing canonical records.
6. Resume writes only after a reconciliation check and explicit operator approval.

## Separate founder-access phase

Only after REG-096 has a verified durable persistence/query boundary:
- Approve a feature/plan matrix.
- Define a separate, server-trusted product policy that does not impersonate a payment or subscription.
- Verify the founder account through the normal account verification process.
- Keep founder exemption disabled by default until all route-level and regression tests pass.
- Keep the initial admin dashboard read-only and aggregate-only.

## Current status

This is a proposal, not a migration implementation. No database schema, production data, payment state, entitlement, or live customer access behavior was changed.
