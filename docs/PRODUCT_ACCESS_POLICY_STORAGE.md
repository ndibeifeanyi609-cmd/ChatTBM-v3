# Product Access Policy Storage Proposal

Status: proposal only; no database schema or production behavior changed
Branch: feature/founder-admin-design
Date: 2026-10-25

## Decision

Use a small PostgreSQL-backed policy table only if a reviewed REG-096 contract confirms it does not compete with canonical payment, subscription, or entitlement records. This table expresses product rules and the founder waiver; it must not represent a payment, subscription purchase, or customer entitlement transaction.

The application must fail closed for subscription-required features when the policy or durable access facts cannot be read. Existing free features must retain their current behavior until a product-plan matrix is approved. Do not connect this proposal to live routes yet.

## Proposed schema

Table: `chattbm_product_access_policies`

- `feature_key TEXT PRIMARY KEY`: stable, server-defined feature key.
- `requires_subscription BOOLEAN NOT NULL`: approved product policy for this feature.
- `founder_exemption_allowed BOOLEAN NOT NULL DEFAULT FALSE`: feature-level approval for founder exemption.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`: last policy change timestamp.
- `updated_by TEXT`: audited operator identifier when changed through an approved administrative process; no UI mutation in the initial release.

Founder identity itself remains in the reviewed server deployment setting `CHATTBM_FOUNDER_USER_ID`, and eligibility must be checked against the authoritative user row (verified and enabled). Do not store founder identity in a client-controlled field or seed an account ID into migrations.

This proposal does not yet solve canonical paid-entitlement lookup. Active customer entitlements must continue to come from the canonical REG-096 authority, not from this feature-policy table.

## Access decision order

1. Resolve user identity from the authenticated server session.
2. Resolve a known feature key from server route configuration, never from an arbitrary client-selected policy name.
3. Load the trusted policy record from PostgreSQL.
4. If the feature is not subscription-gated, preserve its approved free behavior.
5. If it is subscription-gated, permit the founder exemption only when the configured founder identity matches, the database account is verified and enabled, and the feature policy explicitly allows founder exemption.
6. Otherwise resolve the customer's active entitlement from the canonical REG-096 source.
7. If any required source is unavailable, return a controlled unavailable result; do not invent an entitlement, successful payment, or zero usage.

Product entitlement must not bypass authentication, resource quotas, abuse protections, provider limits, or infrastructure safety controls. Standard and streaming chat must use the same approved policy if either is eventually gated.

## Migration and rollback requirements

- Add a versioned, reviewed migration using the repository's approved migration mechanism; do not create tables implicitly at server startup.
- Add only explicitly approved feature rows. Do not infer which features are paid from route names.
- Keep the migration additive and reversible. Rollback removes only this policy table and its rows; it must not alter users, payments, subscriptions, customer entitlements, conversations, or sessions.
- Do not seed a founder ID, enable the founder exemption by default, or set production environment variables in the migration.
- Test migration against an isolated PostgreSQL database, including apply, repeat/idempotency behavior where supported, and rollback.
- Verify cross-instance consistency and persistence after restart before activation.
- Require code review and explicit approval before merging or deploying.

## Tests required before wiring into routes

- Unknown feature key is denied or unavailable; it never receives an implicit default policy.
- Missing policy/database failure fails safely for gated features.
- Approved free features retain their existing behavior.
- Founder exemption defaults off and requires all trusted checks.
- Client-supplied founder/admin/plan/entitlement fields have no effect.
- Customer entitlement lookup remains canonical and scoped to the authenticated user.
- Founder access cannot read another user's data.
- Rate limits, abuse controls, and provider/resource caps remain active.
- Standard and streaming paths cannot diverge in access policy.
- Migration rollback does not modify canonical payment or customer data.

## Open decisions

1. Approve the feature-level plan matrix.
2. Confirm the repository's canonical migration mechanism.
3. Define a durable query interface for REG-096 customer entitlements before paid gates are introduced.
4. Resolve founder account verification through the normal account process.
5. Define how policy edits are reviewed/audited; initial version should be read-only and seeded only by reviewed migration.

## Repository verification checkpoint (2026-10-25)

Source inspection confirms these constraints:

- `package.json` defines start/dev and a streaming-test script, but no migration script or migration framework is declared.
- `database/Postgres.js` currently creates several application tables using `CREATE TABLE IF NOT EXISTS` inside `initializeDatabase()`. That is the existing schema-initialization pattern, not a versioned migration/rollback mechanism.
- `payment/PaymentPersistence.js` defaults to a local JSON file and keeps records in process-local Maps after loading. `PaymentRegistry.js` also uses in-process Maps. Neither file establishes shared, durable production entitlement queries across instances.
- `payment/Entitlement.js` requires a `subscriptionId`, and REG-096 states that entitlements must not become active without verified payment/subscription authority. A founder waiver therefore must not be represented as a fabricated active subscription-linked entitlement.
- The repository has no approved durable entitlement query interface identified by this inspection.

## Implementation gate

Do not add a founder waiver to `PaymentPersistence`, `PaymentRegistry`, or the live route handlers yet. The next implementation proposal must first define a versioned migration/rollback convention, then define how REG-096 will gain durable PostgreSQL persistence for existing payment/subscription/entitlement records without losing canonical IDs, ownership, lifecycle, provider references, or idempotency. The feature policy table alone cannot safely answer customer entitlement queries.

The existing `initializeDatabase()` startup DDL should not be expanded for this feature until the migration approach is reviewed. No production schema or behavior was changed by this checkpoint.


## Proposed durable policy interface (design checkpoint)

This proposal separates three kinds of facts and must not collapse them into one table:

1. **Feature policy** — reviewed product rules, including whether a feature requires a subscription and whether a founder waiver is permitted.
2. **Canonical customer entitlement** — active customer access derived from REG-096 payment/subscription/entitlement records only. Until a durable PostgreSQL query adapter is implemented and reconciled, paid access decisions remain unavailable rather than being inferred from JSON or process-local Maps.
3. **Founder eligibility** — the configured founder identity plus a live query against the authoritative user record requiring verified email and enabled account status. No founder ID is seeded by migration.

The first database-backed interface should be read-only for application requests and return a three-way result: `allow`, `deny`, or `unavailable`. Database errors, missing policy rows, ambiguous entitlement records, and unsupported feature keys must not become implicit allows. Free features retain current behavior until a reviewed feature-plan matrix is approved.

### Proposed query boundary

- `getFeaturePolicy(featureKey)` reads a reviewed policy row and returns unavailable if no single valid row exists.
- `getCustomerEntitlement(userId, featureKey)` reads only canonical REG-096 records after a PostgreSQL persistence adapter and reconciliation migration are approved; it must not read from a policy table as if that were a purchase.
- `isEligibleFounder(userId)` checks the authoritative user row and configured founder identity.
- `decideProductAccess(...)` remains a pure function. A future adapter may supply trusted facts, but this proposal does not wire the decision into live routes.

### Required validation before implementation

- Approve the free/paid feature matrix and exact feature keys.
- Define a versioned, reversible migration sequence for existing payment transactions, subscriptions, entitlements, provider references, and idempotency keys.
- Dry-run import and reconciliation against a disposable database, including duplicate/orphan detection and row-count checks.
- Test cross-instance reads, restart persistence, idempotency uniqueness, concurrent lifecycle transitions, checksum verification, and rollback safety.
- Test all relevant route entry points, including standard chat and streaming, without enabling a gate until policy and entitlement sources are authoritative.
- Obtain explicit approval before any production backup/restore operation, migration, cutover, founder activation, or deployment.

Status remains proposal only. This checkpoint introduces no schema, runtime authorization, payment, entitlement, or production changes.
