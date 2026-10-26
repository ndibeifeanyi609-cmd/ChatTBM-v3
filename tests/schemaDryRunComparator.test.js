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
