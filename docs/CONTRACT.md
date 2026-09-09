# ChatTBM Framework Contract

Status: Canonical Foundation

## 1. Purpose

This Contract defines the detailed behavioral rules that govern
ChatTBM's canonical framework architecture.

The Contract operates beneath the ChatTBM Framework Blueprint.

The architectural authority sequence is:

Blueprint
→ Contract
→ Design
→ Implementation
→ Verification

The Contract converts the high-level Blueprint principles into
explicit rules that canonical framework packages must satisfy.

No implementation may claim canonical status unless it satisfies
the applicable Contract rules and passes the required verification
and failure testing.

---

## 2. Contract Authority

The Contract defines:

- Canonical object behavior
- Canonical record behavior
- Identity requirements
- Ownership requirements
- Lifecycle requirements
- Persistence requirements
- Registry authority
- Boundary behavior
- Cross-domain reference behavior
- Failure behavior
- Provider behavior
- External API requirements
- Verification requirements

The Contract does not authorize a new framework package by itself.

A proposed package must still have an approved architectural
position under the Blueprint and an explicit design before
implementation.

---

## 3. Canonical Object Contract

Every canonical framework object must define:

- Purpose
- Required fields
- Optional fields
- Version
- Ownership model
- Identity model
- Lifecycle model where applicable
- Normalization rules
- Validation rules
- Failure behavior

Canonical object creation must produce a structurally valid
object according to its domain contract.

Invalid canonical objects must be rejected.

Canonical objects must not silently acquire fields or behavior
that belong to another architectural domain.

---

## 4. Canonical Record Contract

Canonical records represent controlled framework state or
domain relationships.

A canonical record must define:

- Required identity
- Required ownership
- Required domain references
- Version
- Initial state
- State transition rules
- Persistence behavior
- Registry behavior where applicable
- Duplicate behavior
- Conflict behavior

Records must remain structurally consistent throughout their
lifecycle.

---

## 5. Identity Contract

Canonical identity must be explicitly defined by the owning
domain.

Where deterministic identity is required, the identity must be
derived from the canonical identity inputs defined by that domain.

Identity must remain stable across legitimate lifecycle updates.

Equivalent semantic operations must not create uncontrolled
duplicate canonical state.

Duplicate behavior must be classified as one of:

- Idempotent
- Conflict
- Invalid

An identity conflict must not silently overwrite an existing
canonical object or record.

Identity generation must remain inside the owning domain or its
approved persistence component.

---

## 6. Ownership Contract

Canonical state belongs to its owning user or domain according to
the applicable contract.

User-scoped canonical objects must preserve user ownership through
creation, persistence, retrieval, registration, update, and
integration.

A component must not:

- Reassign ownership silently
- Retrieve another user's protected state
- Update another user's protected state
- Delete another user's protected state
- Treat an identifier as proof of authorization

Cross-domain references must verify ownership where required.

Unauthorized ownership access must fail through the relevant
boundary.

---

## 7. Lifecycle Contract

Every canonical lifecycle must explicitly define:

- Allowed states
- Initial state
- Valid transitions
- Invalid transitions
- Terminal states

Lifecycle state must be controlled by the canonical lifecycle
component of the owning domain.

Higher-level components must request valid transitions rather than
freely mutating lifecycle state.

Invalid transitions must be rejected.

Terminal states must remain terminal unless a later Contract
explicitly introduces a controlled transition.

---

## 8. Persistence Contract

Persistence is authoritative
 for durable canonical state within
its domain.

Persistence must preserve:

- Canonical identity
- Ownership
- Version
- Lifecycle state
- Required fields
- Idempotency behavior
- Conflict behavior

Persistence must explicitly define:

- Save behavior
- Retrieval behavior
- Duplicate handling
- Conflict handling
- Update behavior
- Deletion behavior
- Cleanup behavior where applicable

Higher-level boundaries must not replace canonical persistence
with ad-hoc storage.

Persistence failures must not silently produce false success.

---

## 9. Registry Contract

A canonical registry is authoritative for domain registration and
domain-scoped retrieval.

A registry must define:

- Registration
- Retrieval
- Ownership enforcement
- Duplicate handling
- Conflict handling
- Legitimate updates
- Deletion
- Cleanup

Registry validation must preserve the canonical object or record
contract.

A competing authoritative registry for the same canonical domain
must not be introduced outside the owning registry.

A boundary may invoke registry operations but must not bypass
registry authority.

---

## 10. Boundary Contract

A canonical boundary controls interaction between architectural
domains.

A boundary must:

- Validate incoming input
- Resolve approved references
- Preserve canonical identity
- Preserve ownership
- Preserve lifecycle authority
- Preserve persistence authority
- Preserve registry authority
- Delegate domain-specific behavior
- Normalize controlled failures

A boundary must not silently assume ownership of another domain.

A boundary must not duplicate the canonical responsibilities of
the object, lifecycle, persistence, or registry components it
connects.

---


## 11. Cross-Domain Reference Contract

Cross-domain references must be explicit and controlled.

A reference must identify the canonical object or record it intends
to resolve.

Reference resolution must verify, where applicable:

- Reference format
- Referenced object existence
- Referenced record existence
- User ownership
- Domain ownership
- Registry authority
- Dependency availability

Possession of an identifier does not establish authorization.

A missing reference must not be silently converted into a successful
operation.

An unauthorized reference must be rejected.

A boundary resolving a cross-domain reference must use the
authoritative registry or approved domain boundary.

Cross-domain components must not create competing copies of
referenced canonical state merely to avoid resolving the original
authority.

---

## 12. Failure Contract

Failure behavior is part of the canonical framework contract.

A framework component must distinguish, where applicable, between:

- Invalid input
- Missing required data
- Missing canonical object
- Missing dependency
- Unauthorized ownership
- Invalid reference
- Duplicate semantic identity
- Identity conflict
- Invalid lifecycle transition
- Persistence failure
- Registry failure
- Provider failure
- Target consumer failure
- Unexpected internal failure

Failures must not silently corrupt canonical state.

A failure must not be converted into a false successful result.

Where a boundary normalizes an internal failure, the normalized
failure must preserve the architectural meaning required by the
calling layer.

Failure handling must not bypass ownership, persistence, registry,
identity, or lifecycle protections.

Failure testing is mandatory for every protection that is critical
to the domain contract.

---

## 13. Integration Contract

Integration components connect canonical framework domains.

An integration component must:

- Accept only defined contract input
- Validate required references
- Preserve ownership
- Preserve canonical identity
- Delegate domain authority
- Preserve lifecycle rules
- Preserve persistence rules
- Preserve registry authority
- Propagate or normalize failures according to contract

An integration component must not become an alternative owner of
the canonical state it connects.

Integration logic must not silently modify canonical objects unless
the owning domain contract explicitly permits the operation.

---

## 14. Application Contract

The canonical Application package controls the state of an
application operation.

An ApplicationRecord must define:

- Application identity
- Learning or source reference where applicable
- User ownership
- Target type
- Target identity
- Operation
- Lifecycle status
- Creation timestamp
- Update timestamp
- Error information where applicable
- Metadata where applicable

Application identity must remain stable throughout legitimate
lifecycle transitions.

Application identity is idempotent.

If an ApplicationRecord already exists for the same canonical
application identity and has reached a terminal lifecycle state,
a repeated application request must return the existing
ApplicationRecord without re-executing the target consumer.

Terminal application states are authoritative for their
application identity.

A repeated request must not transition or re-execute an
APPLIED, REJECTED, FAILED, or CONFLICTED ApplicationRecord.

A request that conflicts with the canonical application identity
must be classified as a conflict and must not execute the target
consumer.

The canonical Application package owns:

- Application object creation
- Application identity
- Application lifecycle
- Application persistence
- Application registry authority

A target consumer owns target-specific execution behavior.

The Learning Application Boundary may orchestrate execution but
must not mutate the canonical Learning object.

---

## 15. Target Consumer Contract

A target consumer is an injected implementation responsible for
target-specific application behavior.

A target consumer must expose the required application operation,
such as:

- `apply()`

The consumer must not receive authority to mutate canonical
Learning state directly unless an explicit future contract grants
that authority.

Consumer results must be normalized by the Application Boundary.

Consumer outcomes must be classified as controlled application
results.

A successful consumer result may produce an `APPLIED` application
state.

A rejected or unsuccessful consumer result may produce a `FAILED`
or other contractually defined state.

Consumer exceptions must not escape as uncontrolled application
state corruption.

---

## 16. Provider Contract

AI providers operate behind the canonical AI Provider Boundary.

Provider-specific SDKs, credentials, request formats, response
formats, and provider-specific failures belong inside the provider
implementation.

Higher-level application services must not directly depend on a
provider SDK.

The AI Provider Boundary must control:

- Provider registration
- Provider selection
- Active provider resolution
- Request validation
- Provider execution delegation
- Response normalization
- Failure normalization
- Provider availability

A provider implementation must satisfy the provider contract
without forcing higher-level application architecture to become
provider-specific.

---

## 17. External API Contract

External APIs are architectural dependencies and must not be
introduced through ad-hoc integrations.

An external API may only be introduced when the Blueprint and
applicable package Contract establish a justified architectural
purpose.

Every required external API must define:

- Architectural purpose
- Owning boundary
- Integration point
- Credential requirements
- Availability behavior
- Failure behavior
- Verification strategy
- Security considerations
- Configuration requirements

For AI execution, provider APIs must be accessed through the
canonical AI Provider Boundary.

A higher-level service must not directly initialize or invoke a
provider SDK.

If an external API is required but unavailable, the framework may
still verify all contract behavior that does not require live
execution.

The repository must never claim successful live external execution
when the required credentials or service are unavailable.

---

## 18. Verification Contract

A canonical framework package is not verified merely because its
normal execution path succeeds.

Verification must establish, where applicable:

- Syntax integrity
- Required-field validation
- Canonical object creation
- Normalization behavior
- Identity behavior
- Ownership isolation
- Lifecycle behavior
- Persistence behavior
- Registry behavior
- Boundary behavior
- Integration behavior
- Failure behavior

Failure testing must explicitly attempt to violate the architectural
protections established by the package.

At minimum, critical packages must test relevant cases involving:

- Invalid input
- Missing objects
- Missing dependencies
- Unauthorized ownership
- Duplicate identity
- Identity conflict
- Invalid lifecycle transition
- Persistence failure
- Registry failure
- Integration failure
- Consumer failure
- Provider failure

A package must not be marked verified while known critical
contract protections remain untested.

---

## 19. Documentation Contract

Every verified canonical framework package must be reflected in
repository documentation.

Documentation must accurately describe:

- Package purpose
- Canonical components
- Architectural boundaries
- Ownership rules
- Identity rules
- Lifecycle rules
- Persistence rules
- Registry authority
- Integration behavior
- Failure behavior
- Verification status
- Known limitations

Documentation must not claim unverified capabilities.

If implementation behavior changes, the applicable documentation
must be updated as part of the same controlled change.

---

## 20. Change Control Contract

Changes to an established canonical contract require architectural
review before implementation.

A contract-affecting change must follow:

1. Architectural justification
2. Contract impact analysis
3. Design update
4. Implementation
5. Regression verification
6. Failure testing
7. Documentation update
8. Checkpoint
9. Commit
10. Push
11. Repository confirmation

Existing tests must not be weakened or altered merely to make a new
implementation pass.

A new feature must adapt to established canonical contracts unless
an explicit architectural change has been approved.

---

## 21. Framework Package Contract

Every new canonical framework package must define before
implementation:

- Purpose
- Architectural position
- Ownership
- Canonical object or record
- Required fields
- Identity m
        cat >> docs/CONTRACT.md <<'EOF'

 model
- Ownership model
- Lifecycle model where applicable
- Persistence model where applicable
- Registry model where applicable
- Boundary model
- Integration points
- Failure behavior
- Verification requirements

A proposed package must not be implemented as canonical until these
responsibilities have been reviewed against the Blueprint and existing
canonical domains.

If the proposed package overlaps an existing canonical responsibility,
the overlap must be resolved before implementation.

---

## 22. Canonical Framework Status Contract

A package may be described as canonical only when:

- Its architectural position is defined
- Its applicable Contract rules are defined
- Its implementation exists
- Its normal behavior is verified
- Its failure protections are tested
- Its documentation reflects the verified behavior

Repository presence alone does not establish canonical status.

Legacy services, experimental files, or historical implementations remain
non-canonical unless explicitly integrated through an approved framework
boundary.

---

## 23. Current Canonical Contract Coverage

The currently established REG-087 framework contracts cover:

- Forecast Foundation
- Evaluation Foundation
- Learning Foundation
- Profile Foundation
- Profile Boundary
- Learning Boundary
- Learning / Evaluation Boundary
- Learning Application Boundary
- AI Provider Boundary
- AI Engine Provider Integration

The canonical application foundation includes:

- ApplicationObject
- ApplicationLifecycle
- ApplicationPersistence
- ApplicationRegistry
- LearningApplicationBoundary

The canonical AI provider foundation includes:

- AIProviderBoundary
- GeminiProvider

The existence of additional legacy services does not expand this canonical
scope automatically.

---

## 24. Contract and Blueprint Relationship

The Blueprint defines the architectural principles.

This Contract defines the behavioral requirements derived from those
principles.

The Design must explain how a proposed implementation satisfies both.

Therefore:

Blueprint
→ Contract
→ Design
→ Implementation
→ Verification
→ Failure Testing

must remain the governing architectural sequence.

If an implementation conflicts with the Blueprint or Contract, the
implementation must not silently override the established rule.

The conflict must be resolved through controlled architectural change.

---

## 25. External Execution Limitation

Where a canonical provider or external dependency requires credentials or
live service availability, structural and boundary verification may proceed
without live execution when the applicable Contract permits it.

Such verification must clearly distinguish:

- Contract verification
- Integration verification
- Failure verification
- Live external execution

A successful structural test must never be represented as successful live
external execution.

For AI providers, missing credentials or unavailable provider services must
produce controlled provider failure behavior according to the Provider
Contract.

---

## 26. Memory Contract

The canonical Memory package owns durable user-scoped memory retained for
future interaction.

Memory is distinct from Learning.

Learning represents canonical learning derived from evidence, evaluation,
behavior, patterns, performance, strategy, or knowledge.

Memory represents canonical retained information belonging to a user or
approved domain context.

A legacy memory service does not become canonical merely because it stores,
extracts, ranks, retrieves, or maintains memory-like information.

### 26.1 Memory Object

A canonical Memory object must define:

- Memory identity
- Version
- User ownership
- Memory type
- Subject or semantic key
- Memory value
- Provenance where applicable
- Lifecycle state
- Creation timestamp
- Update timestamp

A Memory object must satisfy the Canonical Object Contract.

Legacy memory fields must not be promoted into canonical Memory without
architectural justification.

### 26.2 Memory Identity

Memory identity must be defined by the Memory domain.

Equivalent semantic memory for the same ownership scope must not create
uncontrolled duplicate canonical state.

Duplicate memory identity must be classified according to the applicable
Identity Contract as:

- Idempotent
- Conflict
- Invalid

Memory identity must remain stable through legitimate lifecycle updates.

An identity conflict must not silently overwrite existing canonical Memory.

### 26.3 Memory Ownership

User-scoped Memory belongs to its owning user.

Memory creation, retrieval, update, and deletion must preserve ownership.

Possession of a Memory identifier does not establish authorization.

Unauthorized access or modification must fail through the canonical Memory
boundary or registry authority.

### 26.4 Memory Types

The canonical Memory package must define an explicit set of permitted
Memory types.

Legacy categories such as identity, project, preference, goal, skill,
platform, file, task, and fact are discovery evidence only and do not
automatically become canonical Memory types.

The canonical type model must be established before implementation.

### 26.5 Memory Lifecycle

The Memory package must define:

- Initial lifecycle state
- Allowed lifecycle states
- Valid transitions
- Invalid transitions
- Terminal states

Lifecycle state must be controlled by the canonical Memory lifecycle
authority.

Higher-level components must not freely mutate Memory lifecycle state.

Terminal Memory states must remain terminal unless a future Contract
explicitly establishes a controlled transition.

### 26.6 Memory Persistence

Canonical Memory persistence is authoritative for durable Memory state.

Persistence must preserve:

- Identity
- Ownership
- Version
- Lifecycle
- Required canonical fields
- Idempotency behavior
- Conflict behavior

Memory persistence must define save, retrieval, update, deletion, duplicate,
conflict, and failure behavior.

Higher-level services must not replace canonical Memory persistence with
ad-hoc storage.

### 26.7 Memory Registry

Where a canonical Memory registry is established, it is authoritative for
Memory registration and domain-scoped retrieval.

The registry must preserve:

- Ownership
- Identity
- Duplicate handling
- Conflict handling
- Legitimate updates
- Deletion
- Cleanup

No legacy memory store may become a competing authoritative Memory registry.

### 26.8 Memory Retrieval

Memory retrieval and ranking are consumers of canonical Memory authority.

A retrieval or ranking component must not create competing authoritative
Memory state.

Retrieval must resolve Memory through the approved canonical authority.

Memory context construction must consume canonical Memory rather than
becoming an alternative Memory store.

### 26.9 Learning Integration

Memory and Learning are distinct canonical domains.

A Memory component may consume approved Learning references or results where
the future integration contract permits it.

Memory integration must not mutate canonical Learning objects directly.

Learning integration must resolve Learning through the approved Learning
authority and preserve Learning ownership, identity, lifecycle, persistence,
and registry rules.

Learning must not become an implicit competing Memory store.

### 26.10 Legacy Memory Services

The following legacy capabilities are discovery evidence only:

- Creator memory storage
- Memory extraction
- Memory ranking
- Memory retrieval
- Memory intelligence
- Creator memory profile

These services must remain non-canonical unless explicitly integrated
through an approved canonical Memory boundary.

Legacy memory services must not be treated as authoritative merely because
they already exist in the repository.

### 26.11 Memory Boundary

A canonical Memory Boundary, if required by the approved Design, must:

- Validate incoming Memory input
- Resolve approved references
- Preserve Memory identity
- Preserve user ownership
- Delegate lifecycle authority
- Delegate persistence authority
- Delegate registry authority
- Normalize controlled failures

The boundary must not become an alternative Memory store.

### 26.12 Memory Failure Behavior

Memory failure behavior must distinguish, where applicable, between:

- Invalid input
- Missing required data
- Missing Memory
- Unauthorized ownership
- Invalid reference
- Duplicate semantic identity
- Identity conflict
- Invalid lifecycle transition
- Persistence failure
- Registry failure
- Integration failure
- Unexpected internal failure

Memory failures must not silently corrupt canonical state.

A failure must not be converted into a false successful Memory result.

### 26.13 Memory Verification

Before the Memory package may be described as canonical, verification must
establish, where applicable:

- Canonical Memory creation
- Required-field validation
- Type validation
- Identity behavior
- Ownership isolation
- Lifecycle behavior
- Persistence behavior
- Registry behavior
- Boundary behavior
- Retrieval behavior
- Learning integration behavior
- Failure behavior

Failure testing must explicitly attempt to violate critical Memory protections.

The existence of legacy memory tests or successful legacy execution does not
constitute canonical Memory verification.

### 26.14 Memory External API Rule

The canonical Memory package does not require an external API merely to
establish Memory architecture.

Any future external dependency must satisfy the External API Contract and
must have an explicit architectural purpose, owning boundary, integration
point, credential requirements, availability behavior, failure behavior,
verification strategy, security considerations, and configuration
requirements.

### 26.15 Memory Documentation

Memory documentation must describe only verified canonical behavior.

Legacy memory capabilities must not be represented as canonical Memory
capabilities until the applicable Contract, Design, Implementation,
Verification, Failure Testing, and Documentation stages are complete.

## 27. Profile Contract

### 27.1 Profile Object
- The canonical Profile package owns user-scoped Profile objects representing canonical user identity and approved Profile attributes.
- A Profile object MUST contain identity, version, user ownership, type, subject, value, provenance, lifecycle, createdAt, and updatedAt.
- Profile object structure MUST remain aligned with the canonical ProfileObject implementation.
- Profile is distinct from Memory and Learning. A Profile object MUST NOT become a substitute for generic Memory or Learning records.

### 27.2 Profile Identity
- Profile identity is owned by the canonical Profile domain and MUST satisfy the generic Identity Contract.
- Profile identity MUST be deterministic and stable across legitimate lifecycle updates.
- Equivalent semantic operations MUST NOT create uncontrolled duplicate canonical Profile state.
- Identity conflicts MUST NOT silently overwrite an existing canonical Profile object.

### 27.3 Profile Attributes
- Profile attributes MUST use the canonical Profile type attribute and an explicit subject defining their semantic meaning.
- The value of an attribute MUST represent the canonical value accepted by the Profile domain.
- Legacy fields such as niche, tone, audience, writing style, creator name, and response preference are discovery evidence only and MUST NOT automatically become canonical Profile attributes.

### 27.4 Profile Ownership
- Canonical Profile state belongs to its owning user.
- User ownership MUST be preserved across Profile creation, persistence, retrieval, registration, update, and integration.
- A Profile identifier MUST NOT by itself be treated as proof of authorization to access or modify another user’s state.

### 27.5 Profile Provenance
- Profile provenance MUST identify the source of a Profile value where provenance is available.
- Provenance identifies origin but MUST NOT by itself confer canonical authority.
- Provenance MUST be preserved when Profile state is derived through an approved integration boundary.

### 27.6 Profile Lifecycle
- Profile lifecycle states MUST use the canonical Profile lifecycle: proposed, active, superseded, rejected.
- Lifecycle transitions MUST be controlled by the canonical Profile lifecycle authority.
- Lifecycle changes MUST NOT silently bypass canonical Profile persistence or registry rules.

### 27.7 Profile Authority and Precedence
- The canonical Profile domain is the authority for canonical Profile state.
- Provenance, authority, derivation, and resolution MUST remain distinct concepts.
- Legacy, inferred, learned, feedback-derived, or runtime-generated values MUST NOT silently override an authoritative canonical Profile value.
- Competing Profile values MUST be resolved through an explicit authority and precedence rule; accidental last-write-wins behavior MUST NOT establish canonical authority.

### 27.8 Profile Persistence
- Canonical Profile persistence MUST preserve Profile identity, ownership, type, subject, value, provenance, lifecycle, and version information.
- Persistence MUST NOT silently overwrite conflicting canonical Profile identity or ownership state.

### 27.9 Profile Registry
- The canonical Profile registry MUST register and retrieve canonical Profile objects without creating a competing Profile store.
- Registry operations MUST preserve Profile identity and ownership.

### 27.10 Profile Retrieval
- Canonical Profile retrieval MUST return only canonical Profile state that satisfies ownership and lifecycle rules.
- Retrieval MUST NOT silently promote legacy, inferred, learned, or runtime-derived values into canonical Profile state.

### 27.11 Learning Integration
- Profile and Learning remain distinct canonical domains.
- Learning MAY provide candidate Profile information only through an approved Profile integration boundary.
- Learning MUST NOT directly mutate Profile lifecycle, persistence, registry, or ownership state.
- Approved Learning-derived Profile values MUST retain provenance and MUST follow Profile authority and precedence rules.
- Learning integration MUST NOT establish a competing Profile store.

### 27.12 Legacy Profile/Identity Services
- Legacy Profile, Identity, Creator Profile, Creator Identity, Brand Voice, and Creator Memory services remain non-canonical unless explicitly integrated through the approved canonical Profile boundary.
- Legacy services MUST NOT become canonical merely because they store, derive, rank, retrieve, or mutate Profile-shaped information.
- Existing legacy fields and mutation paths are discovery evidence and MUST NOT be treated as canonical Profile authority without explicit contract approval.

### 27.13 Profile Boundary
- All canonical Profile reads and writes MUST cross the approved Profile boundary.
- Legacy components MUST NOT bypass the canonical Profile boundary to establish or mutate canonical Profile state.
- Boundary integration MUST preserve identity, ownership, provenance, lifecycle, and authority rules.

### 27.14 Profile Failure Behavior
- Invalid Profile type, identity, ownership, lifecycle, or required structural data MUST fail explicitly.
- Identity conflicts MUST NOT silently overwrite canonical Profile state.
- Ownership conflicts MUST NOT silently reassign or expose canonical Profile state.
- Unsupported legacy or inferred values MUST NOT be silently promoted to canonical Profile state.

### 27.15 Profile Verification
- Verification MUST cover Profile identity, ownership, attributes, provenance, lifecycle, authority and precedence, persistence, registry, retrieval, boundary behavior, Learning integration, and failure behavior.
- Verification MUST test canonical behavior rather than assumptions about legacy implementations.
- Canonical Profile verification MUST confirm that competing legacy stores cannot silently establish canonical authority.

### 27.16 Profile External API Rule
- An external API surface is NOT required merely to establish the canonical Profile architecture.
- Any future external Profile API MUST expose canonical Profile behavior without creating a competing Profile authority or bypassing canonical validation and ownership rules.

### 27.17 Profile Documentation
- Documentation MUST describe verified canonical Profile behavior, ownership, authority, lifecycle, integration boundaries, and failure behavior.
- Legacy behavior MUST be documented as legacy unless it has been explicitly incorporated through the canonical Profile contract.

## 28. Context Contract

The canonical Context package owns interaction-scoped conversational state and continuity. Context MUST remain distinct from Memory, Profile, Learning, Creator Intelligence, Skill Routing, and Application state.

### 28.1 Ownership and Scope
Context MUST have explicit user ownership through `userId` and explicit interaction scope through `interactionId`. The `interactionId` MUST be supplied by the caller; Context MUST NOT invent or import legacy conversation or session identifiers.

### 28.2 Interaction State
Context MAY contain interaction history and continuity state required across turns. Such state MUST NOT silently become durable Memory, Profile attributes, Learning objects, routing decisions, or Application records.

### 28.3 Identity
Context identity is owned by the Context domain and is defined by the combination of `userId` and `interactionId`.

The canonical identity key MUST be deterministic and stable and MUST use SHA-256 over the ordered identity components. The public `context.id` MUST be deterministically derived from the same identity and MUST NOT depend on uncontrolled randomness or wall-clock uniqueness.

A Context identity MUST remain immutable after creation. Attempts to change `userId` or `interactionId` MUST fail. Identity collisions MUST be rejected.

### 28.4 Lifecycle
Context uses the lifecycle states `active` and `closed`.

The only state transition is `active → closed`. `closed` is terminal and MUST NOT transition back to `active`. Repeating an already-applied transition MUST be handled idempotently. Invalid transitions MUST fail without mutating the stored Context.

Lifecycle authority MUST remain separate from ordinary Context content updates.

### 28.5 Persistence and Versioning
Canonical Context persistence is authoritative for stored Context state. Persistence MUST preserve deterministic identity, ownership, immutable identity fields, lifecycle integrity, and canonical timestamps.

Ordinary Context content updates MUST use optimistic version checking. A caller MUST provide the expected current version, and a successful content update MUST advance the version by one. Stale versions MUST fail without overwriting newer state.

Lifecycle transitions MUST preserve the Context version and MUST be persisted through the dedicated lifecycle persistence operation.

### 28.6 Registry
No Context Registry is required at this stage. Context Persistence and the Context Boundary provide the canonical storage and access authority. A registry MUST NOT be introduced unless a future architectural requirement establishes a need for domain-wide Context registration or retrieval authority.

### 28.7 Boundary
The Context Boundary is the canonical cross-domain entry point for Context creation, retrieval, content updates, lifecycle transitions, listing, and deletion.

The Boundary MUST enforce user ownership and MUST prevent callers from mutating canonical fields such as `id`, `userId`, `interactionId`, `schemaVersion`, `createdAt`, and `lifecycle` through ordinary content updates.

### 28.8 Legacy Services
Legacy context, conversation, timeline, and history services are not canonical merely because they exist or store conversational data. No migration or deletion is implied.

### 28.9 Design Decisions Reserved
Future Context decisions concerning retention, history limits, summarization, context-window management, external APIs, migration, and broader conversation/thread models remain subject to architectural evaluation and explicit design approval.


## 29. Final Canonical Contract Rule

The ChatTBM Contract establishes the following mandatory rule:

Canonical objects and records must have explicit contracts.

Canonical domains must retain ownership authority.

Identity must remain protected.

Lifecycle transitions must be controlled.

Persistence must preserve canonical state.

Registries must remain authoritative.

Boundaries must control cross-domain interaction.

References must be validated and ownership-protected.

Integrations must delegate rather than become competing authorities.

Target consumers must remain separated from canonical domain ownership.

AI providers must remain behind the AI Provider Boundary.

External APIs require architectural justification.

Failures must be explicit and controlled.

Verification must prove both behavior and protection.

Documentation must reflect verified reality.

Changes to established architecture must follow controlled change management.

No repository file, service, feature, or legacy implementation becomes
canonical merely because it 
exists in the repository.

This Contract is therefore the detailed behavioral authority beneath the
ChatTBM Framework Blueprint and above individual package designs and
implementations.

