'use strict';

// =====================================
// ChatTBM
// REG-088 Memory
//
// Canonical Memory Object
// =====================================

const {
    isValidMemoryType
} = require('./MemoryTypes');

const MEMORY_OBJECT_VERSION = '1.0';

// =====================================
// CREATE MEMORY OBJECT
// =====================================

function createMemoryObject(data = {}) {

    const type = data.type;

    if (!isValidMemoryType(type)) {
        throw new Error(
            `Invalid memory type: ${type}`
        );
    }

    const userId =
        data.userId || 'guest';

    if (!userId) {
        throw new Error(
            'Memory userId is required'
        );
    }

    const now =
        new Date().toISOString();

    return {

        // ===============================
        // IDENTITY
        // ===============================

        id:
            data.id ||
            createMemoryId(),

        version:
            MEMORY_OBJECT_VERSION,

        // ===============================
        // OWNERSHIP
        // ===============================

        userId,

        // ===============================
        // SEMANTIC TYPE
        // ===============================

        type,

        // ===============================
        // SUBJECT
        // ===============================

        subject:
            data.subject ?? null,

        // ===============================
        // VALUE
        // ===============================

        value:
            data.value ?? null,

        // ===============================
        // PROVENANCE
        // ===============================

        provenance: {

            sourceType:
                data.provenance?.sourceType ||
                'ChatTBM',

            sourceId:
                data.provenance?.sourceId ||
                null,

            sourceVersion:
                data.provenance?.sourceVersion ||
                null

        },

        // ===============================
        // LIFECYCLE
        // ===============================

        lifecycle:
            data.lifecycle ||
            'proposed',

        // ===============================
        // TIMESTAMPS
        // ===============================

        createdAt:
            data.createdAt ||
            now,

        updatedAt:
            data.updatedAt ||
            now

    };

}

// =====================================
// MEMORY ID
// =====================================

function createMemoryId() {

    return (
        'memory_' +
        Date.now() +
        '_' +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}

module.exports = {
    MEMORY_OBJECT_VERSION,
    createMemoryObject,
    createMemoryId
};
