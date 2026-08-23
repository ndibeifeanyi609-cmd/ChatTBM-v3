'use strict';

// =====================================
// ChatTBM
// REG-088 Memory
//
// Canonical Memory Registry
//
// Responsibility:
// - Validate canonical Memory objects
// - Register canonical Memory
// - Preserve Memory identity
// - Preserve ownership
// - Protect semantic duplicates
// - Support canonical retrieval
//
// Does NOT:
// - Own persistence
// - Extract Memory
// - Rank Memory
// - Mutate Learning
// - Implement legacy Memory logic
// =====================================

const {
    isValidMemoryType
} = require('./MemoryTypes');

const {
    isValidLifecycleState
} = require('./MemoryLifecycle');

const registry = new Map();

const REQUIRED_FIELDS = [
    'id',
    'version',
    'userId',
    'type',
    'subject',
    'value',
    'lifecycle',
    'createdAt',
    'updatedAt'
];

// =====================================
// VALIDATE MEMORY
// =====================================

function validateMemory(memory) {

    if (
        !memory ||
        typeof memory !== 'object' ||
        Array.isArray(memory)
    ) {
        throw new Error(
            'Memory must be an object'
        );
    }

    for (const field of REQUIRED_FIELDS) {

        if (
            memory[field] === undefined ||
            memory[field] === null ||
            memory[field] === ''
        ) {
            throw new Error(
                `Missing required memory field: ${field}`
            );
        }

    }

    if (memory.version !== '1.0') {

        throw new Error(
            `Unsupported memory version: ${memory.version}`
        );

    }

    if (!isValidMemoryType(memory.type)) {

        throw new Error(
            `Invalid memory type: ${memory.type}`
        );

    }

    if (!isValidLifecycleState(memory.lifecycle)) {

        throw new Error(
            `Invalid memory lifecycle state: ${memory.lifecycle}`
        );

    }

    return true;
}

// =====================================
// MEMORY IDENTITY
// =====================================

function getMemoryIdentity(memory) {

    return [
        memory.userId ?? null,
        memory.type ?? null,
        memory.subject ?? null,
    ];

}

// =====================================
// IDENTITY COMPARISON
// =====================================

function identitiesAreEquivalent(
    existing,
    incoming
) {

    return JSON.stringify(
        getMemoryIdentity(existing)
    ) === JSON.stringify(
        getMemoryIdentity(incoming)
    );

}

// =====================================
// RECORD COMPARISON
// =====================================

function recordsAreEquivalent(
    existing,
    incoming
) {

    return (
        JSON.stringify(existing) ===
        JSON.stringify(incoming)
    );

}

// =====================================
// REGISTER MEMORY
// =====================================

function registerMemory(memory) {

    validateMemory(memory);

    const existing =
        registry.get(memory.id);
    if (!existing) {

        for (const registered of registry.values()) {

            if (
                identitiesAreEquivalent(
                    registered,
                    memory
                )
            ) {

                return {
                    memory: { ...registered },
                    registered: false,
                    updated: false,
                    idempotent: false,
                    conflict: true,
                    error:
                        "Memory semantic identity already exists."
                };

            }

        }

        const stored = {
            ...memory
        };


        registry.set(
            memory.id,
            stored
        );

        return {
            memory: { ...stored },
            registered: true,
            updated: false,
            idempotent: false,
            conflict: false
        };

    }

    if (
        !identitiesAreEquivalent(
            existing,
            memory
        )
    ) {

        return {
            memory: { ...existing },
            registered: false,
            updated: false,
            idempotent: false,
            conflict: true,
            error:
                'Memory identity conflict.'
        };

    }

    if (
        recordsAreEquivalent(
            existing,
            memory
        )
    ) {

        return {
            memory: { ...existing },
            registered: false,
            updated: false,
            idempotent: true,
            conflict: false
        };

    }

    const updated = {
        ...existing,
        ...memory,
 
        id: existing.id,
        userId: existing.userId
    };

    registry.set(
        memory.id,
        updated
    );

    return {
        memory: { ...updated },
        registered: false,
        updated: true,
        idempotent: false,
        conflict: false
    };

}

// =====================================
// GET MEMORY
// =====================================

function getMemory(memoryId) {

    if (!memoryId) {
        throw new Error(
            'Memory ID is required'
        );
    }

    const memory =
        registry.get(memoryId);

    return memory
        ? { ...memory }
        : null;

}

// =====================================
// GET MEMORIES BY USER
// =====================================

function getMemoriesByUser(userId) {

    if (!userId) {
        throw new Error(
            'User ID is required'
        );
    }

    return [
        ...registry.values()
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
// HAS MEMORY
// =====================================

function hasMemory(memoryId) {

    if (!memoryId) {
        throw new Error(
            'Memory ID is required'
        );
    }

    return registry.has(memoryId);

}

// =====================================
// DELETE MEMORY
// =====================================

function deleteMemory(
    memoryId,
    userId
) {

    if (!memoryId) {
        return {
            success: false,
            error: 'Memory ID is required.'
        };
    }

    if (!userId) {
        return {
            success: false,
            error: 'User ID is required.'
        };
    }

    const existing =
        registry.get(memoryId);

    if (!existing) {
        return {
            success: false,
            memory: null,
            error: 'Memory not found.'
        };
    }

    if (existing.userId !== userId) {
        return {
            success: false,
            memory: { ...existing },
            error:
                'Memory ownership violation.'
        };
    }

    registry.delete(memoryId);

    return {
        success: true,
        memory: { ...existing }
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

    memories.forEach(
        memory => {
            registry.delete(memory.id);
        }
    );

    return memories.length;

}

// =====================================
// CLEAR REGISTRY
// =====================================

function clearRegistry() {

    registry.clear();

}

// =====================================
// EXPORTS
// =====================================

module.exports = {

    REQUIRED_FIELDS,

    validateMemory,

    getMemoryIdentity,

    identitiesAreEquivalent,

    recordsAreEquivalent,

    registerMemory,

    getMemory,

    getMemoriesByUser,

    hasMemory,

    deleteMemory,

    clearMemoriesByUser,

    clearRegistry

};
