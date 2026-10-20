# ChatTBM Plugin Permission Contract

**Status:** Proposed — architectural approval required  
**Purpose:** Define user-granted plugin permissions without reusing Profile, Memory, Conversation, or payment entitlements as shadow permission stores.

## 1. Authority and identity

- The authenticated account ID MUST come from the server-verified session via `req.authUser` / `authenticatedUserId(req)`; never trust a request-body user ID.
- The permission service is the sole authority for checking and revoking plugin grants.
- Plugin IDs and permission scopes MUST be declared by the server-owned plugin catalogue. Clients and model-generated tool proposals cannot invent scopes.
- A plugin grant is separate from plugin availability, account authentication, and subscription entitlement. A successful check in one category does not replace the others.

## 2. Proposed grant record

A grant record should contain:

- `user_id`: canonical account ID, foreign-keyed to `chattbm_users(id)` with deletion cascading.
- `plugin_id`: stable server-defined plugin identifier.
- `scope`: one declared permission scope, not an arbitrary free-form capability.
- `status`: explicit lifecycle value such as `granted` or `revoked`.
- `granted_at`, `updated_at`, and nullable `revoked_at` timestamps.
- Optional `grant_version` or schema version if later changes require safe migration.

**Proposed uniqueness:** one current record per `(user_id, plugin_id, scope)`, updated transactionally when the user revokes or re-grants access. Historical audit retention should be a separately approved policy, not inferred from this current-state record.

The final schema and whether to retain immutable grant history remain open until approved. Never store provider secrets, session tokens, document contents, or arbitrary JSON permissions in this record.

## 3. Required behavior

- Default deny if the user, plugin, scope, or grant cannot be validated.
- A missing, revoked, malformed, or unavailable grant MUST fail closed.
- Granting one scope MUST NOT imply other scopes or access to all user data.
- Revocation MUST prevent subsequent invocations once the revocation transaction succeeds.
- Permission checks MUST occur server-side on every invocation; a UI toggle is not authorization.
- If permission persistence is unavailable, a plugin requiring a grant MUST NOT execute.
- The boundary MUST verify identity, plugin allowlist/status, required scopes, entitlement if applicable, input limits, and provider configuration before calling an adapter.
- Provider outputs remain untrusted and cannot grant or widen permissions.

## 4. Storage and initialization

The repository has a shared PostgreSQL pool in `database/Postgres.js`, numbered SQL files under `database/migrations`, and core table creation inside `initializeDatabase()`. The reviewed `server.js` startup calls `initializeDatabase()`; it does not visibly invoke a general numbered-migration runner.

Before adding runtime permission storage, the implementation plan MUST choose one consistent schema-application strategy and verify it works in development, CI, and Render. Do not assume a new numbered migration will automatically execute. Any schema change must be additive, repeatable, account-owned, and covered by tests.

## 5. API and settings responsibilities

The future permission boundary should expose narrow operations equivalent to:
- list grants for the authenticated account;
- grant a declared scope after clear user consent;
- revoke a specific grant;
- check required scopes for one invocation.

These are behavioral requirements, not approved endpoint names or authorization to create routes yet. Every operation must derive account ownership from the authenticated principal. A client must not grant consent merely by sending a boolean in a plugin invocation.

Settings UI should explain the plugin, purpose, requested scope, data involved, and revocation effect. Enabling a plugin and granting access to a sensitive scope should remain distinct when the capability requires it.

## 6. Failure and verification requirements

Tests must cover:
- no session, invalid identity, and cross-account access;
- absent, revoked, and unknown scopes;
- duplicate grant/re-grant and concurrent grant/revoke behavior;
- database unavailable or failed transaction (deny execution);
- plugin disabled, unknown plugin, and unknown scope;
- revocation taking effect on the next invocation;
- body-supplied user ID being ignored;
- provider failure after authorization without accidentally changing grant state;
- secret-safe logs and no document/provider payloads in grant records.

Unit tests alone do not prove PostgreSQL or deployed authentication behavior. Before production release, run integration tests against a disposable PostgreSQL database and verify the same behavior in a configured deployment.

## 7. Decisions still requiring approval

1. Approve a dedicated PostgreSQL-backed permission domain, rather than assigning permission ownership to Profile.
2. Approve the proposed current-state grant record and uniqueness/lifecycle model.
3. Decide whether audit history is required and set retention/access rules.
4. Approve the settings surface and user-consent interaction.
5. Confirm schema initialization strategy before adding any runtime table.
6. Decide the first plugin's exact scopes after provider and data-handling review.

Until these decisions are approved, this document is a proposed contract only. It does not authorize runtime implementation or claim plugin permissions exist in the running application.
