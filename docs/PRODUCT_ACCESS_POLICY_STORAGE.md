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
