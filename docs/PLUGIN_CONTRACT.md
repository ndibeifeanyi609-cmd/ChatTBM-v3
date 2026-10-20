# ChatTBM Plugin Contract

Status: Proposed — Architectural Approval Required

## 1. Purpose and Scope

Define the minimum behavioral requirements for a secure, extensible plugin
system. This document is proposed contract text for review; it does not
authorize implementation or claim that plugin capabilities are available.
The ChatTBM Blueprint and existing canonical domain contracts remain superior.

The first release should implement one narrowly scoped capability only after
the responsibility, identity, permission, and persistence decisions below are
approved. Image generation, web search, and document tools remain independent
candidate capabilities.

## 2. Core Terms

- Plugin: a named, versioned capability made available through the approved
  registry and invoked only through the approved boundary.
- Plugin Registry: the authority for registered plugin metadata and enabled
  implementation versions; it does not execute plugins or store provider keys.
- Plugin Boundary: the sole application entry point for validating and
  authorizing plugin invocation and normalizing outcomes.
- Adapter: the narrow provider-specific or built-in implementation behind the
  boundary.
- Permission grant: a user-scoped, plugin-scoped authorization with explicit
  scope and revocation behavior.
- Invocation: one bounded request to a registered plugin.

These terms remain subject to final architecture review.

## 3. Identity and Versioning

Each plugin MUST have a stable, unique plugin ID independent of display name,
provider, or user. Each release MUST declare a version and supported input and
output schema version. An update MUST NOT silently change the meaning of an
existing plugin ID or permission scope.

The registry MUST reject duplicate IDs and invalid metadata. A plugin version
that is unavailable or disabled MUST fail with a normalized error; the system
MUST NOT silently substitute a different plugin.

Whether plugin metadata needs canonical persistence and a full lifecycle is
an open architecture decision. Do not implement a persistent registry until
that decision is approved.

## 4. Registry Responsibility

The registry MUST:
- expose only registered plugin metadata and declared capabilities;
- validate required metadata and reject conflicting identities;
- distinguish registered, enabled, disabled, and unavailable states;
- avoid executing plugins, making authorization decisions, or storing secrets;
- avoid claiming a capability is usable unless its adapter is configured and
  its required permissions and entitlement checks can be satisfied.

The exact state model and persistence authority require design approval.

## 5. Invocation Boundary

All invocations MUST pass through the Plugin Boundary. It MUST:
- validate the authenticated principal, plugin ID/version, input schema, and
  request limits;
- resolve the registered and enabled plugin;
- check user-scoped permissions and required consent before execution;
- enforce timeouts, input/output size limits, and bounded concurrency;
- normalize adapter errors and malformed results;
- prevent a plugin from bypassing authorization by calling another plugin,
  reading arbitrary files, accessing arbitrary databases, or making unrestricted
  network requests;
- return only validated, documented output fields.

A model-generated tool request is an untrusted proposal, not authorization.
A body-supplied user ID MUST NOT override authenticated identity. Existing
non-plugin chat requests MUST retain their current behavior.

## 6. Permission and Consent

Permissions MUST be explicit, scoped to the user and plugin, understandable to
the user, and revocable. The system MUST deny by default when a grant is absent,
expired, invalid, or cannot be checked.

Sensitive or externally consequential actions MUST obtain clear confirmation
before execution. Enabling a plugin MUST NOT automatically grant every
possible permission. The UI MUST identify the plugin, purpose, requested data,
and relevant action before asking for consent.

Revocation MUST prevent subsequent invocations under the revoked grant.
The canonical owner and persistence contract for grants are unresolved and
MUST be approved before implementation.

## 7. Secrets and External APIs

Provider credentials MUST remain server-side in approved secret configuration.
They MUST NOT be sent to the browser, included in plugin metadata, returned in
errors, or written to logs. External APIs MUST pass the existing Blueprint
External API Principle and approved dependency/security review.

Each adapter MUST have a documented credential requirement, cost/quota model,
timeout, retry policy, data handling description, and controlled failure
behavior. An unconfigured provider MUST fail clearly and safely; it MUST NOT
pretend to perform the requested action.

## 8. Adapter Input and Output

Each adapter MUST declare an input schema and a bounded output schema. Inputs
and outputs MUST be validated at the boundary. Empty, oversized, malformed,
unexpected, or unsafe outputs MUST be rejected or normalized into a controlled
failure. Provider responses and retrieved content MUST be treated as untrusted
data, never as instructions that can change system policy or permissions.

Adapters MUST NOT own user identity, consent, entitlements, canonical chat
state, or plugin registry identity.

## 9. AI Orchestration

AI orchestration MAY select only registered, enabled plugins for which the
current user has the required permission and any required entitlement.
Orchestration MUST NOT invoke adapters directly.

The user's request to use a tool does not waive required consent or safety
checks. Tool output MUST be returned to the model as untrusted result data.
Tool failures MUST be distinguishable from a successful empty result.

## 10. Settings and Entitlements

Users SHOULD be able to view enabled plugins, requested permissions, and
revoke grants. Settings MUST use the approved canonical owner rather than
creating shadow user identity or consent state.

If premium access is later required, the plugin system MUST consult the
existing canonical entitlement authority. It MUST NOT create its own payment,
subscription, or entitlement lifecycle.

## 11. Failure, Cancellation, and Resource Limits

The contract and design MUST define behavior for:
- missing or invalid permission;
- disabled or unconfigured plugin;
- malformed request and malformed adapter result;
- provider timeout, rate limit, and service outage;
- cancellation or client disconnect;
- duplicate invocation and retry;
- output truncation or resource-limit violation;
- failure after partial streamed output;
- persistence or audit failure where applicable.

Failures MUST be normalized, safe to display, and must not expose stack traces,
secrets, prompts, or private provider payloads. Limits MUST prevent unbounded
work or cost.

## 12. Audit and Privacy

Operational diagnostics SHOULD record plugin ID/version, outcome category,
duration, and a correlation ID where appropriate. Logs MUST exclude provider
secrets, authentication tokens, full private document contents, and
unnecessary personal data. Retention and access controls require design review.

## 13. Initial Capability Requirements

Each candidate MUST be independently designed and tested:

### Image Generation
Validate prompt and options, enforce content and cost controls, validate the
provider result, and deliver generated media without exposing provider keys.

### Web Search
Bound query and result counts, validate source metadata, handle provider
failure, and keep retrieved page content separate from trusted instructions.

### Document Tools
Require explicit user-selected input, enforce file type and size limits, parse
safely, validate output, and prohibit arbitrary filesystem access.

No capability is approved or available solely because it appears here.

## 14. Required Verification

Before release, tests MUST cover:
- stable identity, duplicate ID, and version conflict;
- unauthenticated request and cross-user permission denial;
- absent, expired, and revoked grants;
- disabled and unconfigured plugin;
- malformed and oversized inputs/outputs;
- provider failure, timeout, rate limit, and cancellation;
- duplicate invocation and retry semantics;
- secret redaction and safe error normalization;
- orchestration refusing direct adapter bypass;
- legacy chat regression behavior;
- each adapter's own success and failure cases;
- entitlement denial if a premium gate is introduced.

Mock tests prove boundary behavior only. External capability MUST NOT be
claimed live until configuration and a real end-to-end test succeed.

## 15. Open Decisions Blocking Implementation

Approval is still required for:
1. Whether registry metadata is canonical persistent state or a simpler
   configuration catalogue for the first release.
2. The canonical owner and persistence contract for user permissions,
   consent, and plugin settings.
3. The exact plugin lifecycle and version compatibility rules.
4. Permission scopes and which operations require per-invocation confirmation.
5. Invocation idempotency, retry, cancellation, and partial-stream behavior.
6. Audit retention and privacy policy.
7. The first capability to implement, including vendor, credentials, cost,
   data handling, and deployment requirements.

## 16. Change Sequence

Discovery
→ Review and approve this proposed contract
→ Resolve open decisions
→ Package design
→ Implementation
→ Verification
→ Failure/security testing
→ Documentation
→ Checkpoint
→ Commit and push
→ Repository confirmation

No plugin runtime implementation is authorized by this proposed contract
until the blocking decisions are approved.
