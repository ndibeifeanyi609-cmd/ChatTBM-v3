# ChatTBM Plugin Architecture Discovery

Status: Discovery Findings — Design Approval Required

## 1. Purpose

Record the repository discovery for a secure plugin architecture before any
plugin implementation begins. This document is a discovery artifact, not an
approved contract, implementation, or claim that plugins are available.

## 2. Repository Findings

The current roadmap contains a proposed Plugin Architecture section in
`docs/ROADMAP.md` §16. It calls for discovery before implementation and
identifies a Plugin Registry, Plugin Boundary, permission and consent controls,
AI orchestration integration, plugin settings, and future entitlement checks.

The repository paths checked during this discovery did not contain existing
`plugin/PluginRegistry.js`, `plugin/PluginBoundary.js`,
`plugins/PluginRegistry.js`, `plugins/PluginBoundary.js`,
`docs/PLUGIN_DESIGN.md`, or `docs/PLUGIN_CONTRACT.md`. This is a limited
path check, not a claim that no plugin-related references exist anywhere.

## 3. Existing Architectural Constraints

Any future plugin system must remain beneath the canonical Blueprint and
Contract and follow the repository's development workflow.

- Provider execution remains behind the AI Provider Boundary.
- The HTTP controller must not own plugin lifecycle or invoke provider SDKs.
- Plugin output is untrusted input and must be validated before orchestration
  or rendering.
- Provider credentials and third-party secrets remain server-side.
- Each invocation must enforce authenticated user identity and explicit
  permissions; a body-supplied user identifier must not grant authority.
- External actions require clear consent, bounded inputs, timeouts, controlled
  errors, and auditable outcomes where appropriate.
- Plugins must not gain ambient access to arbitrary files, databases, network
  resources, or other plugins.
- Existing non-plugin chat behavior must remain compatible.
- A catalogue entry must not imply that a capability is configured or live.

## 4. Candidate Responsibility Split

These are candidate responsibilities for review, not approved canonical
packages.

### Plugin Registry

Catalogue metadata and plugin availability/lifecycle only. It should not
execute plugins, store provider secrets, or own user consent.

### Plugin Boundary

Validate invocation requests, resolve the registered plugin, enforce the
approved permission decision, apply resource limits, normalize outputs and
failures, and prevent direct bypasses. It should not own provider-specific
SDK execution or user settings.

### Plugin Provider / Adapter

Execute a specific external provider or built-in tool behind a narrow
interface. It must not decide the user's identity or bypass the Plugin
Boundary. Provider credentials are read only on the server.

### Permission and Consent

Resolve user- and plugin-scoped authorization, with explicit consent for
sensitive actions and a revocation path. The exact canonical owner and
persistence contract require further review before implementation.

### AI Orchestration

Choose from only registered, enabled, permitted capabilities. The model's
suggestion to call a tool is not itself user consent or authorization.

### User Settings and Entitlements

Allow users to enable/disable integrations and inspect granted permissions.
Premium checks, if introduced, must use the existing canonical entitlement
authority rather than plugin-specific shadow billing state.

## 5. Initial Capability Evaluation

Evaluate these independently; do not bundle their external APIs or permissions
into a single unrestricted plugin.

1. Image generation: server-side provider adapter, content policy, output
   validation, quota/cost controls, and safe image delivery.
2. Web search: bounded search request, source metadata, provider failure
   handling, and clear distinction between retrieved evidence and instructions.
3. Document tools: explicit file selection, file type/size limits, safe parsing,
   output validation, and no arbitrary filesystem access.

Each capability requires a separate dependency review, credential plan, risk
assessment, and test suite. Do not select vendors or claim availability until
the external API gate and cost/credential requirements are reviewed.

## 6. Decisions Required Before Contract Approval

- Is a plugin a canonical object with lifecycle and persistence, or is a
  smaller registry record sufficient for the first release?
- What is the stable plugin identity and versioning policy?
- Which existing canonical domain owns user consent and plugin settings?
- What permission scopes are supported, and which actions require per-use
  confirmation?
- How are enablement, revocation, deletion, and provider credential rotation
  represented?
- What is the timeout, output-size, rate-limit, and cost-control policy?
- How are streaming tool results, partial failures, retries, and duplicate
  invocation requests handled?
- What is the audit/diagnostic policy without logging secrets or private data?
- Which one capability is the smallest safe first implementation?
- Which existing tests and API contracts must remain unchanged?

## 7. Recommended Sequence

Discovery findings
→ Review candidate responsibility split
→ Approve architectural decisions
→ Update Contract and Blueprint only where justified
→ Finalize package design
→ Implement one narrow capability
→ Unit and integration verification
→ Failure/security testing
→ Documentation and checkpoint
→ Commit, push, and repository confirmation

No plugin implementation should begin until the open decisions affecting
identity, ownership, permissions, and lifecycle are resolved.

## 8. Current Status

Discovery artifact recorded. No plugin runtime, external provider, UI setting,
credential, or capability was implemented by this discovery step.
