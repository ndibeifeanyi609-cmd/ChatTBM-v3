# Email Verification Design

Status: Design checkpoint on `feature/email-verification`. Not deployed.

## Goal
Verify control of an email address before granting founder privileges or treating an account as fully verified.

## Security requirements
- Use a cryptographically random, single-use token with a short expiry (recommended 30 minutes).
- Store only a SHA-256 token digest in PostgreSQL; never store or log the raw token.
- Invalidate older outstanding verification tokens when issuing a new one.
- Consume tokens atomically and only set `chattbm_users.email_verified_at` when a valid, unexpired token is redeemed.
- Use generic request responses so the endpoint does not reveal whether an email is registered.
- Apply shared authentication rate limits to request and confirmation endpoints.
- Send messages through the existing Resend configuration (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) and the configured public app URL. Never include tokens in logs.
- Do not automatically mark Google-linked accounts verified unless the Google OAuth callback validates the provider's verified-email claim and maps it to the same account safely.
- Do not grant founder privileges, alter production rows, or bypass verification as part of this feature.

## Implementation sequence
1. Add a versioned PostgreSQL migration for verification-token storage, with a foreign key, unique token digest, expiry, and used timestamp.
2. Add a verification service that issues tokens and redeems them transactionally.
3. Add a Resend mailer dedicated to verification messages.
4. Add rate-limited request and confirmation routes with generic responses.
5. Add tests for invalid input, unknown emails, expired/used tokens, token rotation, atomic single-use redemption, mail delivery failure, and verified timestamp updates.
6. Add integration coverage against disposable PostgreSQL and run the complete CI suite.
7. Add a user-facing verification/resend experience and verify actual deployed-origin behavior before production approval.

## Production gate
Email verification is not complete until the schema migration, route tests, disposable-PostgreSQL tests, mail configuration, and user-facing flow are verified. Keep this branch separate and do not merge or deploy until the review gates pass.
