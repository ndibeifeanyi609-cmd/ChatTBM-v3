# PostgreSQL Known-Difference Policy — Test Contract

**Status:** Testable design only. This policy does not alter comparator results and does not authorize baseline adoption or production changes.

## Purpose

The raw comparator must continue to report every difference. A separate policy layer may classify one specifically reviewed difference as known; it must never make the raw comparison appear equal.

## Exact permitted classification

The only currently registered candidate difference is:

- ID: `schema.chat_history.updated_at_index.missing`
- Path: `$.indexes.public.chattbm_chat_history.chattbm_chat_history_updated_at_idx`
- Category: `missing_index`
- Status: `separately_planned`
- Expected object: index `chattbm_chat_history_updated_at_idx` on `public.chattbm_chat_history`, with the exact reviewed definition from the source-derived candidate.

A policy implementation must accept the classification only if all of these fields match exactly and the actual schema is missing exactly that expected index. It must not create, alter, or drop an index.

## Required behavior

1. Preserve the original raw comparator result, including its fingerprints and difference details.
2. Validate the known-difference registry against a closed schema: stable ID, exact path, category, and permitted status. Unknown fields or duplicate IDs fail closed.
3. Match by stable object identity and verify the full expected index record, not merely its name.
4. Classify only the one exact expected-only index as known. Keep it visible in output with its ID and status.
5. Any actual-only object, changed definition, invalid/not-ready/not-live index, missing table/column/constraint, additional missing index, or changed known-difference metadata remains unresolved and causes policy rejection.
6. Never convert the raw comparator's `matches: false` into `matches: true`. A separate high-level result may say `knownDifferencesOnly: true`, while retaining raw mismatch and fingerprints.
7. Unknown manifest versions, schema names, PostgreSQL major versions, or policy versions fail closed.
8. The policy is classification-only and read-only. It cannot write a baseline marker, run migrations, or change schema.

## Required tests before implementation is accepted

- Exact registered missing index is classified and remains visible.
- Wrong ID, path, category, status, definition, schema, or table is rejected.
- Missing index plus an unrelated extra index is rejected.
- Missing index plus a changed constraint or column default is rejected.
- Index exists but its definition differs: rejected.
- Index exists but is invalid, not ready, or not live: rejected.
- Duplicate or unknown difference records: rejected.
- Raw comparator result and fingerprints are preserved unchanged.
- Reordering top-level collections does not change classification; column order remains meaningful.
- All tests run against disposable PostgreSQL 18 where database integration is required; unit-only policy cases may use in-memory fixtures.

## Current disposition

No policy code is implemented by this document. The full-manifest comparator CI passing is evidence for comparator mechanics only. The candidate remains `provisional_not_executable`; the known index remains unresolved and must not be auto-created. Independent review is still required before baseline adoption. Production remains untouched.
