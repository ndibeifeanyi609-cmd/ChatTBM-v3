# Authentication Route Test Plan for Shared Rate Limiting

## Scope
This plan covers the four routes in `auth/authRoutes.js`:
- `POST /register`
- `POST /login`
- `POST /password-reset/request`
- `POST /password-reset/confirm`

## Tests required before route wiring
For each route, use an injected shared store and an HTTP-level test harness:
1. When the store allows a request, the existing route handler is reached and preserves its current response contract.
2. When the store count exceeds the route limit, respond with HTTP 429 and `RATE_LIMITED`; the route handler must not run.
3. When the store rejects with a database error, respond with HTTP 503 and `RATE_LIMIT_STORAGE_UNAVAILABLE`; the route handler must not run.
4. When the store returns malformed bucket data, respond with HTTP 503; the route handler must not run.
5. Verify each route uses a distinct scope and its existing limit: register 5, login 10, reset request 3, reset confirm 5.
6. Verify the same client is counted consistently across separate middleware/store instances.
7. Verify no raw email, password, session token, or reset token appears in the rate-limit key or logs.

## Test harness design
The current router imports service functions directly and creates its middleware at module load. To test route wiring without a live database, introduce a small router factory that accepts service functions and limiter middleware as dependencies, while retaining the existing exported router as the production default. Test the factory with fake services and a fake store. Do not change production route behavior until these tests pass.

## Gate
Do not wire the PostgreSQL store into the production router or enable a feature flag until all route tests pass, migration deployment is separately approved, and the rollback behavior is documented.
