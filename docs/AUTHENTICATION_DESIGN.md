# ChatTBM Authentication and Account Ownership Design

Status: Authentication and account-owned conversation-history implementation on the feature branch — CI passes, but production security and PostgreSQL end-to-end behavior are not yet verified.

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
- Added unit coverage for authentication middleware success, invalid/missing sessions, database-unavailable responses, and session-token extraction. Added authentication service tests for registration validation, normalized email, password-hash storage, generic login failures, session authentication, expiry, and logout revocation. GitHub Actions run #83 passed, including the full Node test suite and lockfile synchronization.
- Added authenticated `GET /api/conversations`, `GET /api/conversations/:conversationId`, and `PUT /api/conversations/:conversationId` endpoints. The server derives ownership from the validated session and scopes every history query/write by that account ID.
- Added the `chattbm_chat_history` PostgreSQL table and migration `database/migrations/002_chat_history.sql`, with a composite account/conversation primary key and account foreign key.
- Added route tests for payload validation, unauthenticated requests, per-account listing, and cross-account read isolation. GitHub Actions run #100 passed the full Node test suite after this change.
- The browser now fetches account history on sign-in/session restoration and queues conversation saves to the server while retaining localStorage as a cache. Existing guest history is not automatically uploaded into an account; only local history already under that account's browser key is eligible for reconciliation.
- Architectural boundary: `chattbm_chat_history` stores the chat transcript separately from the canonical Conversation object. It does not replace or write through `ConversationBoundary`. This is a provisional transcript persistence layer; the transcript's contract/ownership relationship to canonical Conversation and Context must be explicitly reviewed before production approval.

## Remaining blockers before production
- Run end-to-end tests against a disposable PostgreSQL database to verify table initialization, real authenticated history saves/reads, and persistence across separate browser sessions/devices.
- Verify sync behavior for offline/failed saves and local/server conflict resolution; CI unit tests do not prove cross-device behavior in a deployed environment.
- Resolve the architectural contract for transcript persistence: explicitly approve a separate transcript domain or integrate it through the appropriate canonical boundary before treating the feature as production-ready.
- Add end-to-end tests against a disposable PostgreSQL database for registration, duplicate registration, valid/invalid login, expired/revoked sessions, logout, and database failures.
- Verify cookie behavior, allowed origins, and mutation-origin/CSRF defenses in the actual production frontend/backend deployment. Unit tests alone do not prove browser cookie behavior.
- Verify schema initialization/migrations and dependency-lock reproducibility in a clean environment.
- Email verification and password recovery are not implemented. Do not represent accounts as verified or offer recovery until secure delivery is configured.
- Do not merge or deploy until the above production-critical checks are completed and the live service is verified. Passing CI is necessary but does not establish production readiness.
This is an incomplete authentication implementation on a feature branch, not a production-ready account system. Cross-device conversation history is not implemented.