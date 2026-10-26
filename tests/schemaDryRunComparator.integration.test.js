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
                    { position: 1, name: 'id', type: 'pg_catalog.text', nullable: false, default: null, identity: false, identityGeneration: null, generated: false, generationExpression: null },
                    { position: 2, name: 'label', type: 'pg_catalog.text', nullable: false, default: null, identity: false, identityGeneration: null, generated: false, generationExpression: null }
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
                schema: 'public',
                table: 'chattbm_fixture',
                name: 'chattbm_fixture_pkey',
                definition: 'CREATE UNIQUE INDEX chattbm_fixture_pkey ON public.chattbm_fixture USING btree (id)',
                unique: true,
                primary: true,
                valid: true,
                ready: true,
                live: true
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


test('compares the full provisional ChatTBM schema candidate on disposable PostgreSQL 18', async (t) => {
    if (!process.env.DATABASE_URL) {
        t.skip('DATABASE_URL is not configured outside the dedicated PostgreSQL 18 workflow.');
        return;
    }

    const fs = require('node:fs/promises');
    const path = require('node:path');
    const { compareManifests } = require('../database/schemaDryRunComparator');
    const candidate = JSON.parse(await fs.readFile(
        path.join(__dirname, 'fixtures', 'postgresExpectedSchemaCandidate.v1.json'),
        'utf8'
    ));
    assert.equal(candidate.manifestVersion, 1);
    assert.equal(candidate.postgresMajorVersion, 18);
    assert.equal(candidate.tables.length, 11);
    assert.equal(candidate.constraints.length, 31);
    assert.equal(candidate.indexes.length, 30);

    assertSafeConnectionString(process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const tableNames = [
        'chattbm_auth_rate_limits', 'chattbm_password_reset_tokens',
        'chattbm_google_oauth_handoffs', 'chattbm_google_oauth_states',
        'chattbm_oauth_identities', 'chattbm_memories', 'chattbm_conversations',
        'chattbm_contexts', 'chattbm_chat_history', 'chattbm_auth_sessions',
        'chattbm_users', 'chattbm_conversations',
        'chattbm_google_oauth_handoffs', 'chattbm_memories'
    ];
    try {
        await client.connect();
        for (const name of tableNames) {
            await client.query('DROP TABLE IF EXISTS public.' + name + ' CASCADE');
        }

        const migrationFiles = [
            '001_auth_accounts_sessions.sql',
            '002_chat_history.sql',
            '002_google_oauth_identities.sql',
            '003_context_records.sql',
            '003_google_oauth_states.sql',
            '004_password_reset_tokens.sql',
            '005_auth_rate_limits.sql'
        ];
        for (const file of migrationFiles) {
            const sql = await fs.readFile(
                path.join(__dirname, '..', 'database', 'migrations', file),
                'utf8'
            );
            await client.query(sql);
        }

        await client.query(`
            CREATE TABLE chattbm_conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                conversation_key TEXT NOT NULL,
                version INTEGER NOT NULL,
                lifecycle TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                payload JSONB NOT NULL,
                UNIQUE (user_id, conversation_key)
            );
            CREATE TABLE chattbm_google_oauth_handoffs (
                handoff_hash TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX chattbm_google_oauth_handoffs_expires_at_idx
                ON chattbm_google_oauth_handoffs (expires_at);
            CREATE TABLE chattbm_memories (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                subject TEXT NOT NULL,
                lifecycle TEXT NOT NULL,
                payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                UNIQUE (user_id, memory_type, subject)
            );
            CREATE INDEX chattbm_memories_user_lifecycle_idx
                ON chattbm_memories (user_id, lifecycle)
        `);

        // Model the documented live discrepancy in this disposable database only.
        await client.query('DROP INDEX chattbm_chat_history_updated_at_idx');

        const actual = await readLiveManifest(client);
        const comparison = compareManifests(
            { tables: candidate.tables, constraints: candidate.constraints, indexes: candidate.indexes },
            actual
        );
        assert.equal(comparison.matches, false, 'known missing index must not be hidden');
        const objectKey = x => [x.schema, x.table || x.name, x.table ? x.name : ''].join('.');
        const tableKey = x => [x.schema, x.name].join('.');
        const actualTables = new Map(actual.tables.map(x => [tableKey(x), x]));
        assert.deepEqual([...actualTables.keys()].sort(), candidate.tables.map(tableKey).sort(),
            'all 11 table identities must match');
        for (const expectedTable of candidate.tables) {
            assert.deepEqual(actualTables.get(tableKey(expectedTable)), expectedTable,
                'all column definitions must match for ' + expectedTable.name);
        }
        const actualConstraints = new Map(actual.constraints.map(x => [objectKey(x), x]));
        assert.deepEqual([...actualConstraints.keys()].sort(), candidate.constraints.map(objectKey).sort(),
            'all constraint identities must match');
        for (const expectedConstraint of candidate.constraints) {
            assert.deepEqual(actualConstraints.get(objectKey(expectedConstraint)), expectedConstraint,
                'constraint definition and validation flags must match for ' + expectedConstraint.name);
        }
        const actualIndexes = new Map(actual.indexes.map(x => [objectKey(x), x]));
        const candidateIndexes = new Map(candidate.indexes.map(x => [objectKey(x), x]));
        const missingExpectedIndexes = [...candidateIndexes.keys()].filter(key => !actualIndexes.has(key));
        const unexpectedActualIndexes = [...actualIndexes.keys()].filter(key => !candidateIndexes.has(key));
        assert.deepEqual(missingExpectedIndexes, ['public.chattbm_chat_history.chattbm_chat_history_updated_at_idx']);
        assert.deepEqual(unexpectedActualIndexes, []);
        for (const [key, actualIndex] of actualIndexes) {
            assert.deepEqual(actualIndex, candidateIndexes.get(key),
                'index definition and health flags must match for ' + key);
        }
        assert.equal(actual.tables.reduce((sum, table) => sum + table.columns.length, 0), 67);

        await client.query('BEGIN READ ONLY');
        await assert.rejects(
            client.query('CREATE TABLE chattbm_full_manifest_write_guard (id integer)'),
            /read-only transaction/i
        );
        await client.query('ROLLBACK');
        const guard = await client.query(
            "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name='chattbm_full_manifest_write_guard'"
        );
        assert.equal(guard.rows[0].count, 0);
    } finally {
        if (client._connected) {
            for (const name of tableNames) {
                await client.query('DROP TABLE IF EXISTS public.' + name + ' CASCADE');
            }
            await client.end();
        }
    }
});
