# Shared Authentication Rate-Limit Wiring Plan

## Current state
- `auth/authRoutes.js` supports an explicit opt-in to the PostgreSQL-backed shared limiter.
- The default remains the existing process-local limiter unless `AUTH_SHARED_RATE_LIMIT_ENABLED=true` is set.
- `database/Postgres.js` creates the shared rate-limit table and expiry index idempotently during the existing database initialization routine, consistent with the current schema-initialization pattern. The separate SQL migration remains available for isolated integration testing and controlled schema review.
- The shared limiter has not been enabled in production. No production environment variables have been changed.

## Limits and storage
One shared PostgreSQL store is used for four independent scopes:
- Registration: 5 attempts per 15-minute window.
- Login: 10 attempts per 15-minute window.
- Password-reset request: 3 attempts per 15-minute window.
- Password-reset confirmation: 5 attempts per 15-minute window.

The store requires `AUTH_RATE_LIMIT_HMAC_SECRET` to be at least 32 bytes. It uses HMAC-SHA-256 to protect stored bucket identifiers. Treat this as a stable secret: rotating it resets the effective bucket namespace and temporarily resets existing rate-limit counts.

## Failure behavior
- If shared storage fails or returns malformed data, the middleware returns 503 and does not call the authentication handler.
- It never falls back silently to the process-local limiter in shared mode.
- Expired rows are cleaned in bounded batches of at most 100 entries opportunistically every 100 consume calls. Cleanup is best-effort and does not block an otherwise valid rate-limit operation.
- The existing process-local limiter remains the default unless the explicit feature flag is enabled.

## Production rollout gates
1. Confirm the current branch and full CI checks are green.
2. Review the schema-initialization change and confirm startup ordering invokes database initialization before accepting traffic.
3. Set `AUTH_RATE_LIMIT_HMAC_SECRET` in the deployment secret store before enabling the feature flag; never commit the value or send it in chat.
4. Deploy first with `AUTH_SHARED_RATE_LIMIT_ENABLED` unset or `false`, confirming the default path is unchanged.
5. Only after explicit approval, enable `AUTH_SHARED_RATE_LIMIT_ENABLED=true` and verify authentication routes, 429 behavior, 503 fail-closed behavior, database latency, and cleanup.
6. Rollback by unsetting the feature flag; retain the table until separately reviewed before any destructive schema operation.

## Security note
Do not enable the feature in production until the environment secret is configured and the startup schema path is verified. No live database operation is performed by this plan.
