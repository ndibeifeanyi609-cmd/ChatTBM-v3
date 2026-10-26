# PostgreSQL Schema Manifest v1 — Format Contract

**Status:** Design contract only. This file does not declare the expected production schema and is not executable input for baseline adoption.

## Purpose

Define a stable, reviewable JSON shape for comparing PostgreSQL catalog metadata without modifying the database. The manifest is a statement of observed or independently reviewed schema facts, not evidence that a legacy SQL file ran historically.

## Versioned envelope

```json
{
  "manifestVersion": 1,
  "sourceRevision": "<reviewed git commit>",
  "postgresMajorVersion": 18,
  "schema": "public",
  "tables": [],
  "constraints": [],
  "indexes": [],
  "knownDifferences": []
}
```

The placeholder values above are illustrative only. A production manifest must not retain placeholders or be treated as complete until independently populated and reviewed.

## Object requirements

### Tables and columns

Each table record must identify schema and name. Columns must preserve ordinal position and include name, catalog-qualified type, nullability, default expression, identity status and generation mode, and generated-column status and expression. Column arrays are ordered by ordinal position.

### Constraints

Each constraint must identify schema, table, name, type, canonical PostgreSQL definition, deferrability, initially-deferred status, and validation status. Constraint arrays are sorted by schema, table, and name.

### Indexes

Each index must identify schema, table, name, canonical definition, uniqueness, primary status, and valid/ready/live flags. Index arrays are sorted by schema, table, and name. The definition must retain expressions, included columns, ordering, predicates, and access method as exposed by PostgreSQL.

### Known differences

Every accepted or unresolved difference must have a stable identifier, object path, category, rationale, status (`unresolved`, `accepted`, or `separately_planned`), and review reference. A difference must never be silently removed to make fingerprints match.

## Canonicalization and fingerprint

- Canonicalize object keys lexicographically at every nesting level.
- Store `tables`, `constraints`, and `indexes` as top-level arrays, matching the tested `database/schemaDryRunComparator.js` interface.
- Preserve column order by ordinal position.
- Sort constraints and indexes by their stable identity fields as defined above.
- Preserve other arrays only where order is semantically meaningful; otherwise sort by stable identity before fingerprinting.
- Serialize canonical JSON as UTF-8 without extra whitespace and compute SHA-256 over those exact bytes.
- Store the manifest version alongside the fingerprint. A fingerprint from one manifest version is not comparable to another without an explicit version migration.

## Comparison policy

The comparator must report both expected-only and actual-only differences. Extra objects are not ignored by default. A match is allowed only when the complete normalized object collections match, apart from separately documented and explicitly permitted differences. The comparator is read-only and must refuse any target except the explicitly guarded loopback disposable PostgreSQL 18 database used by tests.

## Current project-specific unresolved difference

The live inventory lacks `chattbm_chat_history_updated_at_idx`, while `database/migrations/002_chat_history.sql` declares it. Keep this discrepancy explicit. Do not synthesize the index into the observed manifest, create it automatically, or declare the schemas equal because of it.

## Readiness gates

- [ ] Populate the full 11-table manifest from independently reviewed source definitions and catalog output.
- [ ] Validate every column, default, constraint, index definition and index-health flag.
- [ ] Reconcile differences without writing to production.
- [ ] Test canonicalization and fingerprints against equivalent manifests with reordered object keys and stable object arrays.
- [ ] Test missing/extra tables, columns, constraints, and indexes; type/default drift; invalid indexes; and unresolved differences in disposable PostgreSQL 18.
- [ ] Review and approve the exact manifest before any baseline-adoption implementation uses it.

No production schema or data changes are authorized by this format contract.