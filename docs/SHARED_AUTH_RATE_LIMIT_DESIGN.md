# Shared Authentication Rate Limiting — Design

## Status
Design checkpoint only. No runtime changes, database writes, or production rollout are authorized by this document.

## Current behavior
`auth/rateLimit.js` keeps request counters in a process-local JavaScript `Map`. Counters disappear on restart and are not shared across multiple server instances. The current authentication routes use separate limiters for registration, login, password-reset requests, and reset confirmation.

## Proposed boundary
Introduce a storage-neutral asynchronous rate-limit boundary. Keep the existing synchronous limiter as the default until a shared implementation has passed tests and an explicitly approved rollout.

## PostgreSQL candidate
The existing PostgreSQL pool is available from `database/Postgres.js`. PostgreSQL can provide shared counters without a new paid service, but a naive database query on every request adds latency and database load. Before implementation, benchmark and test an atomic, concurrency-safe fixed-window operation using a composite key and expiry. Do not store raw email addresses, passwords, session tokens, or reset tokens in rate-limit keys; use normalized route/IP dimensions and a keyed digest if an identifier dimension is required.

## Required safeguards
- Atomic updates under concurrent requests; no read-then-write race.
- Per-route policies remain independently configurable.
- Preserve 429 response shape and `Retry-After` behavior.
- Fail closed for sensitive authentication actions if shared storage is unavailable, with a deliberate, documented availability policy; do not silently fall back to an unbounded limiter.
- Bound storage growth with expiry and cleanup.
- Avoid logging client secrets or raw identifiers.
- Preserve testability with an injected clock and storage adapter.
- Keep IP extraction aligned with the trusted-proxy configuration; never trust arbitrary forwarded headers from clients.
- Do not introduce schema changes through an unreviewed migration runner. Resolve the project's schema-application strategy before adding a persistent table.

## Verification gate
1. Unit tests for limit, window reset, client isolation, storage errors, expiry, and 429 headers.
2. PostgreSQL integration tests for concurrent increments and shared state across two limiter instances.
3. Authentication route tests for register, login, reset request, and reset confirmation.
4. Load/latency check against the existing Render PostgreSQL plan.
5. CI must pass before review; production rollout requires explicit approval and post-deploy health/auth checks.

## Decision
Do not implement the PostgreSQL adapter until its atomic operation, storage lifecycle, schema deployment path, and failure behavior are tested. Prefer a small reviewed design and test-first implementation over replacing the existing limiter in one step.
