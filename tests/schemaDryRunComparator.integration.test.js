'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readLiveManifest } = require('../database/schemaDryRunComparator');

test('captures PostgreSQL 18 disposable catalog in a read-only transaction', async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must point to the CI disposable PostgreSQL 18 database.');
    }

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
    } finally {
        await client.end();
    }
});
