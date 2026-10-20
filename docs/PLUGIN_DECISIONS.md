# ChatTBM Plugin Architecture — Decision Proposal

**Status:** Proposed defaults for review; not approved implementation authority  
**Related:** `docs/PLUGIN_DISCOVERY.md`, `docs/PLUGIN_CONTRACT.md`, `docs/PLUGIN_DESIGN.md`

This record turns the open architecture questions into a small, reviewable set of recommendations. These are not decisions made on the user's behalf and do not authorize runtime implementation.

## Recommended defaults

| Decision | Recommendation | Reason |
| --- | --- | --- |
| First capability | Web search | Demonstrates the invocation boundary and source attribution without starting with uploaded-file handling. |
| Plugin source in v1 | Built-in, allowlisted plugins only | Avoids arbitrary third-party code and marketplace trust risks. |
| Registry | Static server-side catalogue | Avoids a new database and competing registry authority in the first version. |
| User grants/settings | Use existing canonical user identity and settings owner after repository verification | Avoids duplicate identity or permission state. |
| Provider | Select only after checking available credentials, cost, terms, and production compatibility | Prevents committing to an unavailable or unconfigured service. |
| Entitlement | Keep entitlement enforcement in the server boundary; begin with the narrowest explicitly approved access policy | UI visibility alone is not authorization; paid access must not be assumed. |
| Third-party installs | Out of scope for v1 | Requires a separate trust, review, versioning, permission, and isolation model. |
| Documents | Defer until upload limits, supported formats, privacy, retention, and deletion are defined | Documents introduce additional sensitive-data and storage obligations. |
| Image generation | Add as a separate adapter after the plugin core passes tests | Keeps image provider setup and costs isolated from the core architecture. |

## Minimum v1 scope if approved

- A server-owned registry of built-in plugin descriptors.
- One Plugin Boundary that validates the request and normalizes results and errors.
- One provider-neutral adapter interface.
- Authenticated identity and explicit permission checks owned by the approved canonical service.
- Finite timeouts, payload limits, secret-safe logging, and independent tests.
- One capability only: web search, with structured source URLs/titles where available.
- No third-party plugin code loading, document uploads, new database, or payment-provider integration in the initial core.

## Final approval checklist

The following items must be explicitly resolved before runtime implementation:

- [ ] First capability: web search, image generation, or document tools.
- [ ] V1 distribution: built-in allowlisted plugins only; no third-party code loading.
- [ ] Registry: static server-side catalogue, with no new registry database for v1.
- [ ] Permission authority: approve a dedicated PostgreSQL-backed permission domain or identify an existing canonical owner. The current Profile store is not suitable.
- [ ] Schema application: choose and verify a repeatable strategy compatible with both `database/Postgres.js` initialization and numbered SQL migrations.
- [ ] Grant lifecycle: approve plugin-scoped permissions, explicit scopes, default-deny, and revocation behavior.
- [ ] First provider: confirm credentials, costs/quotas, data handling, timeout behavior, and Render configuration.
- [ ] Access policy: explicitly decide whether the first capability is available to all authenticated accounts or requires an existing entitlement.
- [ ] Contract, design, and tests: reconcile all three documents and approve focused success/failure/security tests.

## Approval gate

Before implementation, confirm:
1. The first capability is web search.
2. Built-in plugins only for v1.
3. Static server-side registry for v1.
4. Existing canonical identity/settings owner will own user grants (must be verified against repository implementation before wiring).
5. Provider selection and entitlement policy remain blocked until configuration and product decisions are confirmed.

After approval, reconcile these decisions with the Plugin Contract and Design, then implement only the approved minimum scope. Until then, all plugin documents remain proposals and no plugin availability should be claimed.