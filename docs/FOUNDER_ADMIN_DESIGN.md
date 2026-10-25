# Founder and Administrator Access Design

Status: Discovery and Design
Implementation status: Not implemented
Target: ChatTBM-v3

## 1. Purpose

Provide the verified ChatTBM founder with permanent ChatTBM subscription access and a server-authorized administrative view of product usage, limits, accounts, service health, and payment entitlements.

This design does not claim that any founder privilege or dashboard is active.

## 2. Existing Authority

- Authentication remains owned by the existing authentication boundary and PostgreSQL user records.
- Payment and Subscription remains the canonical authority for customer payment, subscription, and entitlement state.
- Existing request rate limits and provider/infrastructure safeguards remain active.
- The administrator capability is an application authorization boundary; it must not create a competing user, payment, or entitlement registry.

## 3. Founder Identity and Bootstrap

- Founder identity MUST be established server-side using an explicitly configured stable account ID, not a client-supplied email, role, query parameter, or browser state.
- The proposed bootstrap setting is `CHATTBM_FOUNDER_USER_ID`, populated only after the founder account is confirmed through the normal authentication and account-verification process.
- Missing, malformed, or unmatched configuration MUST fail closed: no founder or administrator privileges are granted.
- The currently inspected account has no `email_verified_at` value. Founder privileges MUST NOT be activated until account verification and ownership are resolved.
- Do not hard-code a founder email in source code. Do not print identity configuration or secrets in logs.
- Account recovery or transfer of founder authority requires a documented, auditable ownership-verification procedure.

## 4. Separate Privileges

### Founder entitlement

The founder entitlement grants permanent access to ChatTBM product features without requiring a customer subscription payment.

- It MUST be granted only to the server-resolved founder identity.
- It MUST integrate with the existing entitlement/access decision rather than bypassing it in scattered controllers.
- It MUST NOT fabricate a successful payment, create a customer payment transaction, or modify another user's subscription.
- It waives ChatTBM subscription charges only. AI-provider usage, hosting, database, app-store, and other third-party costs may still apply.
- Provider abuse protection, infrastructure safety limits, and security rate limits remain enforced.

### Administrator authorization

Administrator authorization is separate from free product access.

- Every administrative endpoint MUST require authentication and a server-side founder/admin authorization check.
- Ordinary users MUST NOT be able to promote themselves by changing request fields or local browser state.
- Unauthorized requests MUST return a controlled 403 response without leaking private user or operational data.
- Administrative changes, if introduced later, MUST be auditable and least-privilege.
- The first iteration should be read-only wherever practical.

## 5. Initial Administrative View

The first dashboard iteration should expose only data supported by existing authoritative sources:

- Registered-account count and account status
- Aggregate request and rate-limit usage where reliable telemetry exists
- AI provider request/usage data and cost estimates only when actually available from trusted telemetry
- Current service and database health
- Subscription and entitlement status from the canonical Payment & Subscription authority
- Clear indicators when a metric is unavailable or only an estimate

It MUST NOT expose password hashes, session tokens, OAuth tokens, API keys, payment secrets, or full private conversation contents by default.

The dashboard MUST NOT imply that a configured limit is a measured usage count. Each metric should identify its source and measurement window.

## 6. Limits and Usage Semantics

- Customer product-plan quotas may eventually differ for the founder, but authentication throttles, abuse prevention, provider safety limits, and infrastructure protection MUST remain in force.
- Rate-limit inspection MUST be read-only in the first iteration.
- Do not change or disable existing rate limits as part of dashboard work.
- Do not infer AI costs from request counts unless a documented, explicitly labelled estimation method exists.
- If usage telemetry is incomplete, show that limitation instead of fabricating a number.

## 7. Data and API Boundaries

- Resolve the current user from the existing authenticated server session.
- Do not accept `userId`, `role`, `isFounder`, `isAdmin`, or email from request bodies as authorization evidence.
- Keep administrator routes separate from normal user routes and apply the same trusted-origin protections used by existing mutation endpoints.
- Query only the minimum data needed; use aggregate queries for counts and usage.
- Never return credential material or sensitive authentication fields.
- Any new durable role table or entitlement representation requires a migration, rollback plan, and explicit review against existing canonical Payment & Subscription contracts.

## 8. Verification and Failure Tests

Required tests before activation:

- No founder ID configured -> no privileged access.
- Wrong account ID -> forbidden.
- Client-supplied admin/founder fields -> ignored.
- Unverified founder account -> privileges remain inactive.
- Authenticated ordinary user -> forbidden on every admin route.
- Founder can access authorized admin read endpoints.
- Founder subscription waiver does not fabricate a payment.
- Founder access survives a new login and server restart.
- Existing customer entitlement checks remain unchanged.
- Authentication rate limits and provider safety limits remain active.
- Database/telemetry failures return controlled errors and do not report false metrics.
- Admin responses never contain password hashes, tokens, or secrets.

## 9. Delivery Sequence

1. Confirm the current branch and open pull requests; do not overwrite unrelated work.
2. Review the existing authentication, usage/rate-limit, and payment-entitlement interfaces.
3. Complete Contract impact analysis and approve the design.
4. Implement the smallest server-side authorization and entitlement integration.
5. Add migration(s) only if existing persistence cannot represent the requirement safely.
6. Add focused unit, route, authorization-failure, and regression tests.
7. Run the full existing verification suite in Node.js 20+.
8. Document environment configuration, founder bootstrap, recovery, and rollback.
9. Open a reviewable pull request; do not merge or deploy automatically.
10. Activate the founder identity only after the founder account is verified and the deployment configuration is reviewed.

## 10. Known Limitations

- This document is design only. No role, entitlement, dashboard, or database schema has been changed by this design.
- The account email verification status observed during discovery was unverified; it must be resolved before granting permanent privileges.
- Live AI provider costs may not be available unless usage telemetry is configured.
- Third-party infrastructure and provider charges are not waived by a ChatTBM founder entitlement.
