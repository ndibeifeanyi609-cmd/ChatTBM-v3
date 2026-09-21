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
- Identity model
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

The currently established framework contracts cover:

- Forecast Foundation
- Evaluation Foundation
- Learning Foundation
- Memory Foundation
- Profile Foundation
- Context Foundation
- Conversation Contract
- Chat Interaction Boundary
- Intelligence Orchestration
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

The canonical application capabilities include:

- Software-Building Assistant (§29)

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


## 29. Software-Building Assistant Contract

The Software-Building Assistant is an application capability for controlled software-building assistance. It MUST extend established framework authority without creating competing canonical domains or bypassing existing boundaries.

### 29.1 Architectural Position
It operates above the established Assistant Engine and AI execution path and MUST NOT bypass the Assistant Engine, AI Engine, or AI Provider Boundary.

### 29.2 Responsibility
It MAY interpret software-building requests, create structured build objectives and plans, coordinate approved build steps, maintain transient build-operation state, and normalize build-specific failures.

### 29.3 Authority Exclusions
It MUST NOT own canonical Context, Memory, Profile, Learning, Application, Project, Workspace, Tool, Action, or Verification state. It MUST NOT own provider SDKs, credentials, arbitrary filesystem authority, shell/process authority, or provider state.

### 29.4 Project and Workspace
The first implementation MUST NOT establish canonical Project or Workspace persistence. Any future canonical Project or Workspace domain requires separate architectural justification, Contract, Design, implementation, verification, and failure testing.

### 29.5 Build Planning
A build request MUST become a controlled objective and structured plan before consequential operations. Requested intent MUST remain distinct from authorized and available operations.

### 29.6 Tool and Action Boundary
It MUST NOT provide unrestricted filesystem, shell, process, network, or external execution authority. Consequential actions MUST cross an explicitly approved boundary.

### 29.7 Verification Boundary
It MAY coordinate verification but MUST NOT become the canonical Verification Engine.

### 29.8 Context and Memory
It MAY consume approved Context, Memory, Profile, or Learning information through canonical boundaries but MUST NOT directly mutate or promote interaction state into durable canonical state.

### 29.9 Failure Behavior
Invalid requests, unsupported operations, unauthorized actions, unavailable capabilities, and delegated failures MUST produce explicit controlled failures. It MUST NOT report false success.

### 29.10 Verification
Verification MUST cover request validation, build objectives, plan structure, delegation, ownership isolation where applicable, unsupported operations, unauthorized-execution protection, failure normalization, and false-success prevention.

### 29.11 Legacy Rule
Legacy CodingSkill, SkillRouter, ProblemSolvingSkill, editorBrain, offlineBrain, and related behavior are not canonical merely because they exist. Reuse requires an approved architectural boundary.

### 29.12 Change Control
Changes establishing canonical Project, Workspace, Tool, Action, Verification, or persistent build-state authority MUST undergo architectural review and Contract impact analysis before implementation.

## 30. Chat Interaction Boundary Contract

The Chat Interaction Boundary is the canonical application-level boundary for coordinating a normal ChatTBM interaction across established framework authorities.

It MUST coordinate existing canonical boundaries without creating competing domain ownership, persistent interaction authority, or an alternative assistant execution path.

### 30.1 Architectural Position
The Chat Interaction Boundary operates between the Chat HTTP/application surface and established canonical framework boundaries.

The canonical interaction path is:

HTTP/Application
→ Chat Interaction Boundary
→ approved domain boundaries
→ Assistant Engine
→ AI Engine
→ AI Provider Boundary

The Chat Interaction Boundary MUST NOT bypass the Assistant Engine, AI Engine, or AI Provider Boundary.

It MUST NOT become a replacement for the Assistant Engine or an Intelligence Orchestration domain.

### 30.2 Canonical Interaction Request
A canonical Chat Interaction request MUST contain:

- `userId`
- `interactionId`
- `message`

`userId` identifies the owning user.

`interactionId` identifies the interaction being coordinated.

`message` contains the user-provided interaction input.

The Boundary MUST preserve the supplied `userId` and `interactionId` without silently replacing, regenerating, or reassigning them.

The caller is responsible for establishing the interaction identity.

### 30.3 Context Coordination
The Chat Interaction Boundary MUST use the canonical Context Boundary for Context operations.

It MUST NOT directly access Context persistence or introduce competing Context storage.

Context ownership MUST remain with the Context domain.

The Boundary MUST preserve the relationship between `userId` and `interactionId` when resolving or coordinating Context.

A missing, invalid, unavailable, or unauthorized Context operation MUST produce a controlled failure rather than silently creating competing interaction state.

### 30.4 Assistant Delegation
Assistant generation MUST be delegated through the established Assistant Engine.

The Chat Interaction Boundary MUST NOT access AI provider SDKs directly.

It MUST NOT own provider credentials, provider state, AI execution state, or competing assistant execution logic.

The Assistant Engine remains responsible for assistant request validation, AI request construction, AI delegation, and assistant failure normalization within its established authority.

### 30.5 Approved Domain Integration
The Boundary MAY coordinate approved Memory, Profile, or Learning information when an applicable canonical boundary explicitly provides that capability.

Any such information MUST be resolved through its owning canonical boundary.

The Chat Interaction Boundary MUST NOT directly access or mutate Memory, Profile, Learning, Forecast, Evaluation, Application, or other canonical domain persistence.

The Boundary MUST NOT promote transient interaction information into durable canonical state without the owning domain’s approved authority.

### 30.6 Intelligence Orchestration Exclusion
The Chat Interaction Boundary MUST NOT become a canonical Intelligence Orchestration domain.

It MUST NOT establish a competing intelligence registry, intelligence persistence layer, intelligence lifecycle, or intelligence-owned state.

Future Intelligence Orchestration requires separate architectural justification, Contract, Design, implementation, verification, and failure testing.

### 30.7 HTTP Boundary Relationship
The Chat Controller and Chat Route remain transport/application-surface concerns.

The Chat Route MUST remain a thin route to the appropriate handler.

The Chat Controller MUST translate HTTP input and results without becoming the owner of Context, Memory, Profile, Learning, AI provider, or interaction state.

The Chat Interaction Boundary is the canonical coordination authority for the interaction itself.

### 30.8 Ownership and Identity Protection
The Boundary MUST preserve canonical identity supplied by owning domains.

It MUST validate references before using them.

It MUST preserve user ownership when coordinating Context or other user-scoped canonical domains.

It MUST NOT mutate another domain’s canonical identity, lifecycle, persistence, or registry authority.

### 30.9 Failure Behavior
Invalid interaction requests, missing identity, invalid interaction identity, Context failures, ownership violations, unavailable capabilities, delegated Assistant failures, and unexpected coordination failures MUST produce explicit controlled failures.

A partial or failed delegated operation MUST NOT be represented as successful interaction completion.

The Boundary MUST distinguish controlled application failure from successful AI execution.

Live external provider execution MUST remain subject to the External Execution Limitation.

### 30.10 Verification
Verification MUST cover:

- required `userId`
- required `interactionId`
- message validation
- interaction identity preservation
- Context Boundary delegation
- Context ownership protection
- Assistant Engine delegation
- AI Provider Boundary preservation
- approved domain integration behavior
- Intelligence Orchestration separation
- HTTP/controller separation
- controlled failure normalization
- unavailable capability behavior
- false-success prevention

Verification MUST distinguish structural, integration, failure, and live external execution according to the External Execution Limitation.

### 30.11 Legacy Rule
Legacy conversation, history, timeline, assistant, intelligence, routing, and related services are not canonical merely because they exist or contain interaction-like behavior.

Reuse MUST occur through an approved architectural boundary.

Legacy storage MUST NOT become canonical Chat Interaction persistence without explicit architectural approval.

### 30.12 Change Control
The Chat Interaction Boundary MUST remain a coordination boundary unless a future architectural decision explicitly establishes additional canonical authority.

Changes introducing canonical Conversation, Thread, interaction-history persistence, orchestration state, intelligence state, or additional execution authority MUST undergo architectural review and Contract impact analysis before implementation.

The Boundary MUST NOT silently expand its authority to compensate for missing future domains.

## 31. Final Canonical Contract Rule

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

## 32. Conversation Contract

The canonical Conversation domain owns user-scoped conversational containers
that organize related interactions while remaining distinct from interaction-
scoped Context, durable Memory, Profile, Learning, Skills, and Intelligence
Orchestration.

### 32.1 Architectural Position

Conversation is a canonical domain above individual interaction-scoped Context.

Conversation MUST integrate with established canonical domains through their
approved boundaries.

Conversation MUST NOT bypass the Context Boundary, Memory Boundary, Profile
Boundary, Learning authority, Assistant Engine, AI Engine, or AI Provider
Boundary.

Conversation MUST NOT become an Intelligence Orchestration domain.

### 32.2 Responsibility

The canonical Conversation domain MAY own:

- Conversation identity
- User ownership
- Conversation lifecycle
- Conversation-level metadata explicitly defined by the canonical contract
- Explicit ordered references to associated interaction Context records

Conversation MUST NOT own the internal state of an associated Context.

Conversation MUST NOT become a substitute for Context, Memory, Profile,
Learning, Skills, or Intelligence state.

A Conversation record MUST represent the conversational container and its
approved relationships, not arbitrary copies of state owned by other domains.

### 32.3 Ownership

Every canonical Conversation MUST have explicit user ownership through
`userId`.

Conversation ownership MUST be preserved across creation, retrieval, updates,
lifecycle transitions, persistence, references, and deletion.

A Conversation identifier MUST NOT by itself be treated as authorization to
access or modify another user's Conversation.

Ownership conflicts MUST fail explicitly.

Conversation MUST NOT silently reassign ownership.

### 32.4 Identity

Conversation identity is owned by the canonical Conversation domain.

Conversation identity MUST be deterministic and stable across legitimate
content and lifecycle updates.

The identity model MUST distinguish the owning `userId` from the unique
Conversation identifier.

A Conversation identity MUST remain immutable after creation.

Attempts to change canonical identity or `userId` MUST fail.

Identity collisions MUST be rejected rather than silently overwritten.

Conversation identity MUST remain distinct from Context identity.

Context identity remains defined by the canonical Context contract as the
combination of `userId` and `interactionId`.

### 32.5 Conversation and Context Relationship

A Conversation MAY contain ordered references to interaction-scoped Context
records where the approved Design establishes such a relationship.

Conversation MAY reference Context identity, but MUST NOT take ownership of
Context state.

Context remains authoritative for interaction-scoped state, continuity,
content updates, and Context lifecycle.

A Context MUST NOT silently establish, mutate, or delete canonical Conversation
state merely because an interaction occurs.

Conversation operations involving Context MUST resolve through the approved
Context authority where Context state or ownership must be verified.

Invalid, missing, conflicting, or unauthorized Context references MUST fail
explicitly.

A Conversation MUST NOT duplicate Context-owned conversational state merely
to create an alternative authoritative history.

### 32.6 Lifecycle

Conversation lifecycle MUST be explicitly defined by the canonical
Conversation lifecycle authority.

Lifecycle transitions MUST be controlled and deterministic.

A lifecycle transition MUST NOT silently mutate Conversation identity or
ownership.

Invalid lifecycle transitions MUST fail without corrupting canonical
Conversation state.

Repeated application of an already-applied valid terminal transition SHOULD
be handled idempotently where the approved Design permits it.

Conversation lifecycle MUST remain distinct from Context lifecycle.

Closing a Context MUST NOT implicitly close its Conversation.

Closing a Conversation MUST NOT silently rewrite, invalidate, or mutate
associated Context records unless an explicit future contract authorizes that
behavior.

### 32.7 Persistence and Versioning

Canonical Conversation persistence MUST be authoritative.

Persistence MUST preserve canonical Conversation identity, ownership,
lifecycle, timestamps, approved metadata, validated Context references, and
version state.

Persistence conflicts MUST fail explicitly.

Ordinary mutable Conversation content MUST use controlled version checking
where optimistic concurrency is required by the approved Design.

Stale updates MUST fail rather than silently overwrite newer canonical state.

Conversation persistence MUST NOT become an alternative authority for Context,
Memory, Profile, Learning, or Intelligence state.

### 32.8 Registry

A Conversation Registry MAY be established only if the approved Design
demonstrates a clear architectural need.

If established, the Conversation Registry MUST be authoritative for the
responsibilities assigned to it.

Registry behavior MUST preserve identity, ownership, duplicate detection,
conflict handling, and deletion or cleanup semantics defined by the approved
Design.

No competing Conversation registry or store may become authoritative.

If a separate Registry is not required, canonical Conversation Persistence
and the Conversation Boundary remain the authoritative mechanisms for the
responsibilities assigned to them.

### 32.9 Boundary

A canonical Conversation Boundary MUST be the approved cross-domain entry
point for Conversation operations established by the approved Design.

Where supported, those operations MAY include creation, retrieval, update,
lifecycle transition, Context relationship management, listing, and deletion.

All canonical Conversation reads and writes MUST cross the approved
Conversation Boundary.

The Boundary MUST enforce identity, ownership, immutable identity fields,
lifecycle rules, valid Context references, version rules, and controlled
failure behavior.

The Conversation Boundary MUST NOT directly take ownership of state belonging
to another canonical domain.

Cross-domain operations MUST delegate to the owning authority.

### 32.10 Memory, Profile, Learning, and Context Separation

Conversation, Context, Memory, Profile, and Learning remain distinct
canonical domains with separate ownership authority.

Conversational content MUST NOT be promoted into durable Memory, Profile, or
Learning state without an approved integration.

Memory, Profile, and Learning MUST NOT directly mutate canonical Conversation
state.

Context content MUST NOT silently become Conversation metadata.

Conversation metadata MUST NOT silently become Context, Memory, Profile, or
Learning state.

### 32.11 Legacy Services

Legacy conversation, conversation history, conversation timeline,
conversation-memory, offline-brain, and related services discovered during
architectural discovery remain noncanonical unless explicitly incorporated
through an approved canonical boundary.

Legacy existence, successful execution, or existing callers MUST NOT grant
canonical authority.

No migration or deletion of legacy services is implied by this Contract.

Browser `localStorage` conversation history and transient in-memory
conversation timelines MUST NOT become canonical Conversation persistence
without explicit architectural approval.

### 32.12 Failure Behavior

Canonical Conversation operations MUST explicitly control failures involving:

- Invalid input
- Missing required data
- Invalid identity
- Unauthorized ownership
- Missing Conversation
- Duplicate identity
- Identity conflict
- Invalid or unauthorized Context reference
- Invalid lifecycle transition
- Stale version
- Persistence failure
- Registry failure where a Registry exists
- Integration failure
- Unexpected internal failure

Failures MUST NOT produce corrupt canonical state.

Failures MUST NOT be reported as false success.

Unavailable future capabilities MUST fail in a controlled and explicit manner.

### 32.13 Verification

Conversation verification MUST prove, as applicable:

- Required fields
- Identity determinism and immutability
- Ownership protection
- Lifecycle behavior
- Persistence behavior
- Version and stale-update protection
- Registry behavior where a Registry exists
- Context reference validation
- Context ownership protection
- Conversation Boundary behavior
- Separation from Memory, Profile, Learning, Context, Skills, and Intelligence
- Controlled failure behavior
- Protection against legacy services becoming competing authority

Verification MUST include failure testing for ownership, identity, lifecycle,
persistence, reference, concurrency, boundary, and integration failures where
those behaviors exist.

Structural verification, integration verification, failure verification, and
live external-service verification MUST remain distinct.

Successful behavior in a legacy service MUST NOT be treated as verification of
canonical Conversation behavior.

### 32.14 External API Rule

No external API is required merely to establish the canonical Conversation
architecture.

Any future external API integration MUST be introduced through an approved
Conversation Boundary and must define its purpose, ownership, integration
model, authorization, availability assumptions, failure behavior, verification
requirements, security considerations, and configuration.

No ad-hoc external API may become a competing Conversation authority.

### 32.15 Reserved Future Decisions

The following remain separate architectural decisions and MUST NOT be
implicitly introduced by the Conversation implementation:

- Conversation-to-Thread modeling
- Retention policy
- Conversation history limits
- Summarization
- Context-window management
- Conversation search or indexing
- Folders or categorization
- Archiving
- Sharing
- Multi-device synchronization
- Export and import
- Conversation analytics
- External APIs
- Legacy migration
- Automatic Conversation creation
- Automatic Context membership
- Conversation-level intelligence
- Conversation-level orchestration

Legacy behavior MUST NOT be treated as approval for any of these decisions.

### 32.16 Change Control

Changes that introduce or materially alter canonical Conversation state,
Conversation persistence, Conversation Registry authority, Thread authority,
interaction-history persistence, automatic Context membership, or additional
Conversation execution authority MUST undergo architectural review and
Contract impact analysis.

No such authority may be introduced through an implementation detail,
legacy reuse, or ad-hoc integration.


---

## 33. Intelligence Orchestration Contract

### 33.1 Architectural Position

Intelligence Orchestration is a canonical coordination capability that operates between approved canonical domain boundaries and the Assistant Engine.

Its purpose is to coordinate approved intelligence inputs, compose a controlled intelligence operation, and produce a structured orchestration result for an approved downstream consumer.

Intelligence Orchestration MUST NOT replace the Assistant Engine, AI Engine, or AI Provider Boundary.

Intelligence Orchestration MUST NOT become an alternative owner of Memory, Profile, Learning, Context, Conversation, Forecast, Evaluation, Application, Project, Workspace, Tool, Action, or Verification state.

### 33.2 Responsibility

The canonical Intelligence Orchestration capability MAY:

- validate an orchestration request
- preserve user and operation identity
- resolve approved intelligence inputs through owning canonical boundaries
- coordinate multiple approved intelligence inputs
- compose a transient orchestration context
- produce a structured intelligence result
- coordinate approved downstream execution
- normalize orchestration-specific failures

Intelligence Orchestration MUST distinguish:

- requested intent
- available information
- authorized operations
- composed intelligence
- delegated execution
- completed execution
- verified results

Intelligence Orchestration MUST NOT claim completion merely because an orchestration plan or delegated request was created.

### 33.3 Canonical Orchestration Request

A canonical Intelligence Orchestration request MUST contain:

- `userId`
- `operationId`
- `input`

`userId` identifies the owning user.

`operationId` identifies the orchestration operation.

`input` contains the request requiring intelligence coordination.

The Intelligence Orchestration Boundary MUST preserve supplied identity without silently replacing, regenerating, or reassigning it.

The canonical request MUST NOT contain embedded copies of canonical domain state that are treated as authoritative.

Where domain information is required, it MUST be resolved through the owning canonical boundary.

### 33.4 Ownership and Identity

Intelligence Orchestration owns the orchestration operation and its transient coordination state only.

It MUST NOT own the canonical state represented by an intelligence input.

Canonical domain identity remains authoritative within the owning domain.

Intelligence Orchestration MUST preserve user ownership across all approved domain interactions.

An orchestration operation MUST NOT use information belonging to another user or silently substitute another user's canonical state.

Identity fields defining the orchestration operation MUST remain immutable after creation.

### 33.5 Lifecycle

An Intelligence Orchestration operation MAY use a transient lifecycle:

- `requested`
- `resolving`
- `composed`
- `completed`
- `failed`

Only valid lifecycle transitions defined by the approved Design MAY occur.

A failed operation MUST NOT be represented as completed.

A completed orchestration operation MUST represent only work actually completed by the orchestration capability and its approved delegates.

Lifecycle state is coordination state and MUST NOT become a substitute for the lifecycle authority of another canonical domain.

### 33.6 State and Persistence

The first canonical Intelligence Orchestration implementation MUST use transient operation state only.

No canonical Intelligence Persistence layer is established by this Contract.

Intelligence Orchestration MUST NOT persist copies of Memory, Profile, Learning, Context, Conversation, Forecast, Evaluation, or other canonical domain state.

Transient orchestration state MUST NOT silently become durable canonical state.

Any future requirement for durable intelligence state requires separate architectural justification and Contract impact analysis.

### 33.7 Registry

The first canonical Intelligence Orchestration implementation MUST NOT establish an Intelligence Registry.

Operation identity MUST be enforced by the Intelligence Orchestration Boundary and the approved transient operation mechanism.

A future Intelligence Registry MAY be established only when architectural discovery demonstrates a clear canonical need.

No competing intelligence registry or in-memory store may become an alternative canonical authority.

### 33.8 Boundary

A canonical Intelligence Orchestration Boundary MUST be the approved entry point for Intelligence Orchestration operations.

All canonical Intelligence Orchestration operations MUST cross the approved Boundary.

The Boundary MUST enforce:

- request validity
- operation identity
- user ownership
- lifecycle validity
- approved domain references
- controlled integration
- failure normalization
- false-success prevention

The Boundary MUST NOT directly take ownership of another canonical domain's state.

Cross-domain operations MUST delegate to the owning authority.

### 33.9 Approved Domain Integration

Intelligence Orchestration MAY consume information from approved canonical domains only through their established canonical boundaries.

Approved domain integration MUST preserve the ownership and authority of the supplying domain.

Intelligence Orchestration MUST NOT directly mutate canonical Memory, Profile, Learning, Context, Conversation, Forecast, Evaluation, or Application state.

Where an approved domain boundary provides information, Intelligence Orchestration MAY compose that information into transient orchestration state without becoming its owner.

Cross-domain integration MUST be explicit and MUST NOT create an implicit dependency that bypasses an established canonical boundary.

If a required domain capability does not have an approved canonical boundary, Intelligence Orchestration MUST NOT create an ad-hoc substitute for that boundary.

### 33.10 Assistant and AI Relationship

Intelligence Orchestration MUST remain separate from the Assistant Engine.

When an orchestration operation requires assistant generation, Intelligence Orchestration MUST delegate through the established Assistant Engine boundary.

Intelligence Orchestration MUST NOT bypass the Assistant Engine to call the AI Engine directly.

The Assistant Engine remains responsible for assistant request validation, request construction, AI execution delegation, and controlled assistant failures within its established boundary.

The AI Engine remains responsible for AI execution through the established AI Provider Boundary.

Intelligence Orchestration MUST NOT access provider SDKs, provider credentials, or provider-specific execution state directly.

Intelligence Orchestration MAY prepare approved intelligence inputs for downstream assistant execution, but it MUST NOT become an alternative assistant or AI execution authority.

### 33.11 Legacy Intelligence Services

Existing intelligence-related services, including legacy response, fusion, brain, strategy, prediction, memory-intelligence, and intelligence-core implementations, MUST NOT be treated as canonical Intelligence Orchestration merely because they perform orchestration-like behavior.

Legacy implementations MAY be used as architectural discovery references, but they MUST NOT establish competing canonical identity, lifecycle, persistence, registry, or ownership authority.

The canonical Intelligence Orchestration implementation MUST NOT reproduce legacy cross-domain state ownership merely to preserve historical behavior.

Any reuse of legacy intelligence behavior MUST occur through an approved canonical boundary and MUST preserve the ownership rules established by this Contract.

Legacy intelligence services MUST NOT bypass the Intelligence Orchestration Boundary, Assistant Engine, AI Engine, or AI Provider Boundary.

### 33.12 Failure Behavior

Intelligence Orchestration MUST return controlled failures when an orchestration request cannot be validated, resolved, composed, delegated, or completed.

Failure results MUST preserve the orchestration operation identity where that identity was successfully established.

The Boundary MUST normalize orchestration-specific failures without exposing provider credentials, internal secrets, or uncontrolled implementation details.

A failure resolving an approved canonical domain MUST NOT be represented as successful intelligence composition.

A failure during downstream assistant or AI execution MUST NOT be represented as successful assistant execution.

A failed orchestration operation MUST remain distinguishable from a completed operation.

Intelligence Orchestration MUST NOT fabricate intelligence, execution results, verification results, or completion status when an approved dependency fails or required information is unavailable.

### 33.13 Verification

The canonical Intelligence Orchestration implementation MUST verify:

- canonical request validation
- immutable operation identity
- user ownership enforcement
- valid lifecycle transitions
- transient operation-state behavior
- absence of unauthorized persistence
- absence of an Intelligence Registry
- approved canonical-boundary integration
- separation from Assistant Engine and AI execution authority
- controlled failure behavior
- false-success prevention
- legacy intelligence-service non-authority

Verification MUST include successful orchestration paths and controlled failure paths.

Failure testing MUST demonstrate that invalid identity, ownership violations, invalid lifecycle transitions, unavailable canonical inputs, downstream execution failures, and incomplete operations cannot produce false successful results.

Verification MUST NOT require live external provider execution when the established provider boundary cannot execute because credentials or external access are unavailable.

### 33.14 External API Rule

Intelligence Orchestration MUST NOT introduce direct external API or provider execution outside the established AI Provider Boundary.

Any future external intelligence service integration MUST have explicit architectural justification and MUST preserve the approved provider and execution boundaries.

External credentials MUST NOT be stored in Intelligence Orchestration state or embedded in orchestration requests, objects, or results.

Absence of external credentials MUST produce a controlled unavailable-dependency result rather than simulated or fabricated external execution.

External execution MUST remain distinguishable from orchestration composition and MUST NOT be represented as completed when it was not actually executed.

### 33.15 Reserved Future Decisions

The following remain separate architectural decisions and MUST NOT be implicitly introduced by the first Intelligence Orchestration implementation:

- durable Intelligence state
- Intelligence Persistence
- Intelligence Registry
- Intelligence history or search
- intelligence analytics
- autonomous execution
- autonomous tool or action authority
- Project authority
- Workspace authority
- Tool authority
- Action authority
- Verification Engine authority
- new canonical Strategy, Voice, Audience, Growth, or Decision domains
- external intelligence providers outside the established provider boundary
- provider-specific orchestration state
- unrestricted filesystem, shell, process, or network execution

Legacy intelligence behavior MUST NOT be treated as approval for any of these decisions.

Any such capability MUST undergo separate architectural discovery and Contract impact analysis before implementation.

### 33.16 Change Control

Changes that introduce or materially alter canonical Intelligence Orchestration state, orchestration identity, lifecycle authority, persistence, registry authority, cross-domain execution authority, autonomous execution, or provider execution MUST undergo architectural review and Contract impact analysis.

No such authority may be introduced through legacy reuse, an implementation detail, an ad-hoc integration, or an unapproved downstream consumer.

Changes to the relationship between Intelligence Orchestration and the Assistant Engine, AI Engine, or AI Provider Boundary MUST also undergo Contract impact analysis before implementation.

The first Intelligence Orchestration implementation MUST remain within the responsibility, ownership, lifecycle, persistence, registry, boundary, failure, verification, and external API constraints defined by this Contract.
