'use strict';

const assert = require('node:assert/strict');
const { getPool, closeDatabase } = require('../database/Postgres');
const Persistence = require('../memory/PostgresMemoryPersistence');

if (!process.env.DATABASE_URL) {
    console.log('Real PostgreSQL integration test skipped: DATABASE_URL is not configured.');
    process.exit(0);
}

async function main() {
    const pool = getPool();
    assert.ok(pool, 'DATABASE_URL must be configured for the PostgreSQL integration test.');

    const suffix = `ci-${process.pid}-${Date.now()}`;
    const userId = `memory-test-user-${suffix}`;
    const memory = {
        id: `memory-${suffix}`,
        version: '1.0',
        userId,
        type: 'fact',
        subject: `project nickname ${suffix}`,
        value: 'Blue Falcon',
        lifecycle: 'active',
        provenance: { sourceType: 'test', sourceId: suffix },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await Persistence.initialize();
        const saved = await Persistence.save(memory);
        assert.equal(saved.success, true);

        const loaded = await Persistence.getById(memory.id);
        assert.equal(loaded.value, 'Blue Falcon');

        const ownMemories = await Persistence.getByUser(userId);
        assert.equal(ownMemories.some(item => item.id === memory.id), true);

        const otherUserMemories = await Persistence.getByUser(`other-${suffix}`);
        assert.equal(otherUserMemories.length, 0);

        const duplicate = await Persistence.save(memory);
        assert.equal(duplicate.success, true);
        assert.equal(duplicate.idempotent, true);

        const removed = await Persistence.remove(memory.id, userId);
        assert.equal(removed.success, true);
        assert.equal(await Persistence.getById(memory.id), null);

        console.log('Real PostgreSQL memory integration test passed.');
    } finally {
        await pool.query('DELETE FROM chattbm_memories WHERE user_id = $1', [userId]);
        await closeDatabase();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
