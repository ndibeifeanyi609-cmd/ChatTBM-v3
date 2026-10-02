# REG-096 Payment & Subscription Foundation Design

Status: Design

## 1. Purpose

REG-096 establishes the canonical Payment & Subscription Foundation for
ChatTBM.

The foundation provides controlled ownership of payment transaction state,
subscription state, and commercial entitlement state.

It does not perform external payment execution by itself.

## 2. Architectural Position

Payment & Subscription is a canonical domain responsible for commercial
entitlement state.

It operates independently of any specific external payment provider.

External providers MUST integrate through approved provider boundaries.

Initial intended providers:

- Flutterwave for web payments
- Apple In-App Purchase for iOS payments

Provider availability is not required for initial foundation verification.

## 3. Canonical Responsibility

The domain MAY own:

- Payment transaction identity
- Subscription identity
- Entitlement identity
- User ownership
- Provider references
- Normalized payment state
- Normalized subscription state
- Entitlement state
- Lifecycle transitions
- Persistence
- Registry authority
- Provider event normalization

The domain MUST NOT own:

- User authentication
- User profile state
- Conversation state
- AI state
- Provider credentials
- Provider SDK execution
- Apple StoreKit UI
- Flutterwave UI
- External provider internal state

## 4. Core Objects

### Payment Transaction

Represents a normalized payment operation associated with a user and provider.

### Subscription

Represents the user's commercial subscription relationship.

### Entitlement

Represents the access granted by ChatTBM based on verified subscription
state.

### Provider Reference

Represents the external provider's transaction or subscription identifier
without making the provider authoritative over ChatTBM state.

## 5. Ownership

Every canonical payment, subscription, and entitlement record MUST have
explicit user ownership.

Ownership MUST remain immutable after creation.

Cross-user access or ownership reassignment MUST fail.

## 6. Identity

Canonical identities MUST be stable and immutable.

Provider transaction identifiers MUST NOT replace ChatTBM canonical identity.

Duplicate provider events MUST be classified and handled idempotently.

Identity conflicts MUST fail explicitly.

## 7. Lifecycle

Payment, subscription, and entitlement lifecycle states MUST be explicitly
defined by the Contract.

Invalid transitions MUST be rejected.

Terminal states MUST remain terminal unless a future Contract explicitly
defines a controlled transition.

## 8. Persistence

Canonical payment state MUST be persisted through the canonical Payment &
Subscription persistence component.

External provider state MUST NOT become competing ChatTBM persistence
authority.

Persistence MUST preserve:

- identity
- ownership
- lifecycle state
- provider references
- idempotency
- conflict behavior

## 9. Registry

The canonical Payment & Subscription registry MUST provide authoritative
registration and retrieval.

The registry MUST enforce:

- identity uniqueness
- user ownership
- lifecycle-controlled updates
- provider-reference conflict protection

## 10. Boundary

All external payment-provider interaction MUST enter through the approved
Payment Boundary.

Higher-level application components MUST NOT directly access provider SDKs
or provider credentials.

The boundary MUST:

- validate requests
- preserve canonical identity
- preserve ownership
- delegate provider-specific execution
- normalize provider results
- normalize provider failures
- prevent unauthorized state changes
- prevent false entitlement

## 11. Provider Independence

Flutterwave-specific and Apple-specific implementation details MUST remain
outside the canonical payment domain.

Adding another provider MUST NOT require redesigning canonical subscription
or entitlement identity.

## 12. External API

The initial foundation does not require live external API execution.

Provider integrations may initially be represented by controlled mocks or
provider adapters.

Live execution MUST NOT be claimed until credentials, provider availability,
and actual external execution have been verified.

## 13. Failure Protection

Failure testing MUST cover:

- invalid payment input
- missing user identity
- ownership violations
- duplicate transaction
- provider-reference conflict
- invalid lifecycle transition
- persistence failure
- registry failure
- provider failure
- unavailable provider
- incomplete payment
- false-success entitlement
- unauthorized entitlement activation

A failed or unverified payment MUST NOT produce successful entitlement.

## 14. Verification

Verification MUST establish:

- canonical identity
- user ownership
- lifecycle control
- persistence authority
- registry authority
- idempotency
- conflict handling
- boundary enforcement
- provider independence
- failure normalization
- false-entitlement prevention

Verification MUST NOT require live provider execution when external
credentials or provider availability are unavailable.

## 15. Reserved Future Decisions

The first implementation MUST NOT implicitly establish:

- pricing strategy
- tax calculation
- invoicing
- accounting
- refunds policy
- revenue recognition
- Apple StoreKit UI
- Flutterwave checkout UI
- payment analytics
- promotional pricing
- coupons
- affiliate commissions
- marketplace functionality
- additional commercial domains

Each requires separate architectural evaluation where canonical authority
would be introduced.

## 16. Implementation Sequence

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

## 17. Payment Boundary Interface Design

The Payment Boundary is the approved application entry point for payment
operations and external payment-provider events.

It MUST preserve the canonical authority established by Contract §34.

### 17.1 requestPayment

The Boundary MUST expose a `requestPayment` operation.

Its request MUST provide:

- userId
- provider
- idempotencyKey
- providerRequest

The Boundary MUST:

1. Validate the incoming request.
2. Validate user ownership.
3. Enforce canonical idempotency.
4. Establish canonical Payment Transaction identity.
5. Delegate provider execution through an approved provider adapter.
6. Normalize the provider result or failure.
7. Verify payment success before applying a successful lifecycle state.
8. Enforce valid Payment Transaction lifecycle transitions.
9. Persist canonical state through the approved persistence authority.
10. Return a normalized result.

Provider initiation alone MUST NOT establish payment success.

### 17.2 processProviderEvent

The Boundary MUST expose a `processProviderEvent` operation.

Incoming events MUST contain sufficient information to identify the provider,
external event, provider object, event type, and canonical association.

The Boundary MUST:

1. Validate the event.
2. Resolve its canonical association.
3. Enforce event idempotency.
4. Detect provider-reference conflicts.
5. Normalize the provider event.
6. Evaluate the permitted canonical lifecycle transition.
7. Persist approved canonical changes.
8. Return a normalized result.

Unknown, malformed, conflicting, or unauthorized events MUST fail in a
controlled manner.

### 17.3 Normalized Results

Successful operations MUST return a normalized success result containing
the relevant canonical identity and state.

Failed operations MUST return a normalized failure result containing an
error code and safe error message.

Raw provider responses MUST NOT become canonical state.

Credentials, secrets, stack traces, and sensitive provider implementation
details MUST NOT be exposed through Boundary results.

### 17.4 Provider Adapter Interface

Provider-specific execution MUST occur through approved provider adapters.

The Boundary MUST depend on a provider-independent adapter interface rather
than directly depending on Flutterwave or Apple SDK implementations.

Unavailable provider dependencies MUST produce controlled failures.

### 17.5 Canonical State Protection

The Boundary MUST NOT:

- create competing canonical identities
- reassign canonical user ownership
- bypass canonical registry or persistence authority
- treat external provider identifiers as canonical identities
- allow provider events to directly mutate canonical state
- mark unverified payments as succeeded
- activate entitlements from failed or unverified payments

### 17.6 Provider Independence

The Boundary interface MUST remain provider-independent.

Adding a payment provider MUST NOT require redesigning canonical Payment
Transaction, Subscription, or Entitlement identity.

Provider-specific behavior MUST remain behind approved provider adapters.
