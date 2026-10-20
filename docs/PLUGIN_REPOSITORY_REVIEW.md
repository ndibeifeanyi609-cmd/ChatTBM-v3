# ChatTBM Plugin Architecture — Repository Review

**Status:** Discovery checkpoint; no runtime implementation authorized  
**Reviewed:** `auth/requireAuth.js`, `auth/chatIdentity.js`, `auth/AuthService.js`, `auth/authRoutes.js`, `server.js`, `routes/chatRoutes.js`, `profile/ProfileBoundary.js`, `profile/ProfileTypes.js`, `profile/ProfilePersistence.js`, plugin contract/design documents.

## Findings

### Existing authentication identity is available

`auth/requireAuth.js` validates a session through `authenticateSession` and attaches the verified account to `req.authUser`. `auth/chatIdentity.js` exposes `authenticatedUserId(req)`, which reads that verified identity. This is the intended source of user identity for a Plugin Boundary; plugin authorization must never trust a body-supplied `userId`.

The authentication service uses PostgreSQL-backed account/session operations. However, the repository's own `docs/AUTHENTICATION_DESIGN.md` labels production security and PostgreSQL end-to-end behavior as not yet verified. Plugin work must not imply those checks are complete.

### Existing Profile is not a plugin-permission store

The inspected Profile types are `identity` and `attribute`; no plugin grant or consent type is present. `profile/ProfilePersistence.js` uses in-process Maps. It does not establish durable settings or permission authority.

Plugin permissions MUST NOT be stored as arbitrary Profile values or treated as durable by relying on ProfilePersistence. Consent and authorization are separate responsibilities from profile attributes.

### Settings/consent ownership remains unresolved

The inspected files establish authentication identity but do not identify an existing canonical settings/preferences service with durable per-user grants, scopes, and revocation. No such owner has been verified in this review.

If further repository discovery finds no suitable canonical owner, propose a dedicated permission-grant contract and persistence owner rather than reusing Profile, Memory, or Conversation.

### Chat route protection needs a mount-level check

`routes/chatRoutes.js` defines the chat handlers but does not attach authentication middleware itself. `server.js` imports `requireAuth`; before plugin invocation is added, verify that both normal and streaming chat route mounts are actually protected by it and that `authenticatedUserId(req)` is used by the controller path. Do not infer route protection merely from the existence of the middleware.

## Recommended next discovery checks

1. Confirm in `server.js` the exact middleware wrapping normal and streaming chat routes.
2. Inspect `controllers/chatController.js` to confirm identity derivation for both routes.
3. Search for any existing durable settings/preferences owner before proposing new permission persistence.
4. Select a web-search provider only after confirming availability, credentials, cost/quota, data handling, and Render configuration.
5. Update the Plugin Contract and Design with verified owners and approved scope before runtime implementation.

## Current decision status

- Built-in allowlisted plugins only: recommended, not approved.
- Static server-owned registry: recommended, not approved.
- Web search as first capability: recommended, not approved.
- Authenticated identity source: `req.authUser` via `requireAuth`; controller/mount integration still needs verification.
- Durable permission/settings owner: unresolved.
- Provider and credential configuration: unresolved.
- Runtime implementation: not started by this review.

This review records findings from the named files only; it is not a claim that the entire repository or deployed service has been exhaustively audited.