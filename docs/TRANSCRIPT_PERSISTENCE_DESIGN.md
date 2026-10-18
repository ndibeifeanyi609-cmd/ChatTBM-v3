# REG-097 Transcript Persistence Design

## Status
Approved for implementation on `auth-foundation-design`. This approval authorizes the canonical persistence approach, not production deployment or merging.

## Canonical ownership
1. The authenticated account ID comes exclusively from the validated server-side session.
2. A chat thread is a canonical Conversation created, read, updated, and deleted only through `ConversationBoundary`. Its immutable `conversationKey` identifies the thread for that account.
3. Each successfully completed chat turn is a canonical Context keyed by account ID and interaction ID. Its validated value contains the user message, assistant response, and explicitly approved turn metadata.
4. Conversation stores ordered Context IDs through `addContextReference`; it must not store a second full transcript.
5. Context persistence belongs behind the existing Context persistence authority and `ContextBoundary`. PostgreSQL is authoritative when `DATABASE_URL` is configured. HTTP controllers and Chat Interaction Boundary must not access persistence or SQL directly.
6. localStorage is only a browser cache for signed-in users. Do not silently import guest history into an account or overwrite canonical server state.

## Turn durability and retry rules
- A turn becomes durable only after assistant generation succeeds and the completed user/assistant pair is validated. Failed or incomplete generation must not be represented as a completed turn.
- Repeating the same account ID and interaction ID with the same canonical payload is idempotent and returns the existing Context.
- Reusing that identity with a different payload returns a conflict. It must never silently replace the original turn.
- Context creation and Conversation reference attachment may span separate operations. If Context creation succeeds but reference attachment fails, retry must find the existing Context and safely attach its ID; duplicate turns are forbidden.
- Conversation updates use the existing expected-version optimistic concurrency contract. Version conflicts are surfaced to the caller; no silent last-write-wins.
- All reads, writes, references, and deletion are account-scoped. Validate that every referenced Context belongs to the same account.

## Migration and compatibility
- Add PostgreSQL Context persistence behind the canonical Context persistence interface, preserving a deterministic in-memory adapter for unit tests.
- Existing `chattbm_chat_history` rows are provisional legacy data, not an alternative source of truth. Do not delete or automatically import them until a separately tested reconciliation and rollback plan exists.
- Do not run destructive migrations as part of this implementation. Schema creation must be repeatable and safe for existing installations.
- Keep API pagination, payload/message limits, retention/deletion behavior, and migration rollback explicit in implementation and tests.

## Required verification
1. Context durability across process restart, ownership isolation, idempotency, conflicting duplicate payloads, optimistic conflicts, and database failure behavior.
2. Completed chat turns integrated through Chat Interaction Boundary, Context Boundary, and Conversation Boundary with ordered Context references.
3. Authenticated history reload and synchronization use canonical Conversation/Context APIs; offline and conflict behavior must be explicit.
4. Disposable-PostgreSQL end-to-end tests cover registration/login, multiple turns, reload, independent browser sessions, cross-account isolation, restart durability, and deletion.
5. Verify cookie, CORS, CSRF/origin behavior against the actual deployed frontend/backend origins and confirm schema initialization.
6. Email verification and password recovery remain production blockers until securely implemented and tested. Do not claim verified accounts or recovery support before then.

## Production gate
Do not merge or deploy based on unit tests alone. Require clean CI, PostgreSQL end-to-end results, actual-origin browser security verification, schema initialization verification, and an explicit decision on email verification and password recovery. The parallel `chattbm_chat_history` table may only be retired after data-preservation behavior is reviewed and tested.
