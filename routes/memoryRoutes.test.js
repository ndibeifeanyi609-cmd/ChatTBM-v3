'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const MemoryBoundary = require('../memory/MemoryBoundary');

const originalGet = MemoryBoundary.getPersistentMemoriesByUser;
const originalDelete = MemoryBoundary.deletePersistentMemory;
const records = [
    { id: 'memory-a', userId: 'user-a', type: 'fact', subject: 'test', value: '12345', lifecycle: 'active' }
];

MemoryBoundary.getPersistentMemoriesByUser = async userId => ({
    success: true,
    memories: records.filter(memory => memory.userId === userId)
});
MemoryBoundary.deletePersistentMemory = async (id, userId) => {
    const index = records.findIndex(memory => memory.id === id && memory.userId === userId);
    if (index < 0) return { success: false, error: 'Memory ownership violation.' };
    records.splice(index, 1);
    return { success: true, memory: { id } };
};

test('memory routes list and delete only the authenticated user memories', async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        req.authUser = { id: req.headers['x-test-user'] || '' };
        next();
    });
    app.use('/api/memories', require('./memoryRoutes').router);
    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api/memories';
    const headers = user => ({ 'Content-Type': 'application/json', 'x-test-user': user });

    try {
        const ownerList = await fetch(base, { headers: headers('user-a') });
        assert.equal(ownerList.status, 200);
        assert.equal((await ownerList.json()).memories[0].value, '12345');

        const foreignList = await fetch(base, { headers: headers('user-b') });
        assert.equal(foreignList.status, 200);
        assert.equal((await foreignList.json()).memories.length, 0);

        const foreignDelete = await fetch(base + '/memory-a', { method: 'DELETE', headers: headers('user-b') });
        assert.equal(foreignDelete.status, 404);
        assert.equal(records.length, 1);

        const ownerDelete = await fetch(base + '/memory-a', { method: 'DELETE', headers: headers('user-a') });
        assert.equal(ownerDelete.status, 200);
        assert.equal(records.length, 0);

        const unauthenticated = await fetch(base);
        assert.equal(unauthenticated.status, 401);
    } finally {
        MemoryBoundary.getPersistentMemoriesByUser = originalGet;
        MemoryBoundary.deletePersistentMemory = originalDelete;
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});
