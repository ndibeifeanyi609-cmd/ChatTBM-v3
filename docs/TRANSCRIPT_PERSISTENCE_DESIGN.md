# REG-097 Transcript Persistence Design Proposal

## Status
Proposed design only. Not approved for production and not a substitute for the canonical Conversation Contract.

## Problem
The authentication feature branch adds `chattbm_chat_history`, which stores complete message arrays separately from canonical Conversation state. This creates two potential sources of truth for conversation identity, ownership, ordering, and content.

The canonical Conversation design states that Conversation owns identity and lifecycle and stores ordered Context identifiers. Context owns interaction-scoped state. All canonical Conversation operations must cross `ConversationBoundary`.

A second issue must be addressed before this design can provide durable transcripts: the current `context/ContextPersistence.js` stores Context records in process-local Maps. That implementation does not survive server restarts and is not suitable as the production durable authority.

## Recommended architecture
1. The authenticated account ID is derived exclusively from the validated server session.
2. Each chat thread is represented by one canonical Conversation created/read/updated through `ConversationBoundary`. Its immutable `conversationKey` identifies the thread for that account.
3. Each completed chat turn is represented by one canonical Context, keyed by the account ID and unique interaction ID. Its validated `value` contains the turn's user message and assistant response, plus only explicitly approved turn metadata.
4. The Conversation maintains ordered Context IDs through `addContextReference`; it must not store a competing full transcript.
5. Context durable persistence must be implemented behind the existing Context persistence authority and boundary, using PostgreSQL when `DATABASE_URL` is configured. Do not add direct SQL access to the HTTP controller or Chat Interaction Boundary.
6. The browser may retain localStorage as a cache, but server canonical state is authoritative for signed-in users. Offline queues and conflict behavior must be explicit; no silent overwrites or automatic import of unrelated guest history.
7. The new `chattbm_chat_history` table and routes remain provisional until a reviewed migration path removes or formally justifies this parallel store. Do not run destructive migrations before data-preservation behavior is designed and tested.

## Required design details before implementation
- Define whether incomplete/failed interactions create Context records and when a turn becomes durable.
- Define idempotency for retries of the same interaction ID and conflict behavior for different payloads under the same identity.
- Define atomicity/failure handling when saving Context succeeds but attaching its ID to Conversation fails. Recovery must be retryable and must not duplicate turns.
- Define optimistic version handling for concurrent updates to the same Conversation.
- Define list/read pagination, message size limits, retention/deletion, and schema migration behavior.
- Preserve strict account ownership in every query and cross-domain reference validation.
- Decide how existing rows in `chattbm_chat_history` are reconciled without silently overwriting canonical data.

## Implementation sequence
1. Approve the design and update the canonical Conversation/Context design and Contract if required.
2. Add PostgreSQL Context persistence and schema migration behind the existing Context persistence interface; retain a deterministic test adapter for unit tests.
3. Add boundary-level tests for Context durability, ownership isolation, idempotency, optimistic conflicts, and database failures.
4. Integrate authenticated chat turns with Conversation creation/retrieval, Context creation/update, and ordered Context references. Keep the controller as an HTTP adapter.
5. Update browser history synchronization to read and write through the canonical APIs, with tested offline and conflict handling.
6. Add disposable-PostgreSQL end-to-end tests for registration/login, multiple turns, reload, independent browser sessions, cross-account isolation, restart durability, and deletion.
7. Only after tests pass, decide whether the provisional `chattbm_chat_history` storage can be retired safely.

## Production gate
Do not merge or deploy on the strength of unit tests alone. Require successful clean CI, PostgreSQL end-to-end tests, browser cookie/CORS/CSRF verification against actual deployed origins, schema initialization verification, and an explicit decision on email verification and password recovery. Until secure delivery is implemented, do not claim verified accounts or recovery support.
