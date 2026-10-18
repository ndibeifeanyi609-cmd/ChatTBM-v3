# ChatTBM Authentication and Account Ownership Design

Status: Incomplete authentication implementation on the feature branch — CI passes for the current commit, but production security and end-to-end behavior are not yet verified.

## Purpose
Establish server-verified account identity before exposing PostgreSQL conversation history across devices. A client-supplied userId, email address, conversation ID, or browser storage value is never proof of authorization.

## Account model
- Use normalized unique email addresses and server-generated immutable account IDs.
- Store passwords only as hashes produced by a maintained password-hashing library with an appropriate work factor and unique salt.
- Use generic login and registration errors to avoid account enumeration.
- Production readiness requires email verification and secure password recovery using random, single-use, short-lived tokens stored only as hashes.

## Sessions
- Issue opaque cryptographically random session tokens after login; store only token hashes in PostgreSQL.
- Use HttpOnly, Secure-in-production, appropriately SameSite cookies with narrow path and expiry.
- Support server-side expiry, logout revocation, session rotation, and CSRF protection.
- Restrict CORS to the actual frontend origin; never combine wildcard origins with credentialed requests.
- Rate-limit authentication endpoints and never log credentials or tokens.

## PostgreSQL ownership
Use versioned migrations for users and sessions. Enforce unique normalized email, session-token hash uniqueness, foreign keys, and expiry indexes. Protected conversation operations derive user ownership from the validated session, never from request-body userId. Queries must constrain records by the authenticated user. Do not silently claim existing guest/localStorage history for an account.

## API and UI
Proposed endpoints: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, plus password recovery endpoints only when a secure delivery channel is configured. The frontend needs signup, sign-in, sign-out, and an unauthenticated state. The current guest identity and localStorage are not authenticated accounts.

## Required verification
Test password hashing and non-disclosure; generic credential failures; malformed, expired, revoked, and forged sessions; cross-user conversation access; CSRF/CORS; logout and expiry; rate limiting; database failures; migrations; and dependency-lock reproducibility. Do not deploy until protected routes enforce sessions and CI tests pass.

## Implementation status (feature branch only)
- Added Node.js scrypt password hashing and verification helpers plus random session-token generation and SHA-256 token digests in `auth/AuthCrypto.js`.
- Added PostgreSQL account/session tables and initialization for `chattbm_users` and `chattbm_auth_sessions`.
- Added registration, login, current-session, and logout handlers in `auth/authRoutes.js`, with rate limits on registration and login.
- Added an authentication middleware that validates the session against PostgreSQL and attaches the verified account to the request. The chat, voice, forecast, and software-builder API route groups are mounted behind this middleware.
- Chat identity is derived from the verified session in `auth/chatIdentity.js`; the body-supplied `userId` is overwritten by the verified identity before the interaction boundary is called.
- Added browser sign-in, registration, current-session restoration, sign-out, and an unauthenticated chat gate in `ui/ChatTBMBrowser.mjs`. Browser credentials are sent with `credentials: 'include'`.
- Added unit coverage for authentication middleware success, invalid/missing sessions, database-unavailable responses, and session-token extraction. GitHub Actions run #78 passed after these tests were added.
- The frontend still stores conversations in browser localStorage. Server-backed cross-device conversation history is not implemented or verified. Existing guest history must not be treated as authenticated account history.

## Remaining blockers before production
- Conversation history is still browser-local. Implement and test server-backed persistence with every read/write constrained by the authenticated account ID before claiming cross-device history.
- Add end-to-end tests against a disposable PostgreSQL database for registration, duplicate registration, valid/invalid login, expired/revoked sessions, logout, and database failures.
- Verify cookie behavior, allowed origins, and mutation-origin/CSRF defenses in the actual production frontend/backend deployment. Unit tests alone do not prove browser cookie behavior.
- Verify schema initialization/migrations and dependency-lock reproducibility in a clean environment.
- Email verification and password recovery are not implemented. Do not represent accounts as verified or offer recovery until secure delivery is configured.
- Do not merge or deploy until the above production-critical checks are completed and the live service is verified. Passing CI is necessary but does not establish production readiness.
This is an incomplete authentication implementation on a feature branch, not a production-ready account system. Cross-device conversation history is not implemented.