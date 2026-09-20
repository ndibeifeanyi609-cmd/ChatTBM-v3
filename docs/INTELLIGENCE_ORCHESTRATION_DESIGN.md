# Intelligence Orchestration Design

## Canonical Status

Intelligence Orchestration is a canonical coordination capability governed by Contract §33.

It coordinates approved intelligence inputs across canonical domain boundaries and prepares structured intelligence for approved downstream consumers.

Intelligence Orchestration owns only transient orchestration operation state. It does not become the canonical owner of Memory, Profile, Learning, Context, Conversation, Forecast, Evaluation, Application, Project, Workspace, Tool, Action, or Verification state.

The first implementation introduces no durable Intelligence Persistence and no Intelligence Registry.

## 1. Package Structure

The first implementation uses `intelligence/`:

- `IntelligenceOrchestrationRequest.js` — request validation and normalization.
- `IntelligenceOrchestrationObject.js` — transient orchestration operation state.
- `IntelligenceOrchestrationLifecycle.js` — lifecycle validation and transitions.
- `IntelligenceOrchestrationBoundary.js` — canonical orchestration entry point.
- `IntelligenceOrchestration.js` — orchestration coordination.
- `IntelligenceOrchestration.test.js` — direct Node verification.

No Intelligence Persistence or Intelligence Registry is created.

The package MUST NOT introduce canonical Project, Workspace, Tool, Action, or Verification state.

## 2. Responsibilities

`IntelligenceOrchestrationRequest` validates the canonical request and preserves supplied identity.

`IntelligenceOrchestrationObject` represents one transient orchestration operation.

`IntelligenceOrchestrationLifecycle` defines and validates the operation lifecycle.

`IntelligenceOrchestration` coordinates approved intelligence inputs, composes transient intelligence state, delegates approved downstream work, and normalizes orchestration failures.

`IntelligenceOrchestrationBoundary` controls access to the capability and enforces identity, ownership, lifecycle, approved domain integration, and controlled failures.

Intelligence Orchestration MUST distinguish:

- requested intent
- available information
- authorized operations
- composed intelligence
- delegated execution
- completed execution
- verified results

## 3. Identity and Ownership

Each orchestration operation MUST contain:

- `userId`
- `operationId`
- `input`

`operationId` is immutable after operation creation.

`userId` identifies the owning user and MUST remain immutable.

The Boundary MUST preserve supplied identity and MUST NOT silently regenerate, replace, or reassign ownership.

An orchestration operation MUST NOT consume canonical information belonging to another user.

Intelligence inputs remain owned by their respective canonical domains.

No registry or durable identity store is introduced.

## 4. Lifecycle

The first implementation uses the following transient lifecycle:

```text
requested
    ↓
resolving
    ↓
composed
    ↓
completed
```

Any failure during validation, resolution, composition, delegation, or completion transitions the operation to:

```text
failed
```

Valid transitions are:

- `requested → resolving`
- `resolving → composed`
- `resolving → failed`
- `composed → completed`
- `composed → failed`

`completed` and `failed` are terminal states.

Invalid transitions MUST fail without mutating the operation.

A failed operation MUST NOT become completed.

A completed operation MUST represent work actually completed by the orchestration capability and its approved delegates.

Lifecycle state remains orchestration state and MUST NOT become lifecycle authority for another canonical domain.

## 5. Data Flow

Approved caller
→ IntelligenceOrchestrationRequest
→ IntelligenceOrchestrationBoundary
→ IntelligenceOrchestration
→ approved canonical domain boundaries
→ transient composed intelligence
→ approved downstream execution
→ controlled orchestration result

The operation MUST resolve required canonical information before composition.

Composition MUST NOT silently establish ownership of the supplied information.

Downstream execution MUST remain distinguishable from orchestration composition.

Orchestration completion MUST NOT be reported when a required downstream operation was not completed.

## 6. Authority Flow

Conversation / Context / approved application caller
→ Chat Interaction or approved application boundary
→ Intelligence Orchestration Boundary
→ canonical domain boundaries
→ Intelligence Orchestration
→ Assistant Engine when assistant generation is required
→ AI Engine
→ AI Provider Boundary

Intelligence Orchestration coordinates authority; it does not replace the authority of the domains it coordinates.

Memory, Profile, Learning, Context, Conversation, Forecast, Evaluation, and Application state remain owned by their canonical domains.

The orchestration layer MUST NOT directly mutate canonical state owned by those domains.

## 7. Canonical Domain Integration

Intelligence Orchestration MAY consume approved information from canonical domains only through their established boundaries.

The first implementation MUST explicitly map each supported integration to its owning authority.

Where a required capability does not expose an approved canonical boundary, Intelligence Orchestration MUST NOT create an ad-hoc substitute.

Resolved domain information MAY be placed into transient orchestration state for composition.

Such information remains owned by the supplying domain.

The orchestration operation MUST preserve user ownership throughout cross-domain resolution.

## 8. Assistant and AI Integration

Intelligence Orchestration remains separate from the Assistant Engine.

When assistant generation is required:

Intelligence Orchestration
→ Assistant Engine
→ AI Engine
→ AI Provider Boundary

Intelligence Orchestration MUST NOT call the AI Engine directly.

It MUST NOT import provider SDKs, access provider credentials, or maintain provider-specific execution state.

The Assistant Engine remains responsible for assistant request construction, AI delegation, and controlled assistant failures.

The AI Engine remains responsible for AI execution through the established AI Provider Boundary.

Missing provider credentials MUST remain a controlled downstream failure and MUST NOT produce fabricated completion.

## 9. Persistence and Registry

The first implementation uses transient operation state only.

No `IntelligencePersistence.js` is created.

No `IntelligenceRegistry.js` is created.

The transient operation mechanism MUST NOT become an implicit durable registry or canonical intelligence store.

Operation identity is enforced through the Boundary and the transient operation mechanism.

Any future durable intelligence state, history, search, analytics, or registry requires separate architectural discovery and Contract impact analysis.

## 10. Failure Flow

Failures remain explicit and controlled:

- Invalid request → validation failure.
- Invalid identity → identity failure.
- Ownership violation → authorization failure.
- Invalid lifecycle transition → lifecycle failure.
- Unavailable canonical input → dependency-unavailable failure.
- Boundary integration failure → integration failure.
- Composition failure → orchestration failure.
- Assistant delegation failure → downstream execution failure.
- AI/provider unavailability → controlled unavailable-dependency failure.
- Incomplete execution → incomplete-operation failure.

No failure may produce false success.

The operation identity MUST remain available in failure results when identity was successfully established.

Internal secrets, provider credentials, and uncontrolled implementation details MUST NOT be exposed.

## 11. Legacy Intelligence Services

The following remain legacy/noncanonical references:

- `responseEngine.js`
- `intelligenceFusionEngine.js`
- `creatorBrainOrchestrator.js`
- `intelligenceCore.js`
- `predictionEngine.js`
- `memoryIntelligenceEngine.js`
- related legacy strategy, growth, audience, and intelligence services

These services MUST NOT become canonical merely because they contain orchestration-like behavior.

Their historical behavior may inform discovery, but the first canonical implementation MUST NOT reproduce their cross-domain state ownership model.

Legacy reuse MUST occur only through approved canonical boundaries.

## 12. Execution Constraints

The first implementation provides no autonomous execution authority.

It MUST NOT introduce:

- unrestricted filesystem access
- shell execution
- process execution
- unrestricted network execution
- provider SDK access
- autonomous Tool authority
- autonomous Action authority
- Project authority
- Workspace authority
- Verification Engine authority

Intelligence Orchestration may coordinate approved downstream operations, but consequential execution requires an explicitly approved execution boundary.

The orchestration layer MUST NOT claim that an operation was executed merely because a plan, request, or delegation was created.

## 13. Verification and Failure Testing

Direct Node verification MUST cover:

- request validation
- immutable operation identity
- user ownership enforcement
- lifecycle creation
- valid lifecycle transitions
- invalid lifecycle rejection
- transient operation behavior
- absence of persistence
- absence of an Intelligence Registry
- canonical-boundary integration
- domain ownership preservation
- Assistant Engine delegation
- AI execution separation
- provider-boundary separation
- legacy-service non-authority
- controlled dependency failures
- downstream execution failures
- false-success prevention

Failure testing MUST attempt:

- invalid identity
- ownership substitution
- unauthorized canonical-state access
- invalid lifecycle transitions
- unavailable canonical dependencies
- direct AI Engine bypass
- provider SDK/provider credential access
- legacy authority substitution
- incomplete execution reported as completed

All such attempts MUST fail in controlled form.

Live external provider execution is not required when the established provider boundary cannot execute because credentials or external access are unavailable.

## 14. Design Constraints

The first implementation is intentionally orchestration-focused and transient.

It MUST NOT introduce:

- Intelligence Persistence
- Intelligence Registry
- durable intelligence history
- intelligence analytics
- autonomous execution
- autonomous Tool or Action authority
- Project or Workspace authority
- Verification Engine authority
- new canonical Strategy, Voice, Audience, Growth, or Decision domains
- external intelligence providers outside the established provider boundary
- provider-specific orchestration state
- direct mutation of canonical domain state
- ad-hoc replacement boundaries

Any future expansion of these responsibilities requires separate architectural discovery, Contract impact analysis, Design, implementation, verification, failure testing, documentation, checkpoint, commit, push, and repository confirmation.
