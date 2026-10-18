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
- Added a PostgreSQL account/session schema and database initialization for `chattbm_users` and `chattbm_auth_sessions`.
- Added an account service for registration, login, session validation, and revocation in `auth/AuthService.js`.
- Added registration, login, current-session, and logout handlers in `auth/authRoutes.js`, and mounted the routes in `server.js`.
- Added cookie parsing and restricted CORS to configured frontend origins. Production cross-site cookies require HTTPS and `SameSite=None`; browser credentialed requests and CSRF protections still require end-to-end verification.
- Added unit tests for crypto primitives and invalid registration inputs. GitHub Actions has not yet confirmed a successful run for the latest feature-branch changes; a pull-request run is currently marked `action_required`.

## Remaining blockers before production
- Chat still accepts a client-supplied `userId`; account sessions do not yet authorize chat requests or derive ownership from the authenticated session.
- The frontend defaults to guest and stores conversation history in localStorage. Canonical ConversationBoundary is not integrated with the live chat UI.
- Add rate limiting, CSRF protection for cookie-authenticated state changes, and tests for duplicate registration, invalid credentials, expired/revoked sessions, database errors, and cross-user access.
- Verify package-lock synchronization and all tests in a clean CI run.
- Email verification and password recovery are not implemented. Do not represent accounts as verified or provide recovery until secure delivery is configured.
- Do not deploy or merge this work until CI passes and protected chat/conversation routes enforce the authenticated account identity.

This is an incomplete authentication implementation on a feature branch, not a production-ready account system. Cross-device conversation history is not implemented.