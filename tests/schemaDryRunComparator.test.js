'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    canonicalJson,
    fingerprint,
    compareManifests,
    assertSafeConnectionString,
    assertSafeTarget
} = require('../database/schemaDryRunComparator');

test('canonical JSON and fingerprint do not depend on object key order', () => {
    const a = { tables: [{ name: 'x', columns: [{ name: 'id', nullable: false }] }], version: 1 };
    const b = { version: 1, tables: [{ columns: [{ nullable: false, name: 'id' }], name: 'x' }] };
    assert.equal(canonicalJson(a), canonicalJson(b));
    assert.equal(fingerprint(a), fingerprint(b));
});

test('manifest comparison reports equality and stable fingerprints', () => {
    const manifest = { tables: [], constraints: [], indexes: [] };
    const result = compareManifests(manifest, { indexes: [], tables: [], constraints: [] });
    assert.equal(result.matches, true);
    assert.equal(result.expectedFingerprint, result.actualFingerprint);
    assert.deepEqual(result.expectedOnly, []);
    assert.deepEqual(result.actualOnly, []);
});

test('manifest comparison flags a missing or changed object', () => {
    const expected = { indexes: [{ name: 'chattbm_chat_history_updated_at_idx' }] };
    const actual = { indexes: [] };
    const result = compareManifests(expected, actual);
    assert.equal(result.matches, false);
    assert.notEqual(result.expectedFingerprint, result.actualFingerprint);
    assert.ok(result.expectedOnly.length > 0);
});

test('target guard accepts only loopback chattbm_test on PostgreSQL 18', () => {
    assert.doesNotThrow(() => assertSafeTarget('postgres://u:p@localhost:5432/chattbm_test', 'chattbm_test', '180000'));
    assert.throws(() => assertSafeTarget('postgres://u:p@render.example:5432/chattbm_test', 'chattbm_test', '180000'), /loopback/);
    assert.throws(() => assertSafeTarget('postgres://u:p@localhost:5432/production', 'production', '180000'), /chattbm_test/);
    assert.throws(() => assertSafeTarget('postgres://u:p@localhost:5432/chattbm_test', 'chattbm_test', '160000'), /PostgreSQL 18/);
});

test('preflight rejects remote or non-test URLs before any connection is attempted', () => {
    assert.doesNotThrow(() => assertSafeConnectionString('postgres://u:p@localhost:5432/chattbm_test'));
    assert.throws(() => assertSafeConnectionString('postgres://u:p@render.example:5432/chattbm_test'), /loopback/);
    assert.throws(() => assertSafeConnectionString('postgres://u:p@localhost:5432/production'), /chattbm_test/);
    assert.throws(() => assertSafeConnectionString('not-a-url'), /valid URL/);
});

test('fingerprint includes identity, generated-column, and index health metadata', () => {
    const base = {
        tables: [{
            name: 'chattbm_fixture',
            columns: [{ name: 'id', identity: false, generated: false, generationExpression: null }]
        }],
        constraints: [],
        indexes: [{
            name: 'chattbm_fixture_idx',
            unique: false,
            primary: false,
            valid: true,
            ready: true,
            live: true
        }]
    };
    const changedIdentity = structuredClone(base);
    changedIdentity.tables[0].columns[0].identity = true;
    assert.notEqual(fingerprint(base), fingerprint(changedIdentity));

    const changedGenerated = structuredClone(base);
    changedGenerated.tables[0].columns[0].generated = true;
    changedGenerated.tables[0].columns[0].generationExpression = 'id + 1';
    assert.notEqual(fingerprint(base), fingerprint(changedGenerated));

    for (const field of ['unique', 'primary', 'valid', 'ready', 'live']) {
        const changed = structuredClone(base);
        changed.indexes[0][field] = !changed.indexes[0][field];
        assert.notEqual(fingerprint(base), fingerprint(changed), field + ' must affect the fingerprint');
    }
});

test('manifest comparison detects extra objects and column default drift', () => {
    const expected = {
        tables: [{ name: 'chattbm_fixture', columns: [{ name: 'id', type: 'pg_catalog.text', default: null }] }],
        constraints: [],
        indexes: []
    };
    const extraObject = structuredClone(expected);
    extraObject.tables.push({ name: 'chattbm_unexpected', columns: [] });
    const extraResult = compareManifests(expected, extraObject);
    assert.equal(extraResult.matches, false);
    assert.ok(extraResult.actualOnly.length > 0, 'unexpected table must be reported on actual side');

    const changedDefault = structuredClone(expected);
    changedDefault.tables[0].columns[0].default = 'now()';
    const defaultResult = compareManifests(expected, changedDefault);
    assert.equal(defaultResult.matches, false);
    assert.notEqual(defaultResult.expectedFingerprint, defaultResult.actualFingerprint);
});

test('manifest comparison reports stable object paths for a missing index', () => {
    const expected = { tables: [], constraints: [], indexes: [{ schema: 'public', table: 'chattbm_fixture', name: 'chattbm_fixture_idx' }] };
    const actual = { tables: [], constraints: [], indexes: [] };
    const first = compareManifests(expected, actual);
    const second = compareManifests(expected, actual);
    assert.equal(first.matches, false);
    assert.deepEqual(first.expectedOnly, second.expectedOnly);
    assert.ok(first.expectedOnly.some(item => item.path === '$.indexes'), 'missing index should be reported at the indexes collection path');
});

test('manifest canonicalization sorts object collections but preserves column order', () => {
    const a = {
        tables: [
            { schema: 'public', name: 'chattbm_z', columns: [{ position: 1, name: 'id' }, { position: 2, name: 'value' }] },
            { schema: 'public', name: 'chattbm_a', columns: [{ position: 1, name: 'id' }] }
        ],
        constraints: [
            { schema: 'public', table: 'chattbm_z', name: 'z_pk' },
            { schema: 'public', table: 'chattbm_a', name: 'a_pk' }
        ],
        indexes: [
            { schema: 'public', table: 'chattbm_z', name: 'z_idx' },
            { schema: 'public', table: 'chattbm_a', name: 'a_idx' }
        ]
    };
    const b = {
        indexes: [...a.indexes].reverse(),
        constraints: [...a.constraints].reverse(),
        tables: [...a.tables].reverse()
    };
    assert.equal(fingerprint(a), fingerprint(b));
    const reorderedColumns = structuredClone(a);
    reorderedColumns.tables[0].columns.reverse();
    assert.notEqual(fingerprint(a), fingerprint(reorderedColumns));
});
