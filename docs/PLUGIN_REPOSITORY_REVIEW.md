# ChatTBM Plugin Architecture — Repository Review

**Status:** Discovery checkpoint; no runtime implementation authorized  
**Reviewed:** `auth/requireAuth.js`, `auth/chatIdentity.js`, `auth/AuthService.js`, `auth/authRoutes.js`, `server.js`, `routes/chatRoutes.js`, `controllers/chatController.js`, `profile/ProfileBoundary.js`, `profile/ProfileTypes.js`, `profile/ProfilePersistence.js`, plugin contract/design documents.

## Findings

### Existing authentication and chat protection are confirmed in code

- `auth/requireAuth.js` validates a session through `authenticateSession` and attaches the verified account to `req.authUser`.
- `auth/chatIdentity.js` exposes `authenticatedUserId(req)`, which reads the verified account ID.
- `server.js` mounts `requireAuth` before `routes/chatRoutes.js` at `/api/chat`. Both normal `POST /api/chat` and streaming `POST /api/chat/stream` are therefore covered by the same mount-level middleware.
- `controllers/chatController.js` independently calls `authenticatedUserId(req)` in both handlers and passes that identity to the Chat Interaction Boundary after spreading request body data. The verified `userId` overrides any body-supplied value.

This gives the future Plugin Boundary a clear identity source: use the verified principal from `req.authUser` / `authenticatedUserId(req)`, never a body-supplied user ID. These code findings do not replace production authentication/security testing.

The repository's `docs/AUTHENTICATION_DESIGN.md` notes that production security and PostgreSQL end-to-end behavior have not yet been fully verified. Plugin work must not imply those checks are complete.

### Existing Profile is not a plugin-permission store

The inspected Profile types are `identity` and `attribute`; no plugin grant or consent type is present. `profile/ProfilePersistence.js` uses in-process Maps. It does not establish durable settings or permission authority.

Plugin permissions MUST NOT be stored as arbitrary Profile values or treated as durable by relying on ProfilePersistence. Consent and authorization are separate responsibilities from profile attributes.

### Settings/consent ownership remains unresolved

The inspected files establish authenticated identity but do not identify a canonical settings/preferences service with durable per-user grants, scopes, and revocation. Repository searches performed for settings/preferences and permission grants did not return an applicable canonical owner; this is not proof that no related implementation exists anywhere in the repository.

If further focused discovery confirms no suitable canonical owner, propose a dedicated permission-grant contract and persistence owner rather than reusing Profile, Memory, or Conversation.

## Recommended next discovery checks

1. Inspect database migration and persistence conventions before proposing durable permission-grant storage.
2. Decide whether permission grants are a dedicated canonical domain or belong to an existing verified settings owner.
3. Define grant identity, scope, enabled/revoked lifecycle, versioning, ownership checks, and failure behavior in a contract before implementation.
4. Select a web-search provider only after confirming availability, credentials, cost/quota, data handling, and Render configuration.
5. Update the Plugin Contract and Design with verified owners and approved scope before runtime implementation.

## Current decision status

- Chat authentication middleware: verified at the route mount in `server.js`.
- Authenticated identity source: `req.authUser` through `authenticatedUserId(req)`; body-supplied identity is overridden.
- Built-in allowlisted plugins only: recommended, not approved.
- Static server-owned registry: recommended, not approved.
- Web search as first capability: recommended, not approved.
- Durable permission/settings owner: unresolved.
- Provider and credential configuration: unresolved.
- Runtime implementation: not started by this review.

This review records findings from the named files and focused searches; it is not a claim that the entire repository or deployed service has been exhaustively audited.