'use strict';

// =====================================
// ChatTBM
// REG-090 Context
//
// Canonical Context Persistence
// =====================================

const crypto = require('crypto');

const { canTransition } = require('./ContextLifecycle');

const contextsById = new Map();
const contextIdsByKey = new Map();

function createContextKey(context) {
    return crypto
        .createHash('sha256')
        .update(
            JSON.stringify([
                context.userId,
                context.interactionId
            ])
        )
        .digest('hex');
}

function createContextId(userId, interactionId) {
    return `context_${crypto
        .createHash('sha256')
        .update(
            JSON.stringify([
                userId,
                interactionId
            ])
        )
        .digest('hex')}`;
}

function saveContext(context) {
    if (!context || !context.id) {
        return {
            success: false,
            context: null,
            error: 'Context object with id is required.'
        };
    }

    if (!context.userId || !context.interactionId) {
        return {
            success: false,
            context: null,
            error: 'Context userId and interactionId are required.'
        };
    }

    const key = createContextKey(context);
    const existingId = contextIdsByKey.get(key);

    if (existingId) {
        const existing = contextsById.get(existingId);

        if (
            existing &&
            existing.id === context.id &&
            JSON.stringify(existing) === JSON.stringify(context)
        ) {
            return {
                success: true,
                context: existing,
                idempotent: true
            };
        }

        return {
            success: false,
            context: existing || null,
            error: 'Context identity collision.'
        };
    }

    if (contextsById.has(context.id)) {
        return {
            success: false,
            context: contextsById.get(context.id),
            error: 'Context id already exists.'
        };
    }

    const stored = { ...context };

    contextsById.set(stored.id, stored);
    contextIdsByKey.set(key, stored.id);

    return {
        success: true,
        context: stored,
        idempotent: false
    };
}

function updateContext(context) {
    if (!context || !context.id) {
        return {
            success: false,
            context: null,
            error: 'Context object with id is required.'
        };
    }

    const existing = contextsById.get(context.id);

    if (!existing) {
        return {
            success: false,
            context: null,
            error: 'Context not found.'
        };
    }

    if (existing.userId !== context.userId) {
        return {
            success: false,
            context: existing,
            error: 'Context ownership violation.'
        };
    }

    if (existing.interactionId !== context.interactionId) {
        return {
            success: false,
            context: existing,
            error: 'Context identity is immutable.'
        };
    }

    if (existing.schemaVersion !== context.schemaVersion) {
        return {
            success: false,
            context: existing,
            error: 'Context schemaVersion is immutable.'
        };
    }

    if (existing.createdAt !== context.createdAt) {
        return {
            success: false,
            context: existing,
            error: 'Context createdAt is immutable.'
        };
    }

    if (existing.lifecycle !== context.lifecycle) {
        return {
            success: false,
            context: existing,
            error: 'Context lifecycle must be changed through the lifecycle authority.'
        };
    }

    if (
        context.version !== existing.version && context.version !==
        existing.version + 1
    ) {
        return {
            success: false,
            context: existing,
            error: 'Context version must remain unchanged or advance by one.'
        };
    }

    if (!context.updatedAt) {
        return {
            success: false,
            context: existing,
            error: 'Context updatedAt is required.'
        };
    }

    const stored = {
        ...existing,
        value: context.value,
        version: context.version,
        updatedAt: context.updatedAt
    };

    contextsById.set(context.id, stored);

    return {
        success: true,
        context: stored
    };
}
function updateContextLifecycle(context) {
    if (!context || !context.id) {
        return {
            success: false,
            context: null,
            error: 'Context object with id is required.'
        };
    }

    const existing = contextsById.get(context.id);

    if (!existing) {
        return {
            success: false,
            context: null,
            error: 'Context not found.'
        };
    }

    if (existing.userId !== context.userId) {
        return {
            success: false,
            context: existing,
            error: 'Context ownership violation.'
        };
    }

    if (existing.interactionId !== context.interactionId) {
        return {
            success: false,
            context: existing,
            error: 'Context identity is immutable.'
        };
    }

    if (existing.schemaVersion !== context.schemaVersion) {
        return {
            success: false,
            context: existing,
            error: 'Context schemaVersion is immutable.'
        };
    }

    if (existing.createdAt !== context.createdAt) {
        return {
            success: false,
            context: existing,
            error: 'Context createdAt is immutable.'
        };
    }

    if (existing.version !== context.version) {
        return {
            success: false,
            context: existing,
            error: 'Context version cannot change during lifecycle transition.'
        };
    }

    if (!context.lifecycle) {
        return {
            success: false,
            context: existing,
            error: 'Context lifecycle is required.'
        };
    }

    if (!canTransition(existing.lifecycle, context.lifecycle)) {
        return {
            success: false,
            context: existing,
            error: 'Invalid context lifecycle transition.'
        };
    }

    if (!context.updatedAt) {
        return {
            success: false,
            context: existing,
            error: 'Context updatedAt is required.'
        };
    }

    const stored = {
        ...existing,
        lifecycle: context.lifecycle,
        updatedAt: context.updatedAt
    };

    contextsById.set(context.id, stored);

    return {
        success: true,
        context: stored
    };
}
function getContext(id) {
    if (!id || !contextsById.has(id)) {
        return {
            success: false,
            context: null,
            error: 'Context not found.'
        };
    }

    return {
        success: true,
        context: contextsById.get(id)
    };
}

function getContextsByUser(userId) {
    if (!userId) {
        return {
            success: false,
            contexts: [],
            error: 'Context userId is required.'
        };
    }

    const results = [];

    for (const context 
  of contextsById.values()) {
        if (context.userId === userId) {
            results.push({ ...context });
        }
    }

    return {
        success: true,
        contexts: results
    };
}

function deleteContext(id) {
    if (!id || !contextsById.has(id)) {
        return {
            success: false,
            context: null,
            error: 'Context not found.'
        };
    }

    const context = contextsById.get(id);
    const key = createContextKey(context);

    contextsById.delete(id);
    contextIdsByKey.delete(key);

    return {
        success: true,
        context
    };
}

function clearContexts() {
    contextsById.clear();
    contextIdsByKey.clear();

    return {
        success: true
    };
}

module.exports = {
    createContextKey,
    createContextId,
    saveContext,
    updateContext,
    updateContextLifecycle,
    getContext,
    getContextsByUser,
    deleteContext,
    clearContexts
};
