# ChatTBM Authentication and Account Ownership Design

Status: Proposed design — not implemented or security-verified.

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

## Current blockers
- Chat currently accepts a client-supplied userId, which is not authentication.
- The frontend defaults to guest and stores history in localStorage.
- Canonical ConversationBoundary is not integrated with the live chat UI.
- package-lock.json is out of sync with package.json and must be regenerated using the supported Node/npm toolchain and verified in CI.
- No account/session implementation, email-delivery configuration, or automated auth tests have been verified.

This is a design checkpoint only. Authentication and cross-device history are not implemented.