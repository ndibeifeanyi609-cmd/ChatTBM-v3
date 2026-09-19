'use strict';

const crypto = require('crypto');

const CONVERSATION_OBJECT_VERSION = '1.0';
function fail(message, code = 'INVALID_CONVERSATION') {
    return {
        success: false,
        code,
        error: message
    };
}

function normalizeString(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        return fail(`Conversation ${field} is required.`);
    }

    return {
        success: true,
        value: value.trim()
    };
}

function createConversationId(userId, conversationKey) {
    const owner = normalizeString(userId, 'userId');

    if (!owner.success) {
        return null;
    }

    const key = normalizeString(conversationKey, 'conversationKey');

    if (!key.success) {
        return null;
    }

    const identity = JSON.stringify([
        owner.value,
        key.value
    ]);

    return `conversation_${crypto
        .createHash('sha256')
        .update(identity)
        .digest('hex')}`;
}

function createConversationObject({
    id,
    userId,
    conversationKey,
    metadata = {},
    contextIds = [],
    lifecycle = 'active',
    version = 1,
    createdAt = new Date().toISOString(),
    updatedAt = createdAt
} = {}) {
    const owner = normalizeString(userId, 'userId');

    if (!owner.success) {
        return owner;
    }

    const key = normalizeString(conversationKey, 'conversationKey');

    if (!key.success) {
        return key;
    }

    if (!Array.isArray(contextIds)) {
        return fail('Conversation contextIds must be an array.');
    }

    if (contextIds.some(contextId => typeof contextId !== 'string' || contextId.trim() === '')) {
        return fail('Conversation contextIds must contain only non-empty strings.');
    }

    const normalizedContextIds = contextIds.map(contextId => contextId.trim());

    if (new Set(normalizedContextIds).size !== normalizedContextIds.length) {
        return fail('Conversation contextIds must not contain duplicates.');
    }

    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return fail('Conversation metadata must be an object.');
    }

    if (!Number.isInteger(version) || version < 1) {
        return fail('Conversation version must be a positive integer.');
    }

    const normalizedId = id || createConversationId(owner.value, key.value);

    if (typeof normalizedId !== 'string' || normalizedId.trim() === '') {
        return fail('Conversation id is invalid.');
    }

    const expectedId = createConversationId(owner.value, key.value);

    if (normalizedId !== expectedId) {
        return fail(
            'Conversation identity does not match userId and conversationKey.',
            'CONVERSATION_IDENTITY_CONFLICT'
        );
    }

    if (typeof lifecycle !== 'string' || lifecycle.trim() === '') {
        return fail('Conversation lifecycle is required.');
    }

    if (typeof createdAt !== 'string' || createdAt.trim() === '') {
        return fail('Conversation createdAt is required.');
    }

    if (typeof updatedAt !== 'string' || updatedAt.trim() === '') {
        return fail('Conversation updatedAt is required.');
    }

    return {
        success: true,
        conversation: {
            id: normalizedId,
            version,
            schemaVersion: CONVERSATION_OBJECT_VERSION,
            userId: owner.value,
            conversationKey: key.value,
            metadata: { ...metadata },
            contextIds: [...normalizedContextIds],
            lifecycle,
            createdAt,
            updatedAt
        }
    };
}

module.exports = {
    CONVERSATION_OBJECT_VERSION,
    createConversationId,
    createConversationObject
};
