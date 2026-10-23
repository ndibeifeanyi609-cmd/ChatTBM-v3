'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const MemoryBoundary = require('../memory/MemoryBoundary');

const originalGetPostgres = MemoryBoundary.getPersistentMemoriesByUser;
const originalDeletePostgres = MemoryBoundary.deletePersistentMemory;
const originalGetFile = MemoryBoundary.getMemoriesByUser;
const originalDeleteFile = MemoryBoundary.deleteMemory;
const originalDatabaseUrl = process.env.DATABASE_URL;

const postgresRecords = [
    { id: 'pg-memory-a', userId: 'user-a', type: 'fact', subject: 'postgres-test', value: '12345', lifecycle: 'active' }
];
const fileRecords = [
    { id: 'file-memory-a', userId: 'user-a', type: 'fact', subject: 'file-test', value: '67890', lifecycle: 'active' }
];

MemoryBoundary.getPersistentMemoriesByUser = async userId => ({ success: true, memories: postgresRecords.filter(memory => memory.userId === userId) });
MemoryBoundary.deletePersistentMemory = async (id, userId) => {
    const index = postgresRecords.findIndex(memory => memory.id === id && memory.userId === userId);
    if (index < 0) return { success: false, error: 'Memory not found.' };
    postgresRecords.splice(index, 1);
    return { success: true, memory: { id } };
};
MemoryBoundary.getMemoriesByUser = userId => ({ success: true, memories: fileRecords.filter(memory => memory.userId === userId) });
MemoryBoundary.deleteMemory = (id, userId) => {
    const index = fileRecords.findIndex(memory => memory.id === id && memory.userId === userId);
    if (index < 0) return { success: false, error: 'Memory not found.' };
    fileRecords.splice(index, 1);
    return { success: true, memory: { id } };
};

async function withServer(run) {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => { req.authUser = { id: req.headers['x-test-user'] || '' }; next(); });
    app.use('/api/memories', require('./memoryRoutes').router);
    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api/memories';
    try { await run(base); }
    finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}

test('PostgreSQL Saved Memories routes list and delete only the authenticated user records', async () => {
    process.env.DATABASE_URL = 'test-postgres-mode';
    await withServer(async base => {
        const headers = user => ({ 'Content-Type': 'application/json', 'x-test-user': user });
        const ownerList = await fetch(base, { headers: headers('user-a') });
        assert.equal(ownerList.status, 200);
        assert.equal((await ownerList.json()).memories[0].value, '12345');
        const foreignList = await fetch(base, { headers: headers('user-b') });
        assert.equal((await foreignList.json()).memories.length, 0);
        const foreignDelete = await fetch(base + '/pg-memory-a', { method: 'DELETE', headers: headers('user-b') });
        assert.equal(foreignDelete.status, 404);
        assert.equal(postgresRecords.length, 1);
        const ownerDelete = await fetch(base + '/pg-memory-a', { method: 'DELETE', headers: headers('user-a') });
        assert.equal(ownerDelete.status, 200);
        assert.equal(postgresRecords.length, 0);
    });
});

test('file-backed Saved Memories routes use the same store and enforce ownership', async () => {
    delete process.env.DATABASE_URL;
    await withServer(async base => {
        const headers = user => ({ 'Content-Type': 'application/json', 'x-test-user': user });
        const ownerList = await fetch(base, { headers: headers('user-a') });
        assert.equal(ownerList.status, 200);
        assert.equal((await ownerList.json()).memories[0].value, '67890');
        const foreignList = await fetch(base, { headers: headers('user-b') });
        assert.equal((await foreignList.json()).memories.length, 0);
        const foreignDelete = await fetch(base + '/file-memory-a', { method: 'DELETE', headers: headers('user-b') });
        assert.equal(foreignDelete.status, 404);
        assert.equal(fileRecords.length, 1);
        const ownerDelete = await fetch(base + '/file-memory-a', { method: 'DELETE', headers: headers('user-a') });
        assert.equal(ownerDelete.status, 200);
        assert.equal(fileRecords.length, 0);
        const unauthenticated = await fetch(base);
        assert.equal(unauthenticated.status, 401);
    });
});

test.after(() => {
    MemoryBoundary.getPersistentMemoriesByUser = originalGetPostgres;
    MemoryBoundary.deletePersistentMemory = originalDeletePostgres;
    MemoryBoundary.getMemoriesByUser = originalGetFile;
    MemoryBoundary.deleteMemory = originalDeleteFile;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
});
