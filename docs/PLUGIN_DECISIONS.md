# ChatTBM Plugin Architecture — Decision Record

**Status:** Approved architecture direction; implementation remains gated by unresolved provider, access-policy, and schema-application decisions  
**Related:** `docs/PLUGIN_DISCOVERY.md`, `docs/PLUGIN_CONTRACT.md`, `docs/PLUGIN_DESIGN.md`

The user approved the recommended architecture direction on 2026-10-20. This approval records the decisions below; it does not authorize implementation of unresolved details or claim that any plugin is available.

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

## Approved architecture direction

- First capability: web search.
- V1 plugin source: built-in, server-allowlisted plugins only; no third-party code loading.
- Registry: static server-side catalogue; no separate registry database for v1.
- Permissions: a dedicated PostgreSQL-backed permission domain, separate from Profile, Memory, Conversation, and subscription entitlements.
- Security baseline: authenticated server-derived account identity, explicit plugin-scoped permissions, default deny, revocation, server-side secrets, bounded execution, safe logging, and independent tests.
- Implementation remains blocked until the schema-application strategy is resolved and tested, the provider/configuration is selected, the access/entitlement policy is decided, and contract/design/test details are reconciled.

## Minimum v1 scope

- A server-owned registry of built-in plugin descriptors.
- One Plugin Boundary that validates the request and normalizes results and errors.
- One provider-neutral adapter interface.
- Authenticated identity and explicit permission checks owned by the approved canonical service.
- Finite timeouts, payload limits, secret-safe logging, and independent tests.
- One capability only: web search, with structured source URLs/titles where available.
- No third-party plugin code loading, document uploads, new database, or payment-provider integration in the initial core.

## Remaining implementation gates

- [ ] Schema application: **recommended direction** is one numbered-SQL migration runner with a PostgreSQL migration ledger, invoked explicitly during startup before services depend on the new schema. Keep `initializeDatabase()` responsible for connection and legacy bootstrap compatibility; ensure existing numbered migrations are reconciled before enabling the runner. Verify clean-database, already-initialized-database, repeat-startup, migration-failure, CI, and Render behavior before approval.
- [ ] Grant record details: finalize current-state schema, uniqueness/re-grant behavior, and whether separate audit history is required.
- [ ] First provider: confirm credentials, costs/quotas, data handling, timeout behavior, and Render configuration.
- [ ] Access policy: explicitly decide whether web search is available to all authenticated accounts or requires an existing entitlement.
- [ ] Permission scopes and consent UI: define the minimal web-search scope and user-facing grant/revocation flow.
- [ ] Contract, design, and tests: reconcile the approved direction across all documents and approve focused success/failure/security tests.

## Next step

Resolve and verify the proposed single migration-runner strategy before creating a permission table. The runner must not blindly replay old migrations or assume the database is empty. Then finalize provider/configuration and access policy, align the Permission Contract, Plugin Contract, and Design, and implement the web-search core in small independently testable steps. No plugin availability should be claimed until configured end-to-end verification succeeds.