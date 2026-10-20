# ChatTBM Plugin Architecture — Repository Review

**Status:** Discovery checkpoint; no runtime implementation authorized  
**Reviewed:** `profile/ProfileBoundary.js`, `profile/ProfileTypes.js`, `profile/ProfilePersistence.js`, `docs/PLUGIN_CONTRACT.md`, `docs/PLUGIN_DESIGN.md`, `docs/ROADMAP.md`

## Findings

### Canonical Profile is not a plugin-permission store

The existing Profile domain validates profile ownership and provides canonical profile operations. Its current types are `identity` and `attribute`; there is no plugin-grant or consent type in the inspected type file. Profile state in `profile/ProfilePersistence.js` is backed by in-process Maps. The inspected code does not establish a durable settings or permission authority.

Therefore, plugin permissions MUST NOT be stored as arbitrary Profile values or assumed durable by using ProfilePersistence. Doing so would conflate profile/identity state with authorization and would give a false impression of durable revocation.

### Authentication must be traced before integration

The Plugin Boundary must use the authenticated principal established by the existing request/authentication path. It must not trust a user ID supplied only in the request body. The current inspection did not establish the full authentication principal contract or identify a canonical settings/consent owner, so that integration point remains unresolved.

### No plugin runtime should be added yet

The current review supports a provider-neutral design and static allowlist recommendation, but it does not prove which existing module owns authenticated identity in all routes, how durable per-user consent should be stored, or how settings are represented in production. Those questions must be resolved before implementing permission persistence or user-facing plugin controls.

## Recommended next discovery checks

1. Trace the existing authentication middleware and the principal it exposes to `POST /api/chat`.
2. Check whether a canonical settings/preferences package exists and whether it has durable persistence and ownership enforcement.
3. If no suitable settings/consent authority exists, propose a dedicated permission-grant contract and persistence owner rather than reusing Profile, Memory, or Conversation.
4. Select a web-search provider only after confirming provider availability, credentials, cost/quota, data handling, and Render configuration.
5. Update the Plugin Contract and Design with verified owners and the approved first capability before runtime implementation.

## Current decision status

- Built-in allowlisted plugins only: recommended, not approved.
- Static server-owned registry: recommended, not approved.
- Web search as first capability: recommended, not approved.
- Permission/settings owner: unresolved.
- Provider and credential configuration: unresolved.
- Runtime implementation: not started by this review.

This review records only the findings from the named files; it is not a claim that the entire repository or deployed service has been exhaustively audited.