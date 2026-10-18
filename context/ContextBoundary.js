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
} = process.env.DATABASE_URL
    ? require('./PostgresContextPersistence')
    : require('./ContextPersistence');

async function createContext({
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

        const saved = await saveContext(context);

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

async function getContext(id, userId) {
    const result = await persistGetContext(id, userId);

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

async function getContextByInteraction(userId, interactionId) {
    if (!userId) {
        return {
            success: false,
            context: null,
            error: "Context userId is required."
        };
    }

    if (!interactionId) {
        return {
            success: false,
            context: null,
            error: "Context interactionId is required."
        };
    }

    const id = createContextId(
        userId,
        interactionId
    );

    return await getContext(id, userId);
}


async function updateContext(
    id,
    userId,
    {
        expectedVersion,
        changes = {}
    } = {}
) {
    const resolved = await getContext(id, userId);

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

    const saved = await persistContext(nextContext);

    if (!saved.success) {
        return saved;
    }

    return {
        success: true,
        context: saved.context
    };
}

async function transitionContextLifecycle(
    id,
    userId,
    nextState
) {
    const resolved = await getContext(id, userId);

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

    const saved = await persistContextLifecycle(
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

async function closeContext(id, userId) {
    return await transitionContextLifecycle(
        id,
        userId,
        ContextLifecycleStates.CLOSED
    );
}

async function listContextsByUser(userId) {
    return await getContextsByUser(userId);
}

async function deleteContext(id, userId) {
    const resolved = await getContext(id, userId);

    if (!resolved.success) {
        return resolved;
    }

    return await persistDeleteContext(id, userId);
}

module.exports = {
    createContext,
    getContext,
    getContextByInteraction,
    updateContext,
    transitionContextLifecycle,
    closeContext,
    listContextsByUser,
    deleteContext
};
