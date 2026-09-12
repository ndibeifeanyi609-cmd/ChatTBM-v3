# Software-Building Assistant Design

## 1. Package Structure

The first implementation uses `softwareBuilder/`:

- `SoftwareBuildRequest.js` — request validation and normalization.
- `BuildObjective.js` — transient controlled build objective.
- `BuildPlan.js` — transient structured build plan.
- `SoftwareBuildingAssistant.js` — orchestration.
- `SoftwareBuildingBoundary.js` — capability boundary.
- `SoftwareBuildingAssistant.test.js` — direct Node verification.

No Project, Workspace, Tool, Action, or Verification package is created.

## 2. Responsibilities

`SoftwareBuildRequest` validates and normalizes input only. It does not execute operations or own persistent state.

`BuildObjective` represents requested build intent and keeps intent distinct from executable operations.

`BuildPlan` represents the structured sequence derived from the objective. Steps remain descriptive and controlled until an approved execution boundary exists.

`SoftwareBuildingAssistant` creates objectives and plans, coordinates approved steps, delegates through established AI execution where required, and normalizes failures. It MUST NOT bypass Assistant Engine, AI Engine, or AI Provider Boundary.

`SoftwareBuildingBoundary` controls access, rejects malformed requests, and prevents unauthorized consequential operations.

## 3. Identity and Ownership

Build objectives and plans are transient orchestration records, not canonical durable domains.

Each build operation MUST have a deterministic `operationId` supplied by the approved caller or boundary. Objective and plan identities are derived from that operation identifier.

Ownership MUST remain tied to the approved caller/user context supplied at the boundary.

No registry or persistent identity store is introduced.

## 4. Data Flow

Request
→ SoftwareBuildRequest
→ SoftwareBuildingBoundary
→ BuildObjective
→ BuildPlan
→ approved operation boundary
→ operation result
→ controlled assistant result

A plan MUST exist before consequential operations are requested.

Requested intent, planned operations, completed operations, and verified results remain distinct.

## 5. Authority Flow

Application/UI or approved caller
→ SoftwareBuildingBoundary
→ SoftwareBuildingAssistant
→ Assistant Engine / AI Engine when model execution is required
→ AI Provider Boundary

The Software-Building Assistant does not become provider authority.

Context, Memory, Profile, and Learning remain owned by their canonical domains and are accessed only through approved boundaries.

## 6. Execution Boundary

The first implementation provides NO unrestricted filesystem, shell, process, network, or external execution capability.

Therefore the assistant may plan and coordinate build work but MUST NOT claim that unperformed execution occurred.

Any future consequential execution MUST cross an explicitly approved Tool/Action boundary.

## 7. Failure Flow

Failures remain explicit and controlled:

- Invalid request → validation failure.
- Invalid objective → objective failure.
- Empty/invalid plan → planning failure.
- Unsupported operation → unsupported-operation failure.
- Unauthorized operation → authorization failure.
- Missing execution capability → capability-unavailable failure.
- Delegated failure → normalized build failure.
- Unverified result → never reported as verified success.

No failure may produce false success.

## 8. Integration

The assistant integrates upward with approved application callers.

Model reasoning delegates through the established Assistant Engine / AI execution path.

Context, Memory, Profile, and Learning may be consumed only through canonical boundaries.

Provider SDKs are never imported directly.

## 9. Verification and Failure Testing

Direct Node verification MUST cover:

- Request validation and normalization.
- Objective creation and identity.
- Plan structure and ordering.
- Ownership enforcement.
- Boundary enforcement.
- Delegation behavior.
- Unsupported-operat
ation rejection.
- Unauthorized-operation rejection.
- Capability-unavailable behavior.
- Delegated failure normalization.
- False-success prevention.
- Isolation from Project/Workspace/Tool/Action/Verification authority.

Failure testing MUST attempt prohibited execution and authority bypasses.

## 10. Design Constraints

The first implementation is orchestration-focused.

It MUST NOT introduce:

- Persistent Project or Workspace state.
- Arbitrary filesystem access.
- Shell/process execution.
- Provider SDK usage.
- A competing registry.
- A Verification Engine.
- A Tool/Action Engine.
- Direct mutation of Context, Memory, Profile, or Learning.

Any future canonical Project, Workspace, Tool, Action, Verification, or persistent build-state authority requires separate architectural review, Contract impact analysis, Design, implementation, verification, and failure testing.
