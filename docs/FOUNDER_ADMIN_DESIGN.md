# Founder and Administrator Access Design

Status: Draft implementation under review
Implementation status: Read-only admin overview and founder authorization implemented on feature/founder-admin-design; founder subscription entitlement remains unimplemented
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

- The current branch contains a draft founder authorization middleware and read-only admin overview endpoint. These changes are not merged or deployed.
- The founder subscription entitlement, customer quota integration, usage telemetry, payment/subscription reporting, and visible dashboard UI remain unimplemented.
- The account email verification status observed during discovery was unverified; it must be resolved before granting permanent privileges.
- Live AI provider costs may not be available unless usage telemetry is configured.
- Third-party infrastructure and provider charges are not waived by a ChatTBM founder entitlement.


## 11. Repository Discovery Findings (2026-10-25)

The following findings must shape implementation:

- `auth/requireAuth.js` attaches `req.authUser` only after the existing session service validates the session. New admin authorization MUST use this server-resolved identity.
- `auth/AuthService.js` returns the authenticated account ID and email, but the current session lookup does not return `email_verified_at`. Verification status must be checked through an approved server-side account query/service before founder activation; do not infer verification from the email address or a successful login.
- A read-only query against the configured `chattbm-db` found the founder account enabled but `email_verified_at` is NULL. The stable account ID exists, but must not be committed to source or treated as approval to activate privileges.
- `payment/PaymentPersistence.js` currently persists payment, subscription, and entitlement records to a JSON file by default, rather than the PostgreSQL users database. Before relying on this persistence for a production founder waiver, determine its deployment durability and whether a canonical durable store is available. Do not introduce a second entitlement registry or assume this file survives service replacement.
- The repository has PostgreSQL-backed shared authentication rate limiting behind `AUTH_SHARED_RATE_LIMIT_ENABLED`; existing docs say it is not enabled by default and requires separately reviewed configuration and a secret. Founder/admin work must not enable or modify it implicitly.
- Existing plugin design requires server-side per-account usage limits and resource bounds. Founder access must not disable those controls.
- The existing health endpoint exposes basic service/database health, but this review did not establish a trusted source for aggregate AI token consumption or provider cost. Such dashboard metrics must remain marked unavailable until actual telemetry is identified.

## 12. Revised Implementation Gate

Before runtime code is written, complete these checks:

1. Inspect the actual access/entitlement decision point used by the application; do not assume PaymentPersistence is already connected to all premium feature gates.
2. Decide how founder entitlement can be represented durably without weakening REG-096 canonical authority or creating a competing registry.
3. Establish a safe, verified founder-account activation process. Do not set the production founder ID until the account verification status is resolved.
4. Identify real rate-limit and provider-usage telemetry sources and their retention/window semantics.
5. Keep the initial admin endpoints read-only and aggregate-only.
6. Add implementation only on a separate branch after the above decisions are recorded; do not merge or deploy automatically.


## 13. Entitlement Gate Inspection Findings (2026-10-25)

- The canonical Payment & Subscription domain is documented in `docs/CONTRACT.md` as owner of payment, subscription, and entitlement state.
- The current `payment/Entitlement.js` object represents a subscription-linked entitlement with lifecycle states. It does not itself define a founder or lifetime-access policy.
- `payment/PaymentBoundary.js` coordinates payment creation and provider outcomes; the reviewed portion does not establish a general request-time product access decision.
- `services/assistantEngine.js` explicitly lists paid subscription entitlements as not verified available product behavior. Repository search did not identify a single established product-wide entitlement gate that can safely be extended without further tracing.
- Therefore, do not add a founder-only bypass directly inside the assistant engine, and do not manufacture a subscription/payment to simulate founder access. First trace the actual protected feature consumers and approve a canonical access-decision boundary under REG-096.
- A first implementation can safely add a separately tested admin authorization boundary only after the route/API design and real telemetry sources are identified. Do not expose private user data merely to make a dashboard look complete.

## 14. Next Work Item

Trace the authenticated chat route into its controller and service, plus any existing quota/access checks, to establish where product entitlement would be enforced if paid features are introduced. Document the concrete call path and tests before changing runtime behavior. The current work remains design-only until that trace is complete.


## 15. Authenticated Chat Call-Path Trace (2026-10-25)

Verified source path:

1. `server.js` mounts `requireAuth` before `routes/chatRoutes.js` at `/api/chat`.
2. `auth/requireAuth.js` validates the cookie/bearer session using `authenticateSession` and attaches the verified identity as `req.authUser`.
3. `routes/chatRoutes.js` registers both `POST /` and `POST /stream`.
4. `controllers/chatController.js` calls `authenticatedUserId(req)` in both handlers and passes `{ ...body, userId }`, ensuring the verified ID overrides any body-supplied ID.
5. The handlers delegate to `ChatInteractionBoundary.handleInteraction()` and `handleStreamingInteraction()`.

Finding: the reviewed chat route has a sound authentication identity path, but no general product-plan entitlement/quota check was found in this call path. The existing assistant engine documentation explicitly says paid entitlements are not verified as available product behavior. Do not insert a founder bypass or plan quota into this route until a canonical product access contract exists and all relevant product surfaces are inventoried. Authentication and security rate limits must remain independent of any future founder product entitlement.

Immediate next implementation should focus on an isolated, read-only admin API with authenticated server-side authorization and aggregate-only outputs, after its metric sources and failure behavior are specified. It must not expose conversation content, credentials, or unverified usage estimates.


## 12. Implementation Checkpoint (2026-10-25)

Implemented on the draft branch only:
- `GET /api/admin/overview`, mounted behind existing session authentication.
- Founder authorization requires `CHATTBM_FOUNDER_USER_ID`, matches the authenticated server-side user ID, and checks that the database account is verified and enabled.
- Overview reports aggregate registered-user count and database/service status; usage and provider-cost metrics explicitly report unavailable.
- Focused Node.js 20 tests and syntax checks passed in GitHub Actions for commit `0e18facb21dd1e0fa754554b15f4b1a5f8ff3907`.

Not implemented or not yet verified:
- Founder free subscription entitlement and the canonical product-access decision.
- Admin dashboard UI, durable AI usage/token/cost telemetry, complete shared rate-limit metrics, and reliable payment/subscription reporting.
- Production founder activation. The account verification status must be resolved first; no production environment variable should be set before review and approval.
- Full end-to-end route tests for anonymous requests, ordinary authenticated users, and founder requests through the Express app.

Do not merge or deploy this branch solely because its focused CI tests pass.


## 13. Founder Entitlement Boundary Review (2026-10-25)

The existing payment domain does not yet represent founder/lifetime access:
- `payment/Entitlement.js` requires a `subscriptionId`; it cannot express a founder entitlement without inventing a subscription.
- `payment/PaymentLifecycle.js` defines subscription-linked entitlement lifecycle states, but no founder-policy decision.
- `payment/PaymentPersistence.js` stores records in a local JSON file by default. Its use as the durable production authority for a permanent founder waiver is not established.
- `services/assistantEngine.js` validates and executes assistant requests but does not enforce subscription entitlement. Do not add an isolated bypass there; first identify the central product-access decision used by every paid feature.
- The current payment implementation must not be modified to create a fake successful payment or a synthetic subscription.

### Required next design decision

Before implementing the founder waiver, map every user-facing paid-feature entry point to its server-side access decision. If no shared decision exists, design one central ProductAccess/Entitlement boundary with explicit policy results (for example, subscription-required versus founder-exempt), while preserving the canonical payment domain and all security/provider limits. This must include normal and streaming chat paths and any other paid features; it must not treat admin access as product entitlement.

The design must specify durable identity/policy storage, rollout and rollback, and tests proving ordinary-user behavior is unchanged. Do not activate the founder setting or merge/deploy until this contract, persistence, and account verification questions are resolved.
