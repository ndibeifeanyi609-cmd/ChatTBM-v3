# ChatTBM Plugin Architecture — Decision Record

**Status:** Approved architecture direction; Brave Search API is the proposed first provider, pending account, pricing, key, and data-handling verification  
**Related:** `docs/PLUGIN_DISCOVERY.md`, `docs/PLUGIN_CONTRACT.md`, `docs/PLUGIN_DESIGN.md`

The user approved the recommended architecture direction on 2026-10-20. This approval records the decisions below; it does not authorize implementation of unresolved details or claim that any plugin is available.

## Recommended defaults

| Decision | Recommendation | Reason |
| --- | --- | --- |
| First capability | Web search | Demonstrates the invocation boundary and source attribution without starting with uploaded-file handling. |
| Plugin source in v1 | Built-in, allowlisted plugins only | Avoids arbitrary third-party code and marketplace trust risks. |
| Registry | Static server-side catalogue | Avoids a new database and competing registry authority in the first version. |
| User grants/settings | Use existing canonical user identity and settings owner after repository verification | Avoids duplicate identity or permission state. |
| Provider | **Proposed: Brave Search API**, subject to account, pricing, key, data-handling, and production configuration verification | Gives ChatTBM structured web results behind a replaceable adapter; does not assume an account or key already exists. |
| Access policy | Web search v1 is available to all authenticated accounts; enforce server-side per-account usage limits and bounded request/result sizes | No premium entitlement gate in v1; cost protection remains mandatory. |
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

## Verified schema-application findings

- `database/Postgres.js` creates `chattbm_chat_history` and `chattbm_contexts` directly during `initializeDatabase()`.
- `database/migrations/002_chat_history.sql` and `003_context_records.sql` also create those tables with repeatable `IF NOT EXISTS` statements.
- The reviewed `server.js` calls `initializeDatabase()` during startup; no general migration runner or migration ledger was confirmed in that file.
- The existing PostgreSQL integration workflow provisions a disposable PostgreSQL 16 service and runs persistence tests, but its current path filters do not include the proposed plugin documents or migration infrastructure.
- A migration runner cannot simply replay existing numbered files: migration 002 and 003 depend on `chattbm_users`, which is currently created by the bootstrap in `database/Postgres.js`; migration 001 was not found at the expected path.
- Therefore, the safe next step is a read-only inventory of all migration files and their dependencies, followed by a migration-ledger/backfill design that explicitly preserves existing Render databases. Do not add a plugin permission table or enable a runner until the legacy schema baseline is identified and tested.

## Remaining implementation gates

- [ ] Schema application: **recommended direction** is one numbered-SQL migration runner with a PostgreSQL migration ledger, invoked explicitly during startup before services depend on the new schema. Keep `initializeDatabase()` responsible for connection and legacy bootstrap compatibility; ensure existing numbered migrations are reconciled before enabling the runner. Verify clean-database, already-initialized-database, repeat-startup, migration-failure, CI, and Render behavior before approval.
- [ ] Grant record details: finalize current-state schema, uniqueness/re-grant behavior, and whether separate audit history is required.
- [ ] Brave Search API: verify account activation, current plan/credit and usage limits, key creation, query-data handling terms, timeout behavior, and secure Render secret configuration. Keep `BRAVE_API_KEY` server-side only.
- [x] Access policy: all authenticated accounts may use web search v1, subject to server-side per-account usage limits and request/result bounds; no premium entitlement gate in v1.
- [ ] Permission scopes and consent UI: define the minimal web-search scope and user-facing grant/revocation flow.
- [ ] Contract, design, and tests: reconcile the approved direction across all documents and approve focused success/failure/security tests.

## Next step

Resolve and verify the proposed single migration-runner strategy before creating a permission table. The runner must not blindly replay old migrations or assume the database is empty. Then verify Brave account/configuration and access policy, align the Permission Contract, Plugin Contract, and Design, and implement the web-search core in small independently testable steps. Provider stays unconfigured until the user separately approves account/billing setup and a server-side key is safely configured. No plugin availability should be claimed until configured end-to-end verification succeeds.