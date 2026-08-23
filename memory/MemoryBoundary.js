'use strict';

// =====================================
// ChatTBM
// REG-088 Memory
//
// Canonical Memory Boundary
//
// Responsibility:
// - Validate incoming Memory input
// - Create canonical Memory objects
// - Preserve ownership
// - Delegate lifecycle authority
// - Delegate registry authority
// - Delegate persistence authority
// - Normalize controlled failures
//
// Does NOT:
// - Own Memory state
// - Maintain a competing store
// - Rank or retrieve Memory
// - Implement legacy Memory logic
// - Mutate Learning
// =====================================

const {
    createMemoryObject
} = require('./MemoryObject');

const {
    transitionMemory
} = require('./MemoryLifecycle');

const {
    registerMemory,
    getMemory: getRegisteredMemory,
    getMemoriesByUser: getRegisteredMemoriesByUser,
    deleteMemory: deleteRegisteredMemory
} = require('./MemoryRegistry');

const {
    saveMemory: persistMemory,
    updateMemory: persistUpdatedMemory,
    getMemory: getPersistedMemory,
    getMemoriesByUser: getPersistedMemoriesByUser,
    deleteMemory: deletePersistedMemory
} = require('./MemoryPersistence');

// =====================================
// CREATE MEMORY
// =====================================

function createMemory(data = {}) {

    try {

        const memory =
            createMemoryObject(data);

        const registration =
            registerMemory(memory);

        if (registration.conflict) {

            return {
                success: false,
                memory: registration.memory || null,
                error:
                    registration.error ||
                    'Memory registration conflict.',
                conflict: true
            };

        }

        const persistence =
            persistMemory(memory);

        if (!persistence.success) {

            // Registry state must not be presented
            // as successful persistence.
            deleteRegisteredMemory(
                memory.id,
                memory.userId
            );

            return {
                success: false,
                memory: null,
                error:
                    persistence.error ||
                    'Memory persistence failed.',
                persistenceFailure: true
            };

        }

        return {
            success: true,
            memory: persistence.memory,
            idempotent:
                Boolean(registration.idempotent) ||
                Boolean(persistence.idempotent),
            conflict: false
        };

    } catch (error) {

        return {
            success: false,
            memory: null,
            error:
                error.message ||
                'Memory creation failed.'
        };

    }

}

// =====================================
// GET MEMORY
// =====================================

function getMemory(
    memoryId,
    userId
) {

    try {

        const memory =
            getRegisteredMemory(memoryId);

        if (!memory) {

            return {
                success: false,
                memory: null,
                error: 'Memory not found.'
            };

        }

        if (
            userId &&
            memory.userId !== userId
        ) {

            return {
                success: false,
                memory: null,
                error:
                    'Memory ownership violation.'
            };

        }

        return {
            success: true,
            memory
        };

    } catch (error) {

        return {
            success: false,
            memory: null,
            error:
                error.message ||
                'Memory retrieval failed.'
        };

    }

}

// =====================================
// GET USER MEMORIES
// =====================================

function getMemoriesByUser(userId) {

    try {

        if (!userId) {

            return {
                success: false,
                memories: [],
                error: 'User ID is required.'
            };

        }

        const memories =
            getRegisteredMemoriesByUser(userId);

        return {
            success: true,
            memories
        };

    } catch (error) {

        return {
            success: false,
            memories: [],
            error:
                error.message ||
                'Memory retrieval failed.'
        };

    }

}

// =====================================
// UPDATE MEMORY
// =====================================

function updateMemory(
    memory,
    userId
) {

    try {

        if (!memory || !memory.id) {

            return {
                success: false,
                memory: null,
                error: 'Memory ID is required.'
            };

        }

        const existing =
            getRegisteredMemory(memory.id);

        if (!existing) {

            return {
                success: false,
                memory: null,
                error: 'Memory not found.'
            };

        }

        if (
            !userId ||
            existing.userId !== userId
        ) {

            return {
                success: false,
                memory: null,
                error:
                    'Memory ownership violation.'
            };

        }

        const updatedMemory = {
            ...existing,
            ...memory,
            id: existing.id,
            userId: existing.userId
        };

        const registration =
            registerMemory(updatedMemory);

        if (registration.conflict) {

            return {
                success: false,
                memory:
                    registration.memory || existing,
                error:
                    registration.error ||
                    'Memory registration conflict.',
                conflict: true
            };

        }

        const persistence =
            persistUpdatedMemory(
                updatedMemory
            );

        if (!persistence.success) {

            registerMemory(existing);

            return {
                success: false,
                memory: null,
                error:
                    persistence.error ||
                    'Memory persistence failed.',
                persistenceFailure: true
            };

        }

        return {
            success: true,
            memory: persistence.memory,
            idempotent:
                Boolean(registration.idempotent),
            conflict: false
        };

    } catch (error) {

        return {
            success: false,
            memory: null,
            error:
                error.message ||
                'Memory update failed.'
        };

    }

}

// =====================================
// TRANSITION MEMORY
// =====================================

function transitionMemoryLifecycle(
    memoryId,
    nextState,
    userId
) {

    try {

        const existing =
            getRegisteredMemory(memoryId);

        if (!existing) {

            return {
                success: false,
                memory: null,
                error: 'Memory not found.'
            };

        }

        if (
            !userId ||
            existing.userId !== userId
        ) {

            return {
                success: false,
                memory: null,
                error:
                    'Memory ownership violation.'
            };

        }

        const transition =
            transitionMemory(
                existing,
                nextState
            );

        if (!transition.success) {

            return {
                success: false,
                memory: existing,
                error:
                    transition.error ||
                    'Invalid memory lifecycle transition.'
            };

        }

        if (transition.idempotent) {

            return {
                success: true,
                memory: existing,
                idempotent: true
            };

        }

        const registration =
            registerMemory(
                transition.memory
            );

        if (registration.conflict) {

            return {
                success: false,
                memory:
                    registration.memory || existing,
                error:
                    registration.error ||
                    'Memory registration conflict.',
                conflict: true
            };

        }

        const persistence =
            persistUpdatedMemory(
                transition.memory
            );

        if (!persistence.success) {

            registerMemory(existing);

            return {
                success: false,
                memory: null,
                error:
                    persistence.error ||
                    'Memory persistence failed.',
                persistenceFailure: true
            };

        }

        return {
            success: true,
            memory: persistence.memory,
            idempotent: false
        };

    } catch (error) {

        return {
            success: false,
            memory: null,
            error:
                error.message ||
                'Memory lifecycle transition failed.'
        };

    }

}

// =====================================
// DELETE MEMORY
// =====================================

function deleteMemory(
    memoryId,
    userId
) {

    try {

        if (!memoryId) {

            return {
                success: false,
                memory: null,
                error: 'Memory ID is required.'
            };

        }

        const existing =
            getRegisteredMemory(memoryId);

        if (!existing) {

            return {
                success: false,
                memory: null,
                error: 'Memory not found.'
            };

        }

        if (
            !userId ||
            existing.userId !== userId
        ) {

            return {
                success: false,
                memory: null,
                error:
                    'Memory ownership violation.'
            };

        }

        const persisted =
            deletePersistedMemory(
                memoryId,
                userId
            );

        if (!persisted.success) {

            return {
                success: false,
                memory: null,
                error:
                    persisted.error ||
                    'Memory persistence deletion failed.',
                persistenceFailure: true
            };

        }

        const registered =
            deleteRegisteredMemory(
                memoryId,
                userId
            );

        if (!registered.success) {

            return {
                success: false,
                memory: null,
                error:
                    registered.error ||
                    'Memory registry deletion failed.',
                registryFailure: true
            };

        }

        return {
            success: true,
            memory:
                persisted.memory || existing
        };

    } catch (error) {

        return {
            success: false,
            memory: null,
            error:
                error.message ||
                'Memory deletion failed.'
        };

    }

}


// =====================================
// EXPORTS
// =====================================

module.exports = {
    createMemory,
    getMemory,
    getMemoriesByUser,
    updateMemory,
    transitionMemoryLifecycle,
    deleteMemory
};
