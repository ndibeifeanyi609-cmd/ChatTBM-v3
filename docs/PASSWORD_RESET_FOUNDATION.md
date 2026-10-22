# Password Reset Foundation

Status: prepared on feature branch; not deployed.

## Scope
- Store SHA-256 token digests only, never raw reset tokens.
- Bind each token to an existing user, an expiry time, and a single-use timestamp.
- Cascade token deletion when its user account is deleted.
- Keep reset-request responses generic to prevent account enumeration.
- Rate-limit reset requests and token redemption.
- Send reset links through Resend using a verified ChatTBM sender domain.
- Change passwords through the existing scrypt password-hashing boundary.
- Revoke existing sessions after a successful password reset.
- Do not log passwords, raw tokens, API keys, or reset URLs.

## Migration
`database/migrations/004_password_reset_tokens.sql` creates the reset-token table and indexes. It must be applied only to the database selected by the production DATABASE_URL after reviewing a backup and migration plan. This file has not been run against any database.

## Rate-limiting deployment note
The current `auth/rateLimit.js` limiter keeps counters in process memory. Counters reset when the server restarts and are not shared across multiple instances. Treat these limits as a single-instance safeguard only; before scaling authentication across instances, move the counters to a shared store (for example, PostgreSQL or Redis) and add multi-instance tests. Do not describe the current limiter as a global production-wide limit.

## Required verification before deployment
1. Unit tests for unknown accounts, token hashing, expiry, single use, invalid passwords, and password updates.
2. Route tests for generic responses and rate limits.
3. Verify Resend sender configuration and production secrets.
4. Apply migration to a staging database and run end-to-end recovery tests.
5. Back up production and schedule an approved production migration.
6. Deploy only after review and a rollback plan.
