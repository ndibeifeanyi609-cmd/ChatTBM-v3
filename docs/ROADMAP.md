# ChatTBM Framework Roadmap

Status: Canonical Development Plan

## 1. Purpose

This Roadmap defines the controlled development sequence for evolving the
ChatTBM framework.

The Roadmap does not replace the ChatTBM Framework Blueprint or Framework
Contract.

Its authority relationship is:

Blueprint
→ Contract
→ Roadmap
→ Package Design
→ Implementation
→ Verification
→ Failure Testing
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation

The Roadmap exists to prevent ad-hoc development, architectural bypasses,
premature implementation, and uncontrolled expansion of the canonical
framework.

---

## 2. Architectural Authority

The documents have distinct responsibilities:

### Blueprint

Defines the high-level architectural principles and boundaries.

### Contract

Defines detailed behavioral requirements for canonical framework packages.

### Roadmap

Defines the controlled order in which framework work is evaluated and
executed.

### Design

Defines how a specific approved package will satisfy the Blueprint and
Contract.

The Roadmap must never override the Blueprint or Contract.

---

## 3. Development Gate

Every future REG package must pass the following gates:

1. Architectural need identified
2. Existing canonical responsibility checked
3. Blueprint position established
4. Contract requirements established
5. Package Design completed
6. Implementation completed
7. Syntax and normal verification completed
8. Failure testing completed
9. Documentation updated
10. Repository checkpoint created
11. Commit created
12. Changes pushed to GitHub
13. Repository state confirmed

A package that fails a required gate is not considered complete.

---

## 4. Current Verified Foundation

The following framework foundations are currently established and verified.

### Forecast Foundation

ForecastTypes
→ ForecastObject
→ ForecastLifecycle
→ ForecastPersistence
→ ForecastRegistry
→ ForecastIntegration

### Evaluation Foundation

ForecastEvaluation
→ EvaluationRecord
→ EvaluationIntegration
→ EvaluationPersistence
→ EvaluationRegistry

### Learning Foundation

LearningTypes
→ LearningObject
→ LearningLifecycle
→ LearningPersistence
→ LearningRegistry
→ LearningIntegration

### Learning Boundary

Legacy Learning Services
→ LearningBoundary
→ LearningIntegration
→ Canonical Learning Foundation

### Learning / Evaluation Boundary

Learning
→ LearningEvaluationBoundary
→ EvaluationRegistry
→ ForecastRegistry

### Learning Application Foundation

Learning
→ LearningApplicationBoundary
→ ApplicationObject
→ ApplicationPersistence
→ ApplicationRegistry
→ Target Consumer
→ ApplicationLifecycle

Verified protections include:

- Canonical application identity
- Persistence idempotency
- Registry identity conflict protection
- Terminal-state authority
- APPLIED terminal no-re-execution
- FAILED terminal no-re-execution
- REJECTED terminal no-re-execution
- CONFLICTED terminal no-re-execution
- Invalid lifecycle transition rejection
- Invalid application construction rejection
- Consumer failure normalization
- Consumer result normalization
- Boundary registry conflict rejection

### AI Provider Foundation

AIProviderBoundary
→ GeminiProvider

### AI Engine Integration

aiEngine
→ AIProviderBoundary
→ GeminiProvider

Live Gemini execution remains dependent on configured provider credentials.

### Memory Foundation

Canonical Memory owns durable user-owned memory state.

### Profile Foundation

Canonical Profile owns user-scoped profile and identity state.

### Context Foundation

Canonical Context owns interaction-scoped conversational state.

### Conversation Foundation

Canonical Conversation owns user-scoped conversational containers and Context references.

### Chat Interaction Boundary

Chat Interaction Boundary coordinates normal chat interactions through canonical Context and Assistant Engine boundaries.

### Software-Building Assistant

Software-Building Assistant is an application capability operating above the canonical Assistant Engine and AI path.

### Intelligence Orchestration

Intelligence Orchestration coordinates transient intelligence composition across approved canonical boundaries.

---

## 5. Canonical Development Workflow

Every new framework package must follow:

### Phase A — Discovery

Determine:

- What problem requires the package
- Whether an existing canonical package already owns the responsibility
- Whether the capability is currently legacy, experimental, or canonical
- Which domains it must interact with
- Whether an external dependency is required

No implementation begins during discovery.

### Phase B — Contract

Define:

- Purpose
- Canonical responsibility
- Required fields
- Identity
- Ownership
- Lifecycle
- Persistence
- Registry authority
- Boundaries
- References
- Failure behavior
- Integration behavior
- Verification requirements

### Phase C — Design

Define:

- Package structure
- Component responsibilities
- Data flow
- Authority flow
- Boundary flow
- Failure flow
- Integration points
- Test strategy

Design must demonstrate compliance with the Blueprint and Contract.

### Phase D — Implementation

Implement only the approved design.

Do not introduce unrelated refactoring, speculative features, duplicate
authority, or ad-hoc integrations.


### Phase E — Verification

Verify:

- Syntax
- Contract behavior
- Normal execution
- Boundary behavior
- Identity
- Ownership
- Lifecycle
- Persistence
- Registry
- Integration

### Phase F — Failure Testing

Attempt to violate the protections deliberately.

Where applicable test:

- Invalid input
- Missing dependencies
- Missing references
- Unauthorized ownership
- Duplicate identity
- Identity conflicts
- Invalid lifecycle transitions
- Persistence failures
- Registry failures
- Integration failures
- Provider failures
- Consumer failures

### Phase G — Documentation

Record only verified behavior.

Update README and applicable framework documentation.

### Phase H — Repository Checkpoint

Create a clean checkpoint describing:

- Package established
- Verification completed
- Failure testing completed
- Documentation completed
- Known limitations

### Phase I — Git Synchronization

The completed checkpoint must be:

- Committed
- Pushed to GitHub
- Confirmed in the repository

---

## 6. Legacy Integration Rule

Legacy services are not automatically canonical.

Before integrating a legacy service:

1. Identify its responsibility
2. Determine whether a canonical domain already owns that responsibility
3. Define the required boundary
4. Define translation rules if necessary
5. Preserve canonical ownership
6. Preserve canonical identity
7. Preserve lifecycle authority
8. Preserve persistence authority
9. Preserve registry authority
10. Verify failure behavior

Legacy functionality must enter the canonical architecture through an
approved boundary.

---

## 7. External API Gate

An external API may only be introduced when required by the Blueprint,
Contract, and approved package Design.

Before introducing an external API, establish:

- Why the API is architecturally required
- Which canonical boundary owns the integration
- What credentials are required
- How failures are represented
- How availability is handled
- How the integration will be verified
- What security controls apply

For AI providers:

Application
→ AI Provider Boundary
→ Provider Implementation
→ External Provider API

Higher-level services must never bypass the AI Provider Boundary.

If credentials are unavailable, live execution must not be falsely claimed.

---

## 8. Proposed Framework Evolution

Future areas are candidates for architectural evaluation, not automatic
implementation commitments.

Potential areas include:

- Skills
- Research
- General assistance
- Additional AI providers
- Additional application consumers

Each candidate must first pass architectural discovery.

The existence of a corresponding legacy file or service does not establish
canonical status.

---

## 9. REG Package Progression

Future REG packages should progress from the currently verified foundation
toward broader framework capabilities without bypassing established
authority.

Each REG package must answer:

- What canonical responsibility is being established?
- Which existing domains does it interact with?
- Which domain owns its state?
- What is its identity model?
- What is its lifecycle?
- Where is its persistence authority?
- Where is its registry authority?
- Which boundaries control interaction?
- What failures must be protected?
- What existing services must remain outside the canonical core?
- Does it require an external API?

Only after these questions are answered should implementation begin.

---

## 10. No-Skip Rule

The following shortcuts are prohibited:

- Implementing before architectural justification
- Creating files without a justified package design
- Bypassing canonical registries
- Bypassing canonical persistence
- Mutating another domain's objects directly
- Creating competing authoritative state
- Direct provider SDK access from higher-level services
- Introducing ad-hoc external APIs
- Changing tests merely to make an implementation pass
- Claiming live external execution without live verification
- Skipping failure testing
- Skipping 
failure testing
- Skipping documentation
- Skipping repository synchronization

---

## 11. Current Development Position

ChatTBM has established verified foundations for:

- Forecasting
- Evaluation
- Learning
- Learning boundaries
- Learning / Evaluation interaction
- Learning application
- Memory
- Profile
- Context
- Conversation
- Chat Interaction Boundary
- Software-Building Assistant
- Intelligence Orchestration
- AI provider abstraction
- AI engine provider integration

The framework is therefore at the stage where future REG work should
extend canonical architecture rather than continue isolated feature
development.

REG-095 Intelligence Orchestration is the latest synchronized checkpoint.
No next REG package is selected until discovery establishes a concrete
missing canonical responsibility.

---

## 12. Next REG Selection Rule

The next REG package must not be selected merely because a legacy service
already exists.

The next package must be selected after architectural discovery determines:

1. The missing canonical capability
2. Its relationship to existing foundations
3. Its owning domain
4. Its required boundaries
5. Its identity requirements
6. Its lifecycle requirements
7. Its persistence requirements
8. Its registry requirements
9. Its failure requirements
10. Whether an external API is required

The selected REG package must then proceed through:

Discovery
→ Contract
→ Design
→ Implementation
→ Verification
→ Failure Testing
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation

---

## 13. Roadmap Completion Rule

The Roadmap itself is considered complete only when its development
sequence has been documented and verified against the Blueprint and
Contract.

The Roadmap must remain a development-control document rather than a
source of new architectural authority.

---

## 14. Final Roadmap Rule

ChatTBM development proceeds by controlled architectural evolution.

No implementation is canonical merely because it works.

No legacy service becomes canonical merely because it exists.

No external API is introduced merely because it is convenient.

No domain may surrender its canonical authority to an unrelated service.

Every future REG package must establish its architectural position before
implementation.

Every implementation must be verified.

Every critical protection must be failure-tested.

Every verified change must be documented.

Every completed checkpoint must be committed, pushed to GitHub, and confirmed.

The Roadmap therefore preserves the canonical development sequence:

Blueprint
→ Contract
→ Roadmap
→ Design
→ Implementation
→ Verification
→ Failure Testing
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation


---

## 15. REG-094 Conversation Foundation

REG-094 establishes the canonical Conversation domain above interaction-scoped
Context.

The verified Conversation architecture establishes:

- Canonical Conversation identity and immutable identity fields
- Explicit user ownership
- `active` and `closed` lifecycle states
- Controlled lifecycle transitions with terminal idempotence
- Authoritative Conversation persistence
- Optimistic version checking for ordinary mutable updates
- Explicit stale-version failure behavior
- Ordered Context references without taking ownership of Context state
- Context-reference validation through the canonical Context Boundary
- Canonical Conversation Boundary for cross-domain operations
- Ownership protection across reads, writes, lifecycle operations, references,
  listing, and deletion
- Explicit controlled failure behavior
- Separation from Context, Memory, Profile, Learning, Skills, and Intelligence
- No separate Conversation Registry
- Legacy conversation/history/timeline services remaining noncanonical

REG-094 implementation and failure verification must remain governed by
Contract §32 and the approved `docs/CONVERSATION_DESIGN.md`.

The completed REG-094 sequence is:

Contract
→ Design
→ Implementation
→ Verification
→ Failure Testing
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation

---

## 16. Plugin Architecture (Proposed — Discovery Required)

ChatTBM should evaluate a secure, extensible plugin architecture before
app-store release. This is a roadmap candidate, not an implemented or
approved canonical capability. It must first pass architectural discovery
and must not bypass the Blueprint, Contract, or existing canonical boundaries.

### Intended Product Direction

Support both:
- Built-in ChatTBM tools
- User-enabled third-party integrations through a managed plugin catalogue

Initial capabilities to evaluate:
- Image generation
- Web search
- Document creation and analysis

Each capability requires its own implementation, provider/dependency review,
security assessment, and verification. Listing a capability here does not
claim it is already available.

### Architectural Questions for Discovery

Determine whether and how to establish:
- Plugin Registry: catalogue and lifecycle of available plugins
- Plugin Boundary: controlled invocation and normalized results/failures
- Permission and consent controls: user authorization for plugin access/actions
- AI orchestration integration: selecting tools only through approved boundaries
- Plugin settings: enable, disable, and manage integrations
- Future subscription/entitlement checks for premium capabilities

The design must preserve canonical domain ownership, prevent unauthorized
actions, define timeout and provider-failure behavior, and test malformed
outputs and unavailable dependencies. Secrets and provider API keys must
remain server-side and must never be exposed to browser clients.

### Required Development Sequence

Begin with discovery; do not create implementation files until the
architectural responsibility and boundaries are approved.

Discovery
→ Blueprint / Contract alignment
→ Contract
→ Package Design
→ Implementation
→ Verification
→ Failure Testing
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation

Plugin work must follow the canonical development workflow in §5 and the
External API Gate in §7. The first release priorities are candidates for
evaluation, not a commitment to ship all three before release.

---

## 17. Progressive Response Streaming (Proposed — Discovery Required)

Design reference: `docs/STREAMING_DESIGN.md`. Contract requirements: §36 in `docs/CONTRACT.md`.

ChatTBM should evaluate progressive AI response streaming as a user-facing
chat capability. This is a proposed change, not yet implemented or verified.

### Intended Behavior

- Render generated assistant text progressively while the response is being produced.
- Preserve authenticated user identity and canonical interaction ownership.
- Keep AI provider access behind AIProviderBoundary and provider implementations.
- Preserve the existing non-streaming request behavior unless an explicit,
  contract-approved streaming mode is requested.
- Finalize and persist only a well-defined completed response; define what
  happens when a stream is interrupted or cancelled.
- Normalize errors that occur before and after response headers are sent.
- Support mobile browsers and the current chat UI without exposing provider
  credentials or internal provider details.

### Architectural Discovery

Inspect and define the streaming path across:
- GeminiProvider and AIProviderBoundary
- AI engine and Assistant Engine orchestration
- Chat Interaction Boundary and HTTP controller
- Browser Chat API and message-rendering UI
- Conversation persistence and cancellation/error handling

Do not bypass canonical boundaries or add provider SDK calls to the UI or
HTTP controller. Select and document the transport (for example, Server-Sent
Events or a streamed fetch response) only after compatibility, authentication,
proxy buffering, and failure behavior are evaluated.

### Required Sequence

Discovery
→ Contract / Blueprint alignment
→ Streaming Design
→ Implementation
→ Unit and integration verification
→ Failure testing (provider errors, interrupted streams, disconnects,
  malformed chunks, cancellation, and persistence)
→ Documentation
→ Checkpoint
→ Commit
→ Push
→ Repository Confirmation

Streaming is not considered complete until the browser visibly receives
incremental chunks from a live or controlled provider, existing non-streaming
behavior remains covered, and the relevant tests pass.

---

## 18. Pre-Store Product Release Requirements

These product-release requirements must be completed and verified before
submitting ChatTBM to the Apple App Store or Google Play. They supplement the
canonical framework sequence above and do not bypass its contract, design,
implementation, verification, failure-testing, documentation, and repository
synchronization gates.

### Founder / Developer Identity and Entitlement

The intended founder and developer account is `ndibeifeanyi609@gmail.com`.
This identity must be verified through the normal authentication system before
any privileged entitlement is granted.

Required behavior:

- Establish a server-authoritative founder/developer role bound to the verified
  account identity; never trust a client-provided email, role, or browser state.
- Grant the founder account a developer entitlement that waives ChatTBM
  subscription charges and provides the agreed premium access.
- Ensure ordinary users cannot assign themselves founder or developer status.
- Keep external provider, AI API, hosting, and infrastructure charges separate;
  founder entitlement does not make third-party services free.
- Document a secure account-recovery and ownership-verification procedure so
  founder access does not depend solely on a hard-coded email string.

### Recommended Founder Privileges

Evaluate and implement the following privileges where appropriate, each behind
server-side authorization and with clear boundaries:

- **Founder badge and identity:** show a Founder / Developer label in the
  authenticated account profile and developer settings.
- **Premium entitlement:** bypass ChatTBM subscription billing for the verified
  founder account without changing the billing status or entitlements of users.
- **Developer console:** provide access to safe product diagnostics, deployment
  status, feature readiness, and service health without displaying secrets.
- **Usage and cost visibility:** show the founder aggregate AI usage, provider
  consumption, and estimated costs so external spend can be managed.
- **Feature preview controls:** allow the founder to enable approved beta
  features and test tools before general availability.
- **Support and recovery tools:** provide documented account recovery and
  narrowly scoped account-support actions with confirmation and audit records.
- **Audit trail:** record privileged changes and access to developer controls,
  excluding passwords, reset tokens, API keys, and other secrets.
- **Emergency controls:** permit authorized disabling of a broken feature or
  provider integration without granting unrestricted access to customer data.
- **Founder protection:** require strong authentication for sensitive controls,
  and use least privilege, confirmation for destructive actions, and safe
  defaults.

Founder status must not bypass authentication, security controls, privacy
requirements, rate limits needed to protect service availability, or applicable
store rules. It must not silently grant unrestricted access to private customer
conversations or credentials. Any administrative access to customer data must
have a specific purpose, minimum scope, appropriate user/privacy safeguards,
and auditable authorization.

### Other Required Pre-Store Work

- Add image generation through the approved plugin/tool architecture, with
  server-side secret handling, permission controls, and independent tests.
- Complete the planned plugin foundation for image generation, web search, and
  document tools, including registry, boundary, consent/permissions, settings,
  orchestration integration, and appropriate subscription controls.
- Complete production security, authentication, persistence,
  payment/subscription, mobile usability, and release verification.
- Verify that Apple In-App Purchase and Google Play billing requirements are
  followed for digital subscriptions in their respective stores.

These are planned release requirements, not claims that implementation is
already complete. Each item must be verified and documented before store
submission.
