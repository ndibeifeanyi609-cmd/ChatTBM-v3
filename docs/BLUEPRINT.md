# ChatTBM Framework Blueprint

Status: Canonical Foundation

## 1. Purpose

ChatTBM is being developed as a modular AI assistant framework for real-world applications.

The framework is designed around explicit contracts, canonical objects, controlled boundaries, ownership protection, lifecycle management, persistence, registry authority, and provider independence.

The architecture must remain extensible without allowing individual features or services to bypass canonical framework protections.

---

## 2. Canonical Development Principle

Every major ChatTBM capability must be developed through the controlled framework workflow:

Blueprint
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

No implementation may be introduced merely because a service or feature appears useful.

A new framework capability must first have a justified architectural position and contract.

---

## 3. Canonical Foundation Model

The current verified framework foundations are:

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

### Learning Application Foundation

Learning
→ LearningApplicationBoundary
→ ApplicationObject
→ ApplicationPersistence
→ ApplicationRegistry
→ Target Consumer
→ ApplicationLifecycle

### AI Provider Foundation

AIProviderBoundary
→ Provider Implementation

Current provider:

AIProviderBoundary
→ GeminiProvider

Provider-specific implementation must remain behind the provider boundary.

---

## 4. Boundary Principle

A boundary exists to control interaction between architectural domains.

A boundary must:

- Validate incoming data
- Preserve canonical contracts
- Preserve ownership
- Preserve identity
- Delegate authority to the correct canonical component
- Normalize controlled failures
- Prevent unauthorized bypasses

A boundary must not silently assume ownership of another domain.

---

## 5. Ownership Principle

Every canonical domain must retain authority over its own objects and state.

Examples:

- Learning owns canonical Learning objects.
- Evaluation owns canonical Evaluation records.
- Forecast owns canonical Forecast objects.
- Application owns Application records and application lifecycle.
- Provider implementations own provider-specific execution.
- Target consumers own target-specific application behavior.

Cross-domain components may reference or resolve another domain through its approved boundary, but must not bypass that domain's canonical authority.

---

## 6. Identity Principle

Canonical objects require deterministic and protected identity where the domain contract requires it.

Identity must not be silently changed during lifecycle updates.

Duplicate semantic operations must be explicitly classified as:

- Idempotent
- Conflict
- Invalid

The classification must be defined by the relevant domain contract.

---

## 7. Lifecycle Principle

Canonical lifecycle state must be controlled by the domain lifecycle contract.

Implementations must not freely mutate lifecycle states.

Valid transitions must be explicitly defined.

Invalid transitions must be rejected.

Terminal states must remain terminal unless a future contract explicitly defines another controlled transition.

---

## 8. Persistence Principle

Persistence is an architectural responsibility and must remain behind the canonical persistence component of its domain.

Higher-level boundaries may request persistence but must not replace the persistence contract with ad-hoc storage behavior.

Persistence must preserve:

- Identity
- Ownership
- Canonical state
- Idempotency rules
- Conflict rules

---

#

## 9. Registry Authority Principle

Canonical registries are authoritative for registration, retrieval, ownership enforcement, lifecycle-controlled updates, and domain-scoped lookup.

Components outside a registry must not maintain competing authoritative registries for the same canonical domain.

A boundary may request registry operations through the approved registry contract but must not bypass registry validation or ownership controls.

Registry behavior must explicitly define:

- Registration rules
- Retrieval rules
- Ownership rules
- Duplicate handling
- Conflict handling
- Update rules
- Deletion rules
- Cleanup behavior

---

## 10. Provider Independence Principle

AI provider implementations are infrastructure adapters behind the canonical AI Provider Boundary.

Higher-level application services must not directly depend on provider SDKs.

Provider-specific concerns must remain inside the provider implementation.

The provider boundary must control:

- Provider registration
- Provider selection
- Request validation
- Provider execution delegation
- Response normalization
- Provider failure normalization
- Provider availability

A future provider may be introduced without requiring higher-level application architecture to depend directly on that provider.

---

## 11. Application Boundary Principle

Application behavior must be separated from canonical domain objects.

A target consumer is responsible for target-specific behavior.

The canonical application package is responsible for:

- Application identity
- Application record creation
- Application lifecycle
- Application persistence
- Application registry authority
- Application result normalization

The Learning Application Boundary may orchestrate Learning application, but must not mutate the canonical Learning object or implement target-specific internals.

---

## 12. Cross-Domain Reference Principle

Cross-domain relationships must use explicit references and controlled boundaries.

A component must not infer ownership merely because it possesses an identifier.

Reference resolution must verify:

- Referenced object existence
- Reference validity
- User ownership where required
- Domain authority
- Dependency availability

A missing or unauthorized reference must fail through the relevant boundary rather than being silently ignored.

---

## 13. Failure Boundary Principle

Failures are part of the canonical architecture and must be explicitly controlled.

A framework component must distinguish between:

- Invalid input
- Missing dependency
- Unauthorized ownership
- Missing canonical object
- Duplicate semantic identity
- Identity conflict
- Invalid lifecycle transition
- Provider failure
- Target consumer failure
- Unexpected internal failure

Failures must not silently corrupt canonical state.

Where a boundary translates an internal failure, the original architectural meaning must remain recoverable.

---

## 14. Verification Principle

Every canonical framework package must have explicit verification before it is considered established.

Verification must cover:

- Syntax integrity
- Contract behavior
- Normal execution
- Boundary behavior
- Ownership isolation
- Identity protection
- Lifecycle enforcement
- Persistence behavior
- Registry behavior
- Integration behavior

Failure testing is mandatory for architectural protections.

A package is not considered verified merely because its primary execution path succeeds.

---

## 15. Documentation Principle

Documentation is part of the framework lifecycle.

After implementation and verification, the canonical architectural behavior must be reflected in repository documentation.

Documentation must describe:

- What was established
- Why it exists
- Its canonical boundaries
- Its ownership rules
- Its lifecycle
- Its persistence behavior
- Its registry authority
- Its integration boundaries
- Its verified protections
- Known limitations

Documentation must not claim capabilities that have not been verified.

---

## 16. External API Principle

External APIs must only b
e introduced when the canonical blueprint and contract require them.

An external API must have:

- A justified architectural purpose
- A defined boundary
- A clear owner
- Controlled credentials
- Failure handling
- Verification strategy

Provider APIs must not be introduced through ad-hoc service integrations.

For real-world AI execution, the canonical AI Provider Boundary must remain the entry point for provider execution.

If a required external API is not yet configured or available, the architecture may be verified without live execution where the contract permits, but live capability must not be falsely claimed.

---

## 17. Change Control Principle

Existing canonical architecture must not be changed merely to make a new feature easier to implement.

Changes to established contracts require:

1. Architectural justification
2. Contract impact analysis
3. Design review
4. Implementation
5. Regression verification
6. Failure testing
7. Documentation update
8. Repository checkpoint

Existing tests must not be weakened or changed merely to make an implementation pass.

---

## 18. Framework Package Principle

A new framework package must have a clearly defined architectural responsibility.

Before implementation, the package must establish:

- Purpose
- Ownership
- Canonical object or record
- Identity model
- Lifecycle model where applicable
- Persistence model where applicable
- Registry model where applicable
- Boundary model
- Integration points
- Failure behavior
- Verification requirements

If a proposed package duplicates an existing canonical responsibility, the duplication must be resolved architecturally before implementation.

---

## 19. Current Verified State

As of REG-087, the verified canonical framework includes:

- Forecast Foundation
- Evaluation Foundation
- Learning Foundation
- Learning Boundary
- Learning / Evaluation Boundary
- Learning Application Boundary
- AI Provider Boundary
- AI Engine Provider Integration

The repository is therefore moving from isolated feature development toward a controlled framework architecture.

The existence of legacy services does not automatically make those services canonical.

Legacy functionality must be integrated through approved boundaries before it becomes part of the canonical framework.

---

## 20. Architectural Authority

This Blueprint establishes the high-level architectural rules for ChatTBM.

The Blueprint does not replace detailed contracts.

Detailed contracts define the exact behavior of individual framework packages.

When implementation questions arise:

Blueprint
→ Contract
→ Design
→ Implementation

must be used to determine the correct architectural decision.

An implementation must not override an established Blueprint or Contract rule merely for convenience.

---

## 21. Future Framework Evolution

Future REG packages must extend the framework without bypassing established authority.

Potential future packages may address areas such as:

- Memory
- Profile
- Context
- Conversation
- Intelligence orchestration
- Skills
- Research
- General assistance
- Additional AI providers
- Additional application consumers

These areas are not automatically canonical merely because corresponding legacy services or files already exist.

Each future package requires its own architectural justification, contract, design, implementation, verification, and failure testing.

---

## 22. Canonical Rule

The central ChatTBM architectural rule is:

Canonical domains own their state.

Boundaries control cross-domain interaction.

Registries preserve domain authority.

Persistence preserves canonical state.

Lifecycle contracts control state transitions.

Identity contracts protect semantic uniqueness.

Providers remain behind provider boundaries.

External APIs require architectural justification.

Verification proves behavior.

Failure testing proves protection.

Documentation records verified architecture.

No feature is canonical merely because it exists in the repository.

