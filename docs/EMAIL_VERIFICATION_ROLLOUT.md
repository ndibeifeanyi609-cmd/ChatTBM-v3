# Email Verification Rollout Plan

Status: proposal for review only. This document does not authorize a production
migration, deployment, or login-policy change.

## Current behavior

- Registration creates the account and attempts to issue and send a verification link.
- Verification links are single-use, expire after 30 minutes, and are stored as token hashes.
- Verification links open a dedicated `verify-email.html` page with a restrictive Content Security Policy and no third-party scripts. Its inline script reads the token from the URL fragment, immediately clears browser history, and submits the token to the confirmation endpoint. The fragment is not sent in the initial HTTP request.
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



## Isolated staging checklist (not yet executed)

Before any staging deployment or schema change, obtain explicit approval and
use an isolated staging database that contains no customer data.

### Required configuration

- Set `AUTH_SHARED_RATE_LIMIT_ENABLED=true` in the staging service.
- Set `AUTH_RATE_LIMIT_HMAC_SECRET` to a secret with at least 32 bytes; generate
  it in the secret manager/dashboard, never in source control or chat.
- Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` using staging-approved
  credentials and a verified sender.
- Set `CHATTBM_PUBLIC_URL` to the staging web URL so verification links return
  to the staging application.
- Confirm the staging service uses only the isolated staging database and that
  its schema migration and rollback have been reviewed.

### Verification steps

1. Confirm the service reports healthy and uses the intended staging database,
   without printing credentials or connection strings.
2. Confirm shared rate limiting starts successfully; missing/invalid HMAC
   configuration must prevent auth startup or fail closed, not silently fall
   back to local limits when shared mode is enabled.
3. Use a controlled test mailbox to register and receive a verification email.
4. Confirm the link token is in the URL fragment, is cleared from browser history,
   and is submitted to the confirmation API; verify the token is single-use and
   expires as designed.
5. Confirm the dedicated verification page loads no third-party scripts and
   clears the fragment before making the API request. Exercise resend,
   expired/invalid tokens, provider failure, and rate-limit responses. Confirm
   no secrets or raw provider responses appear in logs.
6. Verify registration/login behavior remains compatible with existing accounts;
   no email-verification enforcement policy is authorized by this PR.
7. Record results and rollback steps before requesting production approval.

Do not switch the existing Render service from `main`, modify either existing
Render database, or enable production delivery as part of this checklist without
separate explicit approval.

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

## Render schema inspection checkpoint (2026-10-28)

A read-only inspection of both Render Postgres instances found that both currently
have `chattbm_users.email_verified_at`, but neither has the
`chattbm_email_verification_tokens` table. This means the complete email-verification
schema is not present in either database at the time of inspection. No rows from
the users table were read, and no database writes were performed.

The Render staging web service is configured to deploy from `main`; its latest
observed deployment is commit `a4753cb26fa2945d65aadac0511eb4b730c1f6af`,
not the email-verification feature branch. Automatic pull-request previews are
disabled for this service. Therefore this staging service is not yet running the
PR's verification routes and cannot be used as an end-to-end test of this feature
without a separately approved staging deployment plan.

Before an end-to-end test, identify which database each service uses without
revealing connection strings, create an isolated staging database or approved
disposable environment, apply the reviewed migration there, configure Resend
secrets through the deployment dashboard, and verify delivery using a controlled
test mailbox. Do not change either existing database or switch the staging service
branch as part of this discovery step.
