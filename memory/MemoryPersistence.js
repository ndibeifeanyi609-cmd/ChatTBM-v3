'use strict';

const crypto = require('crypto');

const memoriesById = new Map();
const memoryIdsByKey = new Map();

// =====================================
// CREATE MEMORY IDENTITY KEY
// =====================================

function createMemoryKey(memory) {

    if (
        !memory ||
        typeof memory !== 'object'
    ) {
        return null;
    }

    const identity = JSON.stringify([
        memory.userId ?? null,
        memory.type ?? null,
        memory.subject ?? null
        
    ]);

    return crypto
        .createHash('sha256')
        .update(identity)
        .digest('hex');

}

// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(memory) {

    if (
        !memory ||
        !memory.id ||
        !memory.userId ||
        !memory.version ||
        !memory.type
    ) {
        return {
            success: false,
            memory: null,
            error: 'Invalid memory.'
        };
    }

    const memoryKey =
        createMemoryKey(memory);

    if (!memoryKey) {
        return {
            success: false,
            memory: null,
            error:
                'Unable to create memory identity.'
        };
    }

    const existingById =
        memoriesById.get(memory.id);

    if (existingById) {

        if (
            JSON.stringify(existingById) ===
            JSON.stringify(memory)
        ) {
            return {
                success: true,
                memory: { ...existingById },
                memoryKey,
                idempotent: true,
                conflict: false
            };
        }

        return {
            success: false,
            memory: { ...existingById },
            memoryKey,
            idempotent: false,
            conflict: true,
            error:
                'Memory ID already exists.'
        };
    }

    const existingId =
        memoryIdsByKey.get(memoryKey);

    if (
        existingId &&
        existingId !== memory.id
    ) {

        const existing =
            memoriesById.get(existingId);

        return {
            success: false,
            memory: existing
                ? { ...existing }
                : null,
            memoryKey,
            idempotent: false,
            conflict: true,
            error:
                'Memory identity already exists.'
        };
    }

    memoriesById.set(
        memory.id,
        { ...memory }
    );

    memoryIdsByKey.set(
        memoryKey,
        memory.id
    );

    return {
        success: true,
        memory: { ...memory },
        memoryKey,
        idempotent: false,
        conflict: false
    };
}

// =====================================
// UPDATE MEMORY
// =====================================

function updateMemory(memory) {

    if (
        !memory ||
        !memory.id ||
        !memory.userId
    ) {
        return {
            success: false,
            memory: null,
            error: 'Invalid memory.'
        };
    }

    const existing =
        memoriesById.get(memory.id);

    if (!existing) {
        return {
            success: false,
            memory: null,
            error: 'Memory not found.'
        };
    }

    if (
        existing.userId !==
        memory.userId
    ) {
        return {
            success: false,
            memory: { ...existing },
            error:
                'Memory ownership cannot be changed.'
        };
    }

    const oldKey =
        createMemoryKey(existing);

    const newKey =
        createMemoryKey(memory);

    if (!newKey) {
        return {
            success: false,
            memory: { ...existing },
            error:
                'Unable to create memory identity.'
        };
    }

    const existingId =
        memoryIdsByKey.get(newKey);

    if (
        existingId &&
        existingId !== memory.id
    ) {

        const conflictingMemory =
            memoriesById.get(existingId);

        return {

            success: false,
            memory:
                conflictingMemory
                    ? { ...conflictingMemory }
                    : { ...existing },
            memoryKey: newKey,
            conflict: true,
            error:
                'Memory identity already exists.'
        };
    }

    memoriesById.set(
        memory.id,
        { ...memory }
    );

    if (
        oldKey &&
        oldKey !== newKey &&
        memoryIdsByKey.get(oldKey) ===
            memory.id
    ) {
        memoryIdsByKey.delete(oldKey);
    }

    memoryIdsByKey.set(
        newKey,
        memory.id
    );

    return {
        success: true,
        memory: { ...memory },
        memoryKey: newKey,
        conflict: false
    };
}

// =====================================
// GET MEMORY
// =====================================

function getMemory(id) {

    if (!id) {
        return null;
    }

    const memory =
        memoriesById.get(id);

    return memory
        ? { ...memory }
        : null;
}

// =====================================
// GET MEMORIES BY USER
// =====================================

function getMemoriesByUser(userId) {

    if (!userId) {
        return [];
    }

    return [
        ...memoriesById.values()
    ]
        .filter(
            memory =>
                memory.userId === userId
        )
        .map(
            memory => ({ ...memory })
        );
}

// =====================================
// DELETE MEMORY
// =====================================

function deleteMemory(
    id,
    userId
) {

    const memory =
        memoriesById.get(id);

    if (!memory) {
        return {
            success: false,
            memory: null,
            error: 'Memory not found.'
        };
    }

    if (
        memory.userId !== userId
    ) {
        return {
            success: false,
            memory: { ...memory },
            error:
                'Memory ownership violation.'
        };
    }

    const memoryKey =
        createMemoryKey(memory);

    memoriesById.delete(id);

    if (
        memoryKey &&
        memoryIdsByKey.get(memoryKey) === id
    ) {
        memoryIdsByKey.delete(
            memoryKey
        );
    }

    return {
        success: true,
        memory: { ...memory }
    };
}

// =====================================
// CLEAR USER MEMORIES
// =====================================

function clearMemoriesByUser(userId) {

    if (!userId) {
        return 0;
    }

    const memories =
        getMemoriesByUser(userId);

    memories.forEach(memory => {

        deleteMemory(
            memory.id,
            userId
        );

    });

    return memories.length;
}

// =====================================
// CLEAR ALL STORAGE
// =====================================

function clearMemoryPersistence() {

    memoriesById.clear();
    memoryIdsByKey.clear();

}

module.exports = {

    createMemoryKey,
    saveMemory,
    updateMemory,
    getMemory,
    getMemoriesByUser,
    deleteMemory,
    clearMemoriesByUser,
    clearMemoryPersistence

};
