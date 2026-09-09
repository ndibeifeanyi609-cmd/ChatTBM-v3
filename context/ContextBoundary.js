'use strict';

// =====================================
// ChatTBM
// REG-090 Context
//
// Canonical Context Boundary
// =====================================

const {
    createContextObject
} = require('./ContextObject');

const {
    ContextLifecycleStates,
    transitionContext
} = require('./ContextLifecycle');

const {
    createContextId,
    saveContext,
    updateContext: persistContext,
    updateContextLifecycle: persistContextLifecycle,
    getContext: persistGetContext,
    getContextsByUser,
    deleteContext: persistDeleteContext
} = require('./ContextPersistence');

function createContext({
    userId,
    interactionId,
    value = {}
} = {}) {
    try {
        const id = createContextId(
            userId,
            interactionId
        );

        const context = createContextObject({
            id,
            userId,
            interactionId,
            value,
            lifecycle:
                ContextLifecycleStates.ACTIVE
        });

        const saved = saveContext(context);

        if (!saved.success) {
            return saved;
        }

        return {
            success: true,
            context: saved.context
        };
    } catch (error) {
        return {
            success: false,
            context: null,
            error: error.message
        };
    }
}

function getContext(id, userId) {
    const result = persistGetContext(id);

    if (!result.success) {
        return result;
    }

    if (result.context.userId !== userId) {
        return {
            success: false,
            context: null,
            error: 'Context ownership violation.'
        };
    }

    return {
        success: true,
        context: result.context
    };
}

function updateContext(
    id,
    userId,
    {
        expectedVersion,
        changes = {}
    } = {}
) {
    const resolved = getContext(id, userId);

    if (!resolved.success) {
        return resolved;
    }

    if (!Number.isInteger(expectedVersion)) {
        return {
            success: false,
            context: resolved.context,
            error: 'Expected context version is required.'
        };
    }

    if (
        resolved.context.version !==
        expectedVersion
    ) {
        return {
            success: false,
            context: resolved.context,
            code: 'CONTEXT_CONFLICT',
            error: 'Context version conflict.'
        };
    }

    const nextContext = {
        ...resolved.context,
        value:
            Object.prototype.hasOwnProperty.call(
                changes,
                'value'
            )
                ? changes.value
                : resolved.context.value,
        id: resolved.context.id,
        version:
            resolved.context.version + 1,
        schemaVersion:
            resolved.context.schemaVersion,
        userId:
            resolved.context.userId,
        interactionId:
            resolved.context.interactionId,
        lifecycle:
            resolved.context.lifecycle,
        createdAt:
            resolved.context.createdAt,
        updatedAt:
            new Date().toISOString()
    };

    const saved = persistContext(nextContext);

    if (!saved.success) {
        return saved;
    }

    return {
        success: true,
        context: saved.context
    };
}

function transitionContextLifecycle(
    id,
    userId,
    nextState
) {
    const resolved = getContext(id, userId);

    if (!resolved.success) {
        return resolved;
    }

    const transitioned = transitionContext(
        resolved.context,
        nextState
    );

    if (!transitioned.success) {
        return transitioned;
    }

    if (transitioned.idempotent) {
        return {
            success: true,
            context: transitioned.context,
            idempotent: true
        };
    }

    const saved = persistContextLifecycle(
        transitioned.context
    );

    if (!saved.success) {
        return saved;
    }

    return {
        success: true,
        context: saved.context,
        previousState:
            transitioned.previousState,
        currentState:
            transitioned.currentState
    };
}

function closeContext(id, userId) {
    return transitionContextLifecycle(
        id,
        userId,
        ContextLifecycleStates.CLOSED
    );
}

function listContextsByUser(userId) {
    return getContextsByUser(userId);
}

function deleteContext(id, userId) {
    const resolved = getContext(id, userId);

    if (!resolved.success) {
        return resolved;
    }

    return persistDeleteContext(id);
}

module.exports = {
    createContext,
    getContext,
    updateContext,
    transitionContextLifecycle,
    closeContext,
    listContextsByUser,
    deleteContext
};
