# Shared Authentication Rate Limiting — Test Plan

## Goal
Verify that authentication rate limits are shared across backend instances without connecting to or changing the production database.

## Isolated test environment
- Run only in GitHub Actions against its disposable PostgreSQL 16 service.
- Use a test-only `DATABASE_URL`; never copy Render production credentials into CI.
- Do not run schema setup or test writes against any Render database.
- Keep the current in-memory limiter wired into production until the shared adapter is implemented, reviewed, and approved.

## Test cases
1. **Existing behavior regression:** configured limit, 429 response, headers, client isolation, and window reset remain correct.
2. **Shared counters:** two separately created limiter instances using the same PostgreSQL store observe the same counter.
3. **Concurrency:** parallel requests cannot exceed the configured allowance because increments are atomic.
4. **Window expiry:** a new window starts after expiry; stale rows are removed or bounded by a safe cleanup strategy.
5. **Storage errors:** the chosen failure policy is deterministic and tested; no silent fallback to an unbounded limiter.
6. **Route isolation:** registration, login, reset-request, and reset-confirm policies remain independent.
7. **Privacy:** keys never persist raw email addresses, passwords, session tokens, or reset tokens.
8. **Latency:** measure query latency and pool impact before enabling shared storage in production.

## Schema gate
The repository creates core tables in `database/Postgres.js` and has numbered SQL files, but a general migration runner was not confirmed. The implementation must first select and test a repeatable schema-application strategy against the disposable database. Do not alter the live database or add a production startup migration as part of this test-plan step.

## Completion gate
The integration test must fail if the test file or required test database is missing. The workflow must never target a production hostname or accept a production database URL. Implementation remains separate from this test-plan checkpoint.
