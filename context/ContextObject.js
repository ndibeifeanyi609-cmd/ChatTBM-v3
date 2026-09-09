'use strict';

// =====================================
// ChatTBM
// REG-090 Context
//
// Canonical Context Object
// =====================================

const {
    isValidLifecycleState
} = require('./ContextLifecycle');

const CONTEXT_VERSION = '1.0';

function createContextObject({
    id,
    userId,
    interactionId,
    value = {},
    lifecycle = 'active',
    version = 1,
    createdAt = new Date().toISOString(),
    updatedAt = createdAt
} = {}) {

    if (!id) {
        throw new Error(
            'Context id is required.'
        );
    }

    if (!userId) {
        throw new Error(
            'Context userId is required.'
        );
    }

    if (!interactionId) {
        throw new Error(
            'Context interactionId is required.'
        );
    }

    if (!isValidLifecycleState(lifecycle)) {
        throw new Error(
            `Invalid context lifecycle state: ${lifecycle}`
        );
    }

    if (!Number.isInteger(version) || version < 1) {
        throw new Error(
            'Context version must be a positive integer.'
        );
    }

    return {
        id,
        version,
        schemaVersion: CONTEXT_VERSION,
        userId,
        interactionId,
        value,
        lifecycle,
        createdAt,
        updatedAt
    };
}

module.exports = {
    CONTEXT_VERSION,
    createContextObject
};
