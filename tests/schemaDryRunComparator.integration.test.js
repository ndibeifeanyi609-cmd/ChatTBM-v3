'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readLiveManifest, assertSafeConnectionString, compareManifests } = require('../database/schemaDryRunComparator');

test('captures PostgreSQL 18 disposable catalog in a read-only transaction', async (t) => {
    if (!process.env.DATABASE_URL) {
        t.skip('DATABASE_URL is not configured outside the dedicated PostgreSQL 18 workflow.');
        return;
    }

    assertSafeConnectionString(process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await client.query('CREATE TABLE chattbm_fixture (id TEXT PRIMARY KEY, label TEXT NOT NULL)');
        const manifest = await readLiveManifest(client);

        assert.ok(manifest && Array.isArray(manifest.tables));
        assert.ok(Array.isArray(manifest.constraints));
        assert.ok(Array.isArray(manifest.indexes));
        assert.equal(manifest.tables.length, 1);
        assert.equal(manifest.tables[0].name, 'chattbm_fixture');

        const selfComparison = compareManifests(manifest, JSON.parse(JSON.stringify(manifest)));
        assert.equal(selfComparison.matches, true, 'captured catalog should match its canonical copy');
        const mismatched = JSON.parse(JSON.stringify(manifest));
        mismatched.indexes = mismatched.indexes.filter(index => index.name !== 'chattbm_fixture_pkey');
        const mismatchComparison = compareManifests(manifest, mismatched);
        assert.equal(mismatchComparison.matches, false, 'missing expected index must be detected');

        await client.query('BEGIN READ ONLY');
        await assert.rejects(
            client.query('CREATE TABLE chattbm_comparator_write_guard (id integer)'),
            /read-only transaction/i
        );
        await client.query('ROLLBACK');
        const guardTable = await client.query(
            "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name='chattbm_comparator_write_guard'"
        );
        assert.equal(guardTable.rows[0].count, 0, 'read-only transaction must reject schema writes');
    } finally {
        try {
            await client.query('DROP TABLE IF EXISTS chattbm_fixture');
        } finally {
            await client.end();
        }
    }
});
