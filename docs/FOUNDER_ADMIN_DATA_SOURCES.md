# Founder Admin Dashboard Data Sources

Status: Design only. No production behavior changed.

## Confirmed sources and limits

- Registered accounts: PostgreSQL table `chattbm_users`. The dashboard should expose aggregate counts only in its first version.
- Service health: existing `GET /api/health` uses the PostgreSQL health check. Reuse the internal health function rather than making server-side HTTP requests to the public endpoint.
- Authentication limits: `auth/rateLimit.js` uses in-process Maps. These counters are not durable or shared across instances, so they cannot be represented as complete production usage.
- AI usage: `services/GeminiProvider.js` returns provider/model metadata but does not persist token usage or cost metrics. Show unavailable until trusted telemetry exists.
- Payment state: REG-096 is the canonical payment/entitlement authority, but its production durability and query path still need confirmation.
- Private conversations, credentials, tokens, and individual user email addresses are excluded from the initial dashboard.

## Proposed first API slice

A read-only `/api/admin/overview` endpoint may return only:
- aggregate registered-account count;
- service/database health;
- explicit unavailable status for metrics that lack a reliable source.

Security requirements:
- Mount behind existing authentication and separate server-side founder authorization.
- Fail closed when founder identity is not configured or verified.
- Never trust role, founder status, email, or user ID supplied in the request body.
- Do not disable authentication throttles, abuse protection, or provider safety limits.
- Return controlled failures when data sources are unavailable; never report false zeroes or false health.
- Add tests for anonymous access, ordinary user access, missing founder configuration, database failure, and authorized access.
- Do not merge or deploy without test results and review.

This document is planning only. Founder access and dashboard APIs are not activated.
