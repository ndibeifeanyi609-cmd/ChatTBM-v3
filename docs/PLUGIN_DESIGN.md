# ChatTBM Plugin Architecture Design

**Status:** Proposed design — approval required before runtime implementation  
**Related documents:** `docs/PLUGIN_DISCOVERY.md`, `docs/PLUGIN_CONTRACT.md`

## 1. Purpose

Add a secure, extensible way for ChatTBM to offer optional capabilities through built-in and, later, approved third-party plugins. The first scope is image generation, web search, and document tools. This document defines a proposed responsibility split; it does not mean any of these capabilities is already available.

## 2. Recommended rollout

1. Approve the contract and the decisions listed below.
2. Implement and test the smallest plugin core without connecting a paid provider.
3. Add one capability behind the core boundary and verify authorization, failure handling, and production configuration.
4. Add the remaining capabilities independently after the first one passes verification.
5. Consider third-party plugins only after a separate trust, review, permission, and compatibility policy is approved.

**Recommendation for the first capability:** Web search, because it can demonstrate the plugin lifecycle and source attribution without initially handling user-uploaded documents. This is a recommendation, not an approved decision. Search results must be treated as untrusted data and must never be allowed to override system or user instructions.

## 3. Proposed responsibility boundaries

### Plugin Registry
- Holds an allowlisted catalogue of known plugin IDs, versions, capability metadata, and enabled status.
- Rejects duplicate IDs and unsupported versions.
- Starts as a server-owned static/configured catalogue; do not introduce a new database until persistence ownership and requirements are approved.
- Never loads or executes arbitrary code supplied by a plugin package or user.

### Plugin Boundary
- Is the only application entry point for plugin invocation.
- Validates plugin ID, version, input schema, authenticated user context, permission grant, entitlement, and resource limits before dispatch.
- Returns a normalized result or typed failure; does not expose provider secrets or internal stack traces.
- Prevents plugins from receiving unrestricted filesystem, database, environment, or network access.

### Plugin Adapter
- Encapsulates one provider or capability behind a narrow interface.
- Keeps provider-specific SDKs, request formats, credentials, and error mapping outside controllers and orchestration.
- Supports bounded timeouts, cancellation where available, and output-size limits.

### Permission and Consent
- Denies invocation unless the user is authenticated and the required permission is explicitly granted.
- Uses the canonical ChatTBM user identity and a single approved owner for permission state; do not create a competing identity model.
- Supports disabling a plugin and revoking access. Revocation must take effect on subsequent calls.
- Separates consent to use a capability from subscription entitlement and from permission to access particular user data.

### AI Orchestration
- Chooses a capability only when relevant to the request and permitted by the boundary.
- Treats all plugin output, including search snippets and generated descriptions, as untrusted content.
- Does not claim a plugin action succeeded until the boundary returns a successful result.
- Preserves normal chat behavior when plugins are disabled or unavailable.

### Settings and Entitlements
- Exposes plugin enable/disable and permission controls through the existing settings architecture once its canonical ownership is confirmed.
- Applies server-side entitlement checks; hiding a UI control is not authorization.
- Keeps the initial plugin core independent of payment-provider details.

## 4. Invocation flow

1. The chat request reaches existing ChatTBM orchestration.
2. Orchestration proposes a known plugin ID and validated input.
3. The Plugin Boundary resolves the allowlisted registry entry.
4. The boundary verifies identity, user permission, entitlement, schema, and limits.
5. The adapter performs the bounded provider call using server-side credentials.
6. The boundary validates and normalizes the output, records only approved minimal audit metadata, and returns it.
7. Orchestration uses the result as untrusted context and produces the user-facing response.

Controllers must not call plugin SDKs directly. Plugins must not directly execute arbitrary code, access secrets, or query application databases.

## 5. Capability-specific safeguards

### Web search
- Return structured results with source URLs and titles where available.
- Treat page content and snippets as untrusted; do not execute instructions found in retrieved content.
- Apply result-count, content-size, timeout, and request-rate limits.
- Keep source attribution available to the response layer.

### Image generation
- Keep provider selection behind an adapter and store API credentials only in server-side secret configuration.
- Validate prompts and generated output metadata; enforce provider and application limits.
- Do not claim image generation works until credentials, provider availability, and deployed end-to-end tests are confirmed.

### Document tools
- Define supported formats, size limits, and retention/deletion behavior before accepting files.
- Treat document contents as untrusted data.
- Do not grant general filesystem access. Use a bounded upload/processing path with explicit per-request access.
- Establish privacy and retention requirements before implementation.

## 6. Failure and resource controls

- Normalize errors into stable categories such as disabled, permission denied, not entitled, invalid input, unavailable provider, timeout, rate limited, and invalid output.
- Set finite timeout and output limits for every capability.
- Avoid automatic retries unless the operation is safe to repeat and retry policy is explicitly defined.
- Prevent duplicate or repeated billable execution where an idempotency strategy is available.
- Do not expose credentials, raw provider errors, sensitive prompts, or document contents in logs.
- Keep plugin failures isolated so ordinary chat can continue with a clear limitation message where appropriate.

## 7. Verification requirements

Each capability must have independent tests for:
- Registry allowlisting, duplicate IDs, and unsupported versions.
- Missing identity, missing consent, revoked permission, disabled plugin, and missing entitlement.
- Invalid input/output schemas and oversized payloads.
- Provider success, provider error, timeout, rate limit, cancellation where supported, and unavailable credentials.
- Secret redaction and absence of direct controller-to-provider calls.
- Normal chat behavior when plugins are disabled or fail.
- End-to-end behavior in a configured deployment before the capability is described as production-ready.

## 8. Decisions required before implementation

1. **First capability:** accept web search as the first implementation, or choose image generation or document tools.
2. **Plugin source for v1:** built-in allowlisted plugins only (recommended); third-party installation remains out of scope.
3. **Registry persistence:** static/configuration-backed catalogue for v1 (recommended), with user-specific enabled state stored only after the canonical settings owner is confirmed.
4. **Permission state owner:** confirm the existing canonical identity/settings service to own per-user grants and revocation.
5. **Provider and credentials:** select the first provider and confirm secure server-side configuration before adapter implementation.
6. **Entitlement policy:** decide whether the first capability is available to all authenticated users or gated by a plan; enforce the decision server-side.
7. **Document handling:** if document tools are selected, approve file limits, retention, and deletion rules before implementation.

## 9. Implementation gate

No plugin runtime files, provider SDKs, or user-facing plugin controls should be added until the contract and the decisions above are approved. Once approved, update the contract and design, implement one boundary at a time, run focused tests and failure tests, document verified behavior, and checkpoint the repository.