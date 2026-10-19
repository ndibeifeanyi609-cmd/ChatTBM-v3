'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');

const records = new Map();
const identities = new Map();
const originalLoad = Module._load;

function identity(userId, type, subject) {
    return JSON.stringify([userId, type, subject]);
}

const fakePool = {
    async query(sql, values = []) {
        const q = sql.replace(/\s+/g, ' ').trim();
        if (q.startsWith('CREATE TABLE') || q.startsWith('CREATE INDEX')) {
            return { rows: [] };
        }
        if (q.startsWith('INSERT INTO chattbm_memories')) {
            const [id, userId, type, subject, lifecycle, payload, createdAt, updatedAt] = values;
            const key = identity(userId, type, subject);
            if (identities.has(key)) return { rows: [] };
            const memory = JSON.parse(payload);
            records.set(id, { id, userId, type, subject, lifecycle, payload: memory, createdAt, updatedAt });
            identities.set(key, id);
            return { rows: [{ payload: memory }] };
        }
        if (q.startsWith('SELECT payload FROM chattbm_memories WHERE id =')) {
            const row = records.get(values[0]);
            return { rows: row ? [{ payload: row.payload }] : [] };
        }
        if (q.startsWith('SELECT payload FROM chattbm_memories WHERE user_id =') && q.includes('memory_type =')) {
            const row = [...records.values()].find(r => r.userId === values[0] && r.type === values[1] && r.subject === values[2]);
            return { rows: row ? [{ payload: row.payload }] : [] };
        }
        if (q.startsWith('SELECT payload FROM chattbm_memories WHERE user_id =')) {
            return { rows: [...records.values()].filter(r => r.userId === values[0]).map(r => ({ payload: r.payload })) };
        }
        if (q.startsWith('SELECT payload FROM chattbm_memories ORDER BY')) {
            return { rows: [...records.values()].map(r => ({ payload: r.payload })) };
        }
        if (q.startsWith('UPDATE chattbm_memories')) {
            const [id, userId, type, subject, lifecycle, payload, updatedAt] = values;
            const row = records.get(id);
            if (!row || row.userId !== userId) return { rows: [] };
            const memory = JSON.parse(payload);
            const oldKey = identity(row.userId, row.type, row.subject);
            const newKey = identity(userId, type, subject);
            if (newKey !== oldKey && identities.has(newKey)) throw new Error('duplicate identity');
            identities.delete(oldKey);
            identities.set(newKey, id);
            records.set(id, { ...row, type, subject, lifecycle, payload: memory, updatedAt });
            return { rows: [{ payload: memory }] };
        }
        if (q.startsWith('DELETE FROM chattbm_memories')) {
            const row = records.get(values[0]);
            if (!row || row.userId !== values[1]) return { rows: [] };
            records.delete(row.id);
            identities.delete(identity(row.userId, row.type, row.subject));
            return { rows: [{ payload: row.payload }] };
        }
        throw new Error('Unexpected SQL in test: ' + q);
    }
};

Module._load = function(request, parent, isMain) {
    if (request === '../database/Postgres' && parent?.filename?.endsWith('/memory/PostgresMemoryPersistence.js')) {
        return { getPool: () => fakePool };
    }
    return originalLoad.call(this, request, parent, isMain);
};

async function main() {
    try {
        const P = require('../memory/PostgresMemoryPersistence');
        await P.initialize();

        const memory = {
            id: 'memory-1', version: '1.0', userId: 'user-a', type: 'fact',
            subject: 'project nickname', value: 'Blue Falcon', lifecycle: 'active',
            createdAt: '2026-10-19T00:00:00.000Z', updatedAt: '2026-10-19T00:00:00.000Z'
        };
        const saved = await P.save(memory);
        assert.equal(saved.success, true);
        assert.equal((await P.getById(memory.id)).value, 'Blue Falcon');
        assert.equal((await P.getByUser('user-a')).length, 1);
        assert.equal((await P.getByUser('user-b')).length, 0);

        const duplicate = await P.save(memory);
        assert.equal(duplicate.success, true);
        assert.equal(duplicate.idempotent, true);

        const conflict = await P.save({ ...memory, id: 'memory-2', value: 'Red Kite' });
        assert.equal(conflict.success, false);
        assert.equal(conflict.conflict, true);

        const updated = await P.update({ ...memory, value: 'Blue Falcon Updated', updatedAt: '2026-10-19T00:01:00.000Z' });
        assert.equal(updated.success, true);
        assert.equal((await P.getById(memory.id)).value, 'Blue Falcon Updated');

        const wrongOwner = await P.remove(memory.id, 'user-b');
        assert.equal(wrongOwner.success, false);
        assert.equal(wrongOwner.ownershipFailure, true);

        const removed = await P.remove(memory.id, 'user-a');
        assert.equal(removed.success, true);
        assert.equal(await P.getById(memory.id), null);
        console.log('PostgreSQL memory adapter tests passed.');
    } finally {
        Module._load = originalLoad;
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
