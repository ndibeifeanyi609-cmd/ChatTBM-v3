# Staging Schema Baseline Reconciliation

Status: **Evidence collected; baseline not approved; no staging writes performed.**

Target database: `chattbm_staging_isolated`  
Diagnostic source: read-only staging inventory workflow, run #37  
Diagnostic branch/commit: `fix/staging-complete-constraint-inventory` / `46522ff2bc0db56625efdf3cb45cd925e82c1c06`  
Runner proposal: PR #79, `feat/staging-migration-ledger-procedure`

## Safety boundary

This document records observations and a proposed sequence only. It does not authorize or perform DDL, data changes, migration execution, ledger creation, or deployment. Do not run the migration runner against staging until a separately reviewed baseline-adoption procedure is approved. The current runner correctly refuses to create a ledger when existing `chattbm_%` tables are present without one.

## Observed staging inventory

The read-only endpoint confirmed database identity `chattbm_staging_isolated` and `readOnly: true`.

- Expected application tables: 11
- Present application tables: 9
- Missing: `chattbm_password_reset_tokens`, `chattbm_auth_rate_limits`
- Unexpected application tables: none
- User row count: 1

Present tables:
- `chattbm_users`
- `chattbm_auth_sessions`
- `chattbm_oauth_identities`
- `chattbm_google_oauth_states`
- `chattbm_chat_history`
- `chattbm_contexts`
- `chattbm_conversations`
- `chattbm_google_oauth_handoffs`
- `chattbm_memories`

## Migration-by-migration evidence

| Migration file | Observed result | Baseline disposition |
|---|---|---|
| `001_auth_accounts_sessions.sql` | Users and sessions columns, PKs, unique token/email constraints, user FK, and session indexes match source | Candidate for verified baseline after full review |
| `002_google_oauth_identities.sql` | Identity columns, PK, both unique constraints, and user FK match source | Candidate for verified baseline after full review |
| `002_chat_history.sql` | Table columns, PK, messages CHECK, and user FK match; required `chattbm_chat_history_updated_at_idx` is absent | **Do not mark applied** until index discrepancy is resolved and verified |
| `003_context_records.sql` | Columns, PK, user FK, JSON object CHECK, version CHECK, unique user/interaction constraint, and both indexes match | Candidate for verified baseline after full review |
| `003_google_oauth_states.sql` | Columns, PK, nullable link-user FK, and expiry index match | Candidate for verified baseline after full review |
| `004_password_reset_tokens.sql` | Table absent | **Not applied** |
| `005_auth_rate_limits.sql` | Table absent | **Not applied** |

The two distinct files with numeric prefixes 002 and the two with prefix 003 must remain distinct migration identities. Use the runner's exact manifest IDs and checksums; do not infer migration identity from the numeric prefix alone.

## Bootstrap-created tables outside the numbered migration manifest

The source code also initializes these tables:

- `chattbm_conversations` in `database/Postgres.js`: observed columns, primary key, and unique `(user_id, conversation_key)` match the bootstrap definition. The bootstrap definition has no user FK.
- `chattbm_google_oauth_handoffs` in `database/Postgres.js`: observed columns, primary key, user FK with cascade delete, and expiry index match.
- `chattbm_memories` in `memory/PostgresMemoryPersistence.js`: observed columns, primary key, JSON object CHECK, unique `(user_id, memory_type, subject)`, and lifecycle index match. The bootstrap definition has no user FK.

These objects are real application schema but are not represented by the seven-file numbered migration manifest. They must be accounted for in a separate, explicit schema ownership/baseline policy; do not silently assign them to unrelated numbered migrations.

## Confirmed discrepancy: chat-history index

Migration `002_chat_history.sql` declares:

```sql
CREATE INDEX IF NOT EXISTS chattbm_chat_history_updated_at_idx
    ON chattbm_chat_history (user_id, updated_at DESC);
```

The staging inventory reports only the chat-history primary-key index. The index above is absent. The bootstrap in `database/Postgres.js` creates the table but does not create this index, which explains the observed difference between the bootstrap and migration definitions.

No index has been created. A future change must be separately reviewed and applied only through the approved isolated-staging migration process.

## Proposed safe sequence (not yet executed)

1. Preserve the read-only inventory as the evidence snapshot for this reconciliation.
2. Review the exact migration manifest IDs and SHA-256 checksums in PR #79, ensuring the two 002 files and two 003 files remain distinct.
3. Decide and document how bootstrap-owned tables (`conversations`, `google_oauth_handoffs`, `memories`) are represented in the canonical schema history.
4. Prepare a narrowly scoped, reviewed correction for the missing chat-history index; test it on a disposable PostgreSQL database first.
5. Re-run the read-only staging inventory after any separately authorized correction and compare the exact index definition.
6. Confirm the two missing migration tables remain absent, then plan migrations 004 and 005 as unapplied work. Do not record either as applied.
7. Design and test an explicit baseline-adoption mechanism for the existing database. It must verify every required object and checksum, account for bootstrap-owned objects, preserve the existing user row, and refuse partial or ambiguous matches.
8. Only after review and explicit authorization, apply the approved isolated-staging changes and establish the migration ledger. Re-run the read-only inventory and verify the ledger and schema.

## Current decision

**Baseline approval: BLOCKED.**

Blocking items:
- Missing `chattbm_chat_history_updated_at_idx`.
- Migrations 004 and 005 are absent.
- Bootstrap-created tables are outside the numbered migration manifest and need an explicit ownership/baseline policy.
- No staging migration ledger has been verified or created.

No production database was accessed. No staging DDL, migration, data update, or ledger write was performed. PRs #79 and #80 must remain Draft and unmerged pending review.
