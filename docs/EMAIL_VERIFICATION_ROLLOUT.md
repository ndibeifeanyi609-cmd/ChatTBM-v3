# Email Verification Rollout Plan

Status: proposal for review only. This document does not authorize a production
migration, deployment, or login-policy change.

## Current behavior

- Registration creates the account and attempts to issue and send a verification link.
- Verification links are single-use, expire after 30 minutes, and are stored as token hashes.
- The browser recognizes the `verify_email_token` query parameter and submits it to the confirmation endpoint.
- The sign-in screen offers a rate-limited resend-verification action.
- Login currently does not require `email_verified_at`. Do not describe accounts as blocked pending verification.

## Existing-account compatibility

Do not change login to reject every row with a null `email_verified_at` until the
product owner approves an explicit rollout. Existing users may have valid accounts
created before verification existed; null does not prove an address is invalid.

Before enforcement is considered:
1. Confirm the deployed schema and migration runner/history against a disposable database.
2. Measure how many existing accounts have a null verification timestamp without exposing email addresses.
3. Decide whether existing accounts remain grandfathered, receive an optional verification prompt, or enter a staged enforcement period.
4. Publish user-facing notice and provide a working resend/recovery path.
5. Add tests for verified users, unverified new users, grandfathered existing users, disabled users, and database/provider failures.
6. Require a separate reviewed change and explicit approval before enforcing the policy.

## Email delivery requirements

- Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and the correct public application URL in the deployment environment.
- Never commit credentials or tokens.
- Keep request responses anti-enumerating: do not reveal whether an address has an account or is already verified.
- If email delivery is unavailable, preserve account creation and clearly tell the user to request a verification link later; do not claim that an email was sent.
- Confirm the actual production sender/domain and link destination before enabling this flow for customers.

## Release gate

This PR remains Draft until reviewers inspect the migration strategy, service and
route behavior, browser flow, and test coverage. Passing CI is not proof that
production email credentials, delivery, or database migrations are configured.
No production database changes are authorized by this document.


## Migration discovery checkpoint (2026-10-28)

Repository review confirms that `server.js` calls `initializeDatabase()` from
`database/Postgres.js`, which creates core tables with `CREATE TABLE IF NOT
EXISTS`. Numbered SQL migrations also exist, but no general migration runner
or migration-history ledger was confirmed in the reviewed startup path. Existing
migrations `002` and `003` overlap with bootstrap-created tables, so replaying
all numbered files as a new startup routine is not a safe assumption.

Migration `006_email_verification_tokens.sql` is therefore still a proposed,
separately applied schema change. The disposable PostgreSQL test now models a
legacy `chattbm_users` table without `email_verified_at`, applies migration
`006` twice, and checks that the column is added before exercising token
redemption. This validates the SQL upgrade behavior, not production deployment
history or automatic execution.

Before production rollout, separately confirm the actual deployed schema and
migration history, choose and document the supported schema-application
procedure, review backup/rollback, and obtain explicit approval for the
production schema step. Do not add automatic production migration execution
as part of this email-verification change.
