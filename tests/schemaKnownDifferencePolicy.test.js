'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyKnownDifferences, ALLOWED_DIFFERENCE } = require('../database/schemaKnownDifferencePolicy');
const { compareManifests } = require('../database/schemaDryRunComparator');

// Registry fixture intentionally mirrors the exact six-field candidate contract.
const registry = [{
    ...ALLOWED_DIFFERENCE,
    rationale: 'Declared by the legacy chat-history SQL; absent from the observed live catalog and separately planned.',
    reviewRef: 'docs/POSTGRES_EXPECTED_SCHEMA_MANIFEST_PLAN.md'
}];
const expectedIndex = {
    schema: 'public',
    table: 'chattbm_chat_history',
    name: 'chattbm_chat_history_updated_at_idx',
    definition: 'CREATE INDEX chattbm_chat_history_updated_at_idx ON public.chattbm_chat_history USING btree (user_id, updated_at DESC)',
    unique: false,
    primary: false,
    valid: true,
    ready: true,
    live: true
};
const baseCollections = {
    tables: [{ schema: 'public', name: 'chattbm_chat_history', columns: [{ position: 1, name: 'updated_at', type: 'pg_catalog.timestamptz', nullable: false, default: 'now()' }] }],
    constraints: [{ schema: 'public', table: 'chattbm_chat_history', name: 'chattbm_chat_history_pkey', type: 'p', definition: 'PRIMARY KEY (user_id, conversation_id)', deferrable: false, deferred: false, validated: true }],
    indexes: []
};
function expectedManifest() {
    return { manifestVersion: 1, postgresMajorVersion: 18, schema: 'public', status: 'provisional_not_executable', knownDifferences: structuredClone(registry), ...structuredClone(baseCollections), indexes: [structuredClone(expectedIndex)] };
}
function actualManifest() {
    return { manifestVersion: 1, postgresMajorVersion: 18, schema: 'public', ...structuredClone(baseCollections) };
}
function rawMismatch(expected = expectedManifest(), actual = actualManifest()) {
    return compareManifests(expected, actual);
}

test('classifies only the exact registered absent index and preserves raw mismatch', () => {
    const raw = rawMismatch();
    const result = classifyKnownDifferences(raw, expectedManifest(), actualManifest());
    assert.equal(result.classification, 'known_differences_only');
    assert.equal(result.knownDifferences[0].id, ALLOWED_DIFFERENCE.id);
    assert.strictEqual(result.rawComparison, raw);
    assert.equal(result.rawComparison.matches, false);
});

test('rejects wrong registry identity fields and unknown registry entries', () => {
    for (const field of ['id', 'path', 'category', 'status']) {
        const expected = expectedManifest();
        expected.knownDifferences[0][field] = 'wrong';
        assert.throws(() => classifyKnownDifferences(rawMismatch(expected, actualManifest()), expected, actualManifest()), /refuses/);
    }
    const expected = expectedManifest();
    expected.knownDifferences[0].extra = true;
    assert.throws(() => classifyKnownDifferences(rawMismatch(expected, actualManifest()), expected, actualManifest()), /unknown or missing/);
});

test('rejects an additional unexpected index or changed column/default', () => {
    const extra = actualManifest();
    extra.indexes.push({ schema: 'public', table: 'chattbm_chat_history', name: 'unexpected_idx', definition: 'CREATE INDEX unexpected_idx ON public.chattbm_chat_history USING btree (updated_at)' });
    assert.throws(() => classifyKnownDifferences(rawMismatch(expectedManifest(), extra), expectedManifest(), extra), /additional or changed/);

    const drift = actualManifest();
    drift.tables[0].columns[0].default = 'CURRENT_TIMESTAMP';
    assert.throws(() => classifyKnownDifferences(rawMismatch(expectedManifest(), drift), expectedManifest(), drift), /additional or changed/);
});

test('rejects a changed or unhealthy actual version of the registered index', () => {
    const changed = actualManifest();
    changed.indexes.push({ ...expectedIndex, definition: expectedIndex.definition + ' WHERE updated_at IS NOT NULL' });
    assert.throws(() => classifyKnownDifferences(rawMismatch(expectedManifest(), changed), expectedManifest(), changed), /not an absent index/);

    const unhealthy = actualManifest();
    unhealthy.indexes.push({ ...expectedIndex, valid: false });
    assert.throws(() => classifyKnownDifferences(rawMismatch(expectedManifest(), unhealthy), expectedManifest(), unhealthy), /not an absent index/);
});

test('rejects missing expected index record and unsupported schema versions', () => {
    const expected = expectedManifest();
    expected.indexes = [];
    assert.throws(() => classifyKnownDifferences(rawMismatch(expected, actualManifest()), expected, actualManifest()), /expected index record/);

    const unsupported = actualManifest();
    unsupported.postgresMajorVersion = 16;
    assert.throws(() => classifyKnownDifferences(rawMismatch(expectedManifest(), unsupported), expectedManifest(), unsupported), /unsupported/);
});

test('rejects a raw match or missing fingerprints', () => {
    assert.throws(() => classifyKnownDifferences({ ...rawMismatch(), matches: true }, expectedManifest(), actualManifest()), /raw mismatch/);
    assert.throws(() => classifyKnownDifferences({ matches: false }, expectedManifest(), actualManifest()), /raw mismatch/);
});

test('rejects fabricated or stale raw comparison output', () => {
    const expected = expectedManifest();
    const actual = actualManifest();
    const raw = rawMismatch(expected, actual);
    assert.throws(() => classifyKnownDifferences({ ...raw, expectedFingerprint: 'a'.repeat(64) }, expected, actual), /raw comparison does not match/);
    assert.throws(() => classifyKnownDifferences({ ...raw, expectedOnly: [] }, expected, actual), /raw comparison does not match/);
});
