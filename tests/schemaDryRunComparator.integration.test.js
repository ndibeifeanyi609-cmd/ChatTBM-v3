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

        const expectedFixture = {
            tables: [{
                schema: 'public',
                name: 'chattbm_fixture',
                columns: [
                    { position: 1, name: 'id', type: 'pg_catalog.text', nullable: false, default: null },
                    { position: 2, name: 'label', type: 'pg_catalog.text', nullable: false, default: null }
                ]
            }],
            constraints: [{
                schema: 'public',
                table: 'chattbm_fixture',
                name: 'chattbm_fixture_pkey',
                type: 'p',
                definition: 'PRIMARY KEY (id)',
                deferrable: false,
                deferred: false,
                validated: true
            }],
            indexes: [{
                table: 'chattbm_fixture',
                name: 'chattbm_fixture_pkey',
                definition: 'CREATE UNIQUE INDEX chattbm_fixture_pkey ON public.chattbm_fixture USING btree (id)'
            }]
        };
        const expectedComparison = compareManifests(expectedFixture, manifest);
        assert.equal(
            expectedComparison.matches,
            true,
            'catalog capture must match the independently declared expected fixture manifest'
        );

        const mismatched = JSON.parse(JSON.stringify(expectedFixture));
        mismatched.indexes = [];
        const mismatchComparison = compareManifests(mismatched, manifest);
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
