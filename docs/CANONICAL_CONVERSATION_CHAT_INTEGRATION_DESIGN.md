# Canonical Conversation and Chat Integration

Status: implementation in progress on PR #7; not deployed.

## Goal

Ensure a successful normal chat interaction has a canonical Conversation record and a validated reference to its interaction-scoped Context, while preserving the existing transcript/history store.

## Identity and ownership

- The authenticated user identity supplied to ChatInteractionBoundary is authoritative.
- The UI interactionId maps to the canonical conversationKey.
- Canonical identity remains the deterministic (userId, conversationKey) pair defined by REG-094.
- All canonical Conversation reads and writes go through ConversationBoundary.
- Context identity and ownership are validated through ContextBoundary.
- Conversation stores Context IDs only; it does not duplicate message/response state.
- The existing transcript remains in the legacy chattbm_chat_history path.

## Failure behavior

- Canonical lookup, creation, or linking failures return a controlled unsuccessful chat result.
- Repeated requests must not create duplicate Conversation records or duplicate Context references.
- Context references use the current Conversation version and a bounded retry for version conflicts.
- Persistence failures must not be hidden, and ownership checks must not be weakened.
- No production database changes, migrations, deployment, or merge are part of this work.

## Implementation checkpoint (2026-10-19)

The branch now includes ConversationBoundary.resolveOrCreateConversation, which derives the canonical ID from the authenticated user and conversation key, retrieves existing records, and handles conflict codes used by the current persistence adapters. ChatInteractionBoundary calls this resolver and links its Context ID through ConversationBoundary.addContextReference.

GitHub Actions passed for the current implementation commit. Identity invariant tests cover stable IDs, user isolation, and identity mismatch.

## Required before merge

Focused tests are still required for repeated chat requests, actual Context linking, persistence failure, ownership rejection, and compatibility with existing chat behavior. Keep PR #7 in draft until these tests and review are complete.
