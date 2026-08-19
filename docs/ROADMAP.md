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

### AI Provider Foundation

AIProviderBoundary
→ GeminiProvider

### AI Engine Integration

aiEngine
→ AIProviderBoundary
→ GeminiProvider

Live Gemini execution remains dependent on configured provider credentials.

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
- AI provider abstraction
- AI engine provider integration

The framework is therefore at the stage where future REG work should
extend canonical architecture rather than continue isolated feature
development.

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

