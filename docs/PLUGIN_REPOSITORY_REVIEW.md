# ChatTBM Plugin Architecture — Repository Review

**Status:** Discovery checkpoint; no runtime implementation authorized  
**Reviewed:** `auth/requireAuth.js`, `auth/chatIdentity.js`, `auth/AuthService.js`, `auth/authRoutes.js`, `server.js`, `routes/chatRoutes.js`, `controllers/chatController.js`, `database/Postgres.js`, `database/migrations/002_chat_history.sql`, `database/migrations/003_context_records.sql`, Profile files, and plugin contract/design documents.

## Findings

### Existing authentication and chat protection are confirmed in code

- `auth/requireAuth.js` validates a session through `authenticateSession` and attaches the verified account to `req.authUser`.
- `auth/chatIdentity.js` exposes `authenticatedUserId(req)`, which reads the verified account ID.
- `server.js` mounts `requireAuth` before `routes/chatRoutes.js` at `/api/chat`. Both normal `POST /api/chat` and streaming `POST /api/chat/stream` are therefore covered by the same mount-level middleware.
- `controllers/chatController.js` calls `authenticatedUserId(req)` in both handlers and passes that identity to the Chat Interaction Boundary after spreading request body data. The verified `userId` overrides any body-supplied value.

This gives a future Plugin Boundary a clear identity source: use the verified principal from `req.authUser` / `authenticatedUserId(req)`, never a body-supplied user ID. These code findings do not replace production authentication/security testing.

The repository's `docs/AUTHENTICATION_DESIGN.md` notes that production security and PostgreSQL end-to-end behavior have not yet been fully verified. Plugin work must not imply those checks are complete.

### Existing database conventions

- `database/Postgres.js` uses the shared `pg` pool from `DATABASE_URL` and initializes core tables with repeatable `CREATE TABLE IF NOT EXISTS` statements.
- Numbered SQL files exist under `database/migrations`, including `002_chat_history.sql` and `003_context_records.sql`. These migrations use additive, repeatable table/index creation and account foreign keys where appropriate.
- The inspected code does not establish a single migration runner or migration ledger that applies every numbered SQL file. Core schema is also created directly in `initializeDatabase()`. This means a future permission schema must not assume that merely adding a numbered SQL file guarantees it will be applied in every environment.

**Recommended storage direction, pending contract approval:** a dedicated plugin-permission domain backed by PostgreSQL is a better fit than Profile or Memory. Before implementation, explicitly decide how its schema is initialized consistently with the current bootstrap/migration arrangement, with user ownership enforced by a foreign key and database uniqueness constraints.

### Existing Profile is not a plugin-permission store

The inspected Profile types are `identity` and `attribute`; no plugin grant or consent type is present. `profile/ProfilePersistence.js` uses in-process Maps. It does not establish durable settings or permission authority.

Plugin permissions MUST NOT be stored as arbitrary Profile values or treated as durable by relying on ProfilePersistence. Consent and authorization are separate responsibilities from profile attributes.

### Settings/consent ownership remains unresolved

The inspected files establish authenticated identity but do not identify a canonical settings/preferences service with durable per-user grants, scopes, and revocation. No applicable canonical owner was found in the focused searches; this is not proof that no related implementation exists anywhere in the repository.

If no suitable canonical owner is confirmed, propose a dedicated permission-grant contract and persistence owner rather than reusing Profile, Memory, or Conversation.

## Recommended next discovery checks

1. Resolve the schema application strategy: reconcile numbered migrations with `database/Postgres.js` initialization before adding a table.
2. Define a permission-grant contract: user ownership, stable plugin ID, granted scopes, enabled/revoked lifecycle, timestamps/versioning, and failure behavior.
3. Decide where the canonical consent/permission boundary belongs and how settings UI reads/writes it.
4. Select a web-search provider only after confirming availability, credentials, cost/quota, data handling, and Render configuration.
5. Update the Plugin Contract and Design with verified owners and approved scope before runtime implementation.

## Current decision status

- Chat authentication middleware: verified at the route mount in `server.js`.
- Authenticated identity source: `req.authUser` through `authenticatedUserId(req)`; body-supplied identity is overridden.
- PostgreSQL pool: `database/Postgres.js`; repeatable numbered migrations exist, but a unified migration runner was not confirmed in this review.
- Durable plugin permission/settings owner: unresolved.
- Built-in allowlisted plugins only: recommended, not approved.
- Static server-owned registry: recommended, not approved.
- Web search as first capability: recommended, not approved.
- Provider and credential configuration: unresolved.
- Runtime implementation: not started by this review.

This review records findings from the named files and focused searches; it is not a claim that the entire repository or deployed service has been exhaustively audited.