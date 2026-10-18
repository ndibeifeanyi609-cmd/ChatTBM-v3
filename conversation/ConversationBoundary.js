'use strict';

const { createConversationObject } = require('./ConversationObject');
const {
    transitionConversationLifecycle,
    CONVERSATION_LIFECYCLE_STATES
} = require('./ConversationLifecycle');
const {
    saveConversation,
    updateConversation,
    updateConversationContextIds,
    getConversation,
    getConversationsByUser,
    updateConversationLifecycle: persistConversationLifecycle,
    deleteConversation
} = process.env.DATABASE_URL
    ? require('../database/PostgresConversationPersistence')
    : require('./ConversationPersistence');
const { getContext } = require('../context/ContextBoundary');

async function createConversation({ userId, conversationKey, metadata = {} } = {}) {
    try {
        const created = createConversationObject({
            userId,
            conversationKey,
            metadata,
            contextIds: [],
            lifecycle: CONVERSATION_LIFECYCLE_STATES.ACTIVE
        });
        if (!created.success) return created;
        const saved = await saveConversation(created.conversation);
        if (!saved.success) return saved;
        return { success: true, conversation: saved.conversation };
    } catch (error) {
        return { success: false, code: 'CONVERSATION_BOUNDARY_FAILURE', error: error.message };
    }
}

async function getConversationById(id, userId) {
    try {
        return await getConversation(id, userId);
    } catch (error) {
        return { success: false, code: 'CONVERSATION_BOUNDARY_FAILURE', error: error.message };
    }
}

async function updateConversationById(id, userId, { expectedVersion, metadata } = {}) {
    const resolved = await getConversation(id, userId);
    if (!resolved.success) return resolved;
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return { success: false, code: 'INVALID_CONVERSATION_VERSION', error: 'Conversation expectedVersion is required.' };
    }
    const changes = { ...resolved.conversation };
    if (metadata !== undefined) changes.metadata = metadata;
    changes.updatedAt = new Date().toISOString();
    return await updateConversation(changes, expectedVersion);
}

async function transitionConversationLifecycleById(id, userId, nextLifecycle) {
    const resolved = getConversation(id, userId);
    if (!resolved.success) return resolved;
    const transitioned = transitionConversationLifecycle(resolved.conversation, nextLifecycle);
    if (!transitioned.success) return transitioned;
    if (resolved.conversation.lifecycle === transitioned.conversation.lifecycle) {
        return { success: true, conversation: transitioned.conversation, idempotent: true };
    }
    return await persistConversationLifecycle(transitioned.conversation, resolved.conversation.version);
}

async function closeConversation(id, userId) {
    return await transitionConversationLifecycleById(id, userId, CONVERSATION_LIFECYCLE_STATES.CLOSED);
}

function validateContextReference(contextId, userId) {
    if (typeof contextId !== 'string' || contextId.trim() === '') {
        return { success: false, code: 'INVALID_CONTEXT_REFERENCE', error: 'Context id is required.' };
    }
    const resolved = getContext(contextId.trim(), userId);
    if (!resolved.success) {
        return {
            success: false,
            code: resolved.code || 'CONTEXT_REFERENCE_INVALID',
            error: resolved.error || 'Context reference is invalid.'
        };
    }
    return { success: true, contextId: resolved.context.id };
}

async function addContextReference(id, userId, contextId, expectedVersion) {
    const resolved = getConversation(id, userId);
    if (!resolved.success) return resolved;
    const context = validateContextReference(contextId, userId);
    if (!context.success) return context;
    if (resolved.conversation.contextIds.includes(context.contextId)) {
        return { success: true, conversation: resolved.conversation, idempotent: true };
    }
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return { success: false, code: 'INVALID_CONVERSATION_VERSION', error: 'Conversation expectedVersion is required.' };
    }
    const updated = {
        ...resolved.conversation,
        contextIds: [...resolved.conversation.contextIds, context.contextId],
        updatedAt: new Date().toISOString()
    };
    return await updateConversationContextIds(updated, expectedVersion);
}

async function removeContextReference(id, userId, contextId, expectedVersion) {
    const resolved = getConversation(id, userId);
    if (!resolved.success) return resolved;
    if (typeof contextId !== 'string' || contextId.trim() === '') {
        return { success: false, code: 'INVALID_CONTEXT_REFERENCE', error: 'Context id is required.' };
    }
    const normalizedContextId = contextId.trim();
    if (!resolved.conversation.contextIds.includes(normalizedContextId)) {
        return { success: false, code: 'CONTEXT_REFERENCE_NOT_FOUND', error: 'Context reference was not found in Conversation.' };
    }
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return { success: false, code: 'INVALID_CONVERSATION_VERSION', error: 'Conversation expectedVersion is required.' };
    }
    const updated = {
        ...resolved.conversation,
        contextIds: resolved.conversation.contextIds.filter(existingId => existingId !== normalizedContextId),
        updatedAt: new Date().toISOString()
    };
    return updateConversationContextIds(updated, expectedVersion);
}
async function listConversationsByUser(userId) {
    try {
        return await getConversationsByUser(userId);
    } catch (error) {
        return {
            success: false,
            code: 'CONVERSATION_BOUNDARY_FAILURE',
            error: error.message
        };
    }
}

async function deleteConversationById(id, userId) {
    try {
        return await deleteConversation(id, userId);
    } catch (error) {
        return {
            success: false,
            code: 'CONVERSATION_BOUNDARY_FAILURE',
            error: error.message
        };
    }
}

module.exports = {
    createConversation,
    getConversation: getConversationById,
    updateConversation: updateConversationById,
    transitionConversationLifecycle: transitionConversationLifecycleById,
    closeConversation,
    addContextReference,
    removeContextReference,
    listConversationsByUser,
    deleteConversation: deleteConversationById
};
