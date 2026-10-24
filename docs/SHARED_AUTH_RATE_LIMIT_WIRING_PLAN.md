# Shared Authentication Rate-Limit Wiring Plan

## Current state
- `auth/authRoutes.js` still uses the process-local `createRateLimiter` middleware.
- `auth/PostgresRateLimitStore.js` and `auth/sharedRateLimit.js` are not wired into those routes.
- Migration `005_auth_rate_limits.sql` has not been applied to production.
- Do not enable the shared middleware until the migration and failure behavior are reviewed.

## Required wiring
Use one shared store instance for all four authentication limits:
- Registration: 5 attempts per window.
- Login: 10 attempts per window.
- Password-reset request: 3 attempts per window.
- Password-reset confirmation: 5 attempts per window.

Give each route a distinct scope. Keep the existing in-memory middleware unchanged unless an explicit, tested configuration selects the shared store. Never fall back to the in-memory limiter after a shared-store error; return the shared middleware's 503 response.

## Migration and rollout gates
1. Decide and document the production migration mechanism; do not run DDL automatically at server startup.
2. Apply the migration through the approved deployment/database procedure and verify the table/index exist.
3. Wire middleware behind an explicit environment/configuration switch that cannot silently enable itself before the schema is present.
4. Add route-level tests for all four routes, including database failure, 429 behavior, and ensuring the existing handlers are not called on 503.
5. Verify cleanup is scheduled with bounded batches and does not overlap unsafely; monitor database latency and error rate.
6. Deploy only after CI passes and a reviewed rollout/rollback plan is approved.

## Security note
The store hashes its supplied key with SHA-256. This is a digest, not keyed anonymization. Consider an HMAC using a dedicated server secret before production rollout, with secret rotation and stable-key implications documented.
