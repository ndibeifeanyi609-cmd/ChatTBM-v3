# REG-094 Conversation Design

## Architectural Authority
The canonical Conversation domain owns Conversation identity, user ownership, lifecycle, approved Conversation metadata, and ordered references to associated Context records.
Conversation does not own Context state and does not become an authority for Memory, Profile, Learning, Skills, or Intelligence.

## Identity
Conversation identity is deterministic from the immutable pair `(userId, conversationKey)`.
The canonical identifier is a SHA-256-derived `conversation_` identifier.
The `userId`, `conversationKey`, and canonical `id` are immutable after creation.

## Lifecycle
Conversation uses the lifecycle states `active` and `closed`.
The only valid state transition is `active → closed`.
`closed` is terminal and MUST NOT transition back to `active` unless a future Contract explicitly establishes such a transition.
Repeating `closed → closed` is idempotent.
Invalid lifecycle states and transitions MUST fail without mutating canonical Conversation state.
Lifecycle transitions MUST NOT mutate Conversation identity, ownership, or version.
Closing a Conversation MUST NOT mutate, invalidate, or close associated Context records.

## Persistence
ConversationPersistence is the authoritative durable Conversation state authority.
No separate Conversation Registry is required.
Persistence preserves identity, ownership, lifecycle, timestamps, approved metadata, validated Context references, and version state.
Ordinary mutable Conversation updates use optimistic expected-version checking.
Stale updates MUST fail rather than overwrite newer state.

## Context Relationship
Conversation stores only ordered Context identifiers.
Context remains authoritative for interaction-scoped state.
Context references MUST be validated through the approved Context authority where state or ownership must be verified.
Conversation does not automatically create Context records or establish Context membership merely because a Conversation exists.

## Boundary
ConversationBoundary is the canonical cross-domain entry point for Conversation creation, retrieval, updates, lifecycle transitions, Context relationship management, listing, and deletion.
All canonical Conversation reads and writes cross the Conversation Boundary.
The Boundary enforces identity, ownership, lifecycle, Context reference validation, version rules, and controlled failures.
Cross-domain operations delegate to the owning canonical authority.

## Separation
Conversation remains separate from Context, Memory, Profile, Learning, Skills, and Intelligence.
Conversation content and metadata MUST NOT silently become state owned by another canonical domain.
Legacy conversation, history, timeline, and conversation-memory services remain noncanonical unless explicitly incorporated through an approved boundary.
