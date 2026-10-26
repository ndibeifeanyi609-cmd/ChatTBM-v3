'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readLiveManifest, assertSafeConnectionString } = require('../database/schemaDryRunComparator');

test('captures PostgreSQL 18 disposable catalog in a read-only transaction', async (t) => {
    if (!process.env.DATABASE_URL) {
        t.skip('DATABASE_URL is not configured outside the dedicated PostgreSQL 18 workflow.');
        return;
    }

    assertSafeConnectionString(process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const before = await client.query(
            "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'chattbm_%'"
        );
        const manifest = await readLiveManifest(client);
        const after = await client.query(
            "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'chattbm_%'"
        );

        assert.ok(manifest && Array.isArray(manifest.tables));
        assert.ok(Array.isArray(manifest.constraints));
        assert.ok(Array.isArray(manifest.indexes));
        assert.equal(after.rows[0].count, before.rows[0].count);
        assert.equal(manifest.tables.length, 0, 'CI disposable database should start without application tables');

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
        await client.end();
    }
});
