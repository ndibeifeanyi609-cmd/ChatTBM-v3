'use strict';

const fs = require('fs');
const path = require('path');
const { createConversationId, createConversationObject } = require('./ConversationObject');
const { isValidConversationLifecycle, canTransitionConversationLifecycle } = require('./ConversationLifecycle');

const STORAGE_VERSION = '1.0';

const DEFAULT_STORAGE_FILE =
    path.join(__dirname, '..', 'storage', 'conversations.json');

let storageFilePath =
    process.env.CHAT_TBM_CONVERSATION_STORAGE_PATH ||
    DEFAULT_STORAGE_FILE;

const conversationsById = new Map();
const conversationIdsByKey = new Map();
let persistenceLoaded = false;

function cloneConversation(conversation) {
    return JSON.parse(JSON.stringify(conversation));
}

function createConversationKey(conversation) {
    return JSON.stringify([
        conversation.userId,
        conversation.conversationKey
    ]);
}

function getConversationStoragePath() {
    return storageFilePath;
}

function configureConversationPersistence(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Conversation persistence file path must be a non-empty string.');
    }

    storageFilePath = path.resolve(filePath);
    conversationsById.clear();
    conversationIdsByKey.clear();
    persistenceLoaded = false;

    return storageFilePath;
}

function createStorageEnvelope(conversations) {
    return {
        version: STORAGE_VERSION,
        conversations: conversations.map(cloneConversation)
    };
}

function validateStorageEnvelope(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Conversation storage must contain a JSON object.');
    }

    if (data.version !== STORAGE_VERSION) {
        throw new Error('Unsupported conversation storage version: ' + data.version);
    }

    if (!Array.isArray(data.conversations)) {
        throw new Error('Conversation storage field "conversations" must be an array.');
    }

    return data;
}

function writeStorage() {
    const directory = path.dirname(storageFilePath);
    const tempFilePath = storageFilePath + '.tmp';

    try {
        fs.mkdirSync(directory, { recursive: true });

        const conversations = Array.from(conversationsById.values());
        const envelope = createStorageEnvelope(conversations);

        fs.writeFileSync(
            tempFilePath,
            JSON.stringify(envelope, null, 2),
            'utf8'
        );

        fs.renameSync(tempFilePath, storageFilePath);
    } catch (error) {
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (_) {
            // Preserve the original write failure.
        }

        throw new Error(
            'Conversation persistence write failed: ' + error.message
        );
    }
}

function validatePersistedConversation(conversation) {
    const result = createConversationObject(conversation);

    if (!result.success) {
        throw new Error(
            'Invalid persisted Conversation: ' + result.error
        );
    }

    if (!isValidConversationLifecycle(conversation.lifecycle)) {
        throw new Error('Invalid persisted Conversation lifecycle.');
    }

    if (result.conversation.id !== conversation.id) {
        throw new Error('Persisted Conversation identity mismatch.');
    }

    return result.conversation;
}

function loadConversationPersistence() {
    if (persistenceLoaded) {
        return {
            loaded: true,
            empty: conversationsById.size === 0,
            count: conversationsById.size,
            path: storageFilePath
        };
    }

    const nextById = new Map();
    const nextByKey = new Map();

    if (!fs.existsSync(storageFilePath)) {
        conversationsById.clear();
        conversationIdsByKey.clear();
        persistenceLoaded = true;

        return {
            loaded: true,
            empty: true,
            count: 0,
            path: storageFilePath
        };
    }

    let parsed;

    try {
        const raw = fs.readFileSync(storageFilePath, 'utf8');
        parsed = JSON.parse(raw);
    } catch (error) {
        throw new Error(
            'Conversation persistence load failed: ' + error.message
        );
    }

    validateStorageEnvelope(parsed);

    for (const conversation of parsed.conversations) {
        const validated = validatePersistedConversation(conversation);
        const id = validated.id;
        const key = createConversationKey(validated);

        if (nextById.has(id)) {
            throw new Error('Duplicate persisted Conversation id: ' + id);
        }

        if (nextByKey.has(key)) {
            throw new Error('Duplicate persisted Conversation identity.');
        }

        nextById.set(id, cloneConversation(validated));
        nextByKey.set(key, id);
    }

    conversationsById.clear();
    conversationIdsByKey.clear();

    for (const [id, conversation] of nextById) {
        conversationsById.set(id, conversation);
    }

    for (const [key, id] of nextByKey) {
        conversationIdsByKey.set(key, id);
    }

    persistenceLoaded = true;

    return {
        loaded: true,
        empty: conversationsById.size === 0,
        count: conversationsById.size,
        path: storageFilePath
    };
}

function ensureLoaded() {
    if (!persistenceLoaded) {
        loadConversationPersistence();
    }
}

function saveConversation(conversation) {
    ensureLoaded();

    const result = createConversationObject(conversation);

    if (!result.success) {
        return result;
    }

    const validated = result.conversation;

    if (!isValidConversationLifecycle(validated.lifecycle)) {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_LIFECYCLE',
            error: 'Conversation lifecycle is invalid.'
        };
    }

    const expectedId = createConversationId(
        validated.userId,
        validated.conversationKey
    );

    if (validated.id !== expectedId) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation identity does not match canonical identity.'
        };
    }

    const identityKey = createConversationKey(validated);
    const existingById = conversationsById.get(validated.id);
    const existingIdByKey = conversationIdsByKey.get(identityKey);

    if (existingById) {
        const sameRecord = JSON.stringify(existingById) === JSON.stringify(validated);

        if (sameRecord) {
            return {
                success: true,
                conversation: cloneConversation(existingById),
                idempotent: true
            };
        }

        return {
            success: false,
            code: 'CONVERSATION_ID_CONFLICT',
            error: 'Conversation id already exists with different state.'
        };
    }

    if (existingIdByKey) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation identity already exists.'
        };
    }
    const previousById = new Map(conversationsById);
    const previousByKey = new Map(conversationIdsByKey);

    conversationsById.set(validated.id, cloneConversation(validated));
    conversationIdsByKey.set(identityKey, validated.id);

    try {
        writeStorage();
    } catch (error) {
        conversationsById.clear();
        conversationIdsByKey.clear();

        for (const [id, value] of previousById) {
            conversationsById.set(id, value);
        }

        for (const [key, id] of previousByKey) {
            conversationIdsByKey.set(key, id);
        }

        return {
            success: false,
            code: 'CONVERSATION_PERSISTENCE_FAILURE',
            error: error.message
        };
    }

    return {
        success: true,
        conversation: cloneConversation(validated)
    };
}

function updateConversation(conversation, expectedVersion) {
    ensureLoaded();

    if (!conversation || typeof conversation !== 'object') {
        return {
            success: false,
            code: 'INVALID_CONVERSATION',
            error: 'Conversation is required.'
        };
    }

    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_VERSION',
            error: 'Conversation expectedVersion must be a positive integer.'
        };
    }

    const result = createConversationObject(conversation);

    if (!result.success) {
        return result;
    }

    const validated = result.conversation;
    const existing = conversationsById.get(validated.id);

    if (!existing) {
        return {
            success: false,
            code: 'CONVERSATION_NOT_FOUND',
            error: 'Conversation was not found.'
        };
    }

    if (existing.userId !== validated.userId) {
        return {
            success: false,
            code: 'CONVERSATION_OWNERSHIP_CONFLICT',
            error: 'Conversation ownership does not match.'
        };
    }

    if (existing.conversationKey !== validated.conversationKey) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation conversationKey is immutable.'
        };
    }

    if (existing.schemaVersion !== validated.schemaVersion) {
        return {
            success: false,
            code: 'CONVERSATION_SCHEMA_CONFLICT',
            error: 'Conversation schemaVersion is immutable.'
        };
    }

    if (existing.createdAt !== validated.createdAt) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation createdAt is immutable.'
        };
    }

    if (existing.lifecycle !== validated.lifecycle) {
        return {
            success: false,
            code: 'CONVERSATION_LIFECYCLE_CONFLICT',
            error: 'Conversation lifecycle must be changed through lifecycle authority.'
        };
    }

    if (existing.version !== expectedVersion) {
        return {
            success: false,
            code: 'CONVERSATION_CONFLICT',
            error: 'Conversation version conflict.'
        };
    }

    const nextVersion = existing.version + 1;

    const updated = {
        ...existing,
        metadata: { ...validated.metadata },
        contextIds: [...validated.contextIds],
        lifecycle: validated.lifecycle,
        version: nextVersion,
        updatedAt: validated.updatedAt
    };

    const previous = cloneConversation(existing);

    conversationsById.set(existing.id, cloneConversation(updated));

    try {
        writeStorage();
    } catch (error) {
        conversationsById.set(existing.id, previous);

        return {
            success: false,
            code: 'CONVERSATION_PERSISTENCE_FAILURE',
            error: error.message
        };
    }

    return {
        success: true,
        conversation: cloneConversation(updated)
    };
}

function updateConversationLifecycle(conversation, expectedVersion) {
    ensureLoaded();

    if (!conversation || typeof conversation !== 'object') {
        return {
            success: false,
            code: 'INVALID_CONVERSATION',
            error: 'Conversation is required.'
        };
    }

    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_VERSION',
            error: 'Conversation expectedVersion must be a positive integer.'
        };
    }

    const result = createConversationObject(conversation);
    if (!result.success) {
        return result;
    }

    const validated = result.conversation;
    const existing = conversationsById.get(validated.id);

    if (!existing) {
        return {
            success: false,
            code: 'CONVERSATION_NOT_FOUND',
            error: 'Conversation was not found.'
        };
    }

    if (existing.userId !== validated.userId) {
        return {
            success: false,
            code: 'CONVERSATION_OWNERSHIP_CONFLICT',
            error: 'Conversation ownership does not match.'
        };
    }

    if (existing.conversationKey !== validated.conversationKey) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation conversationKey is immutable.'
        };
    }

    if (existing.schemaVersion !== validated.schemaVersion) {
        return {
            success: false,
            code: 'CONVERSATION_SCHEMA_CONFLICT',
            error: 'Conversation schemaVersion is immutable.'
        };
    }

    if (existing.createdAt !== validated.createdAt) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation createdAt is immutable.'
        };
    }

    if (!canTransitionConversationLifecycle(existing.lifecycle, validated.lifecycle)) {
        return {
            success: false,
            code: 'CONVERSATION_INVALID_LIFECYCLE_TRANSITION',
            error: 'Invalid Conversation lifecycle transition.'
        };
    }

    if (existing.version !== expectedVersion) {
        return {
            success: false,
            code: 'CONVERSATION_CONFLICT',
            error: 'Conversation version conflict.'
        };
    }

    const nextVersion = existing.version;

    const updated = {
        ...existing,
        metadata: { ...validated.metadata },
        contextIds: [...validated.contextIds],
        lifecycle: validated.lifecycle,
        version: nextVersion,
        updatedAt: validated.updatedAt
    };

    const previous = cloneConversation(existing);

    conversationsById.set(existing.id, cloneConversation(updated));
    try {
        writeStorage();
    } catch (error) {
        conversationsById.set(existing.id, previous);

        return {
            success: false,
            code: 'CONVERSATION_PERSISTENCE_FAILURE',
            error: error.message
        };
    }

    return {
        success: true,
        conversation: cloneConversation(updated)
    };
}

function getConversation(id, userId) {
    ensureLoaded();

    if (typeof id !== 'string' || id.trim() === '') {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_ID',
            error: 'Conversation id is required.'
        };
    }

    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            success: false,
            code: 'INVALID_USER_ID',
            error: 'Conversation userId is required.'
        };
    }

    const conversation = conversationsById.get(id);

    if (!conversation) {
        return {
            success: false,
            code: 'CONVERSATION_NOT_FOUND',
            error: 'Conversation was not found.'
        };
    }

    if (conversation.userId !== userId.trim()) {
        return {
            success: false,
            code: 'CONVERSATION_OWNERSHIP_CONFLICT',
            error: 'Conversation ownership does not match.'
        };
    }

    return {
        success: true,
        conversation: cloneConversation(conversation)
    };
}

function getConversationsByUser(userId) {
    ensureLoaded();

    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            success: false,
            code: 'INVALID_USER_ID',
            error: 'Conversation userId is required.'
        };
    }

    const normalizedUserId = userId.trim();
    const conversations = Array.from(conversationsById.values())
        .filter(conversation => conversation.userId === normalizedUserId)
        .map(cloneConversation);

    return {
        success: true,
        conversations
    };
}

function deleteConversation(id, userId) {
    ensureLoaded();

    if (typeof id !== 'string' || id.trim() === '') {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_ID',
            error: 'Conversation id is required.'
        };
    }

    if (typeof userId !== 'string' || userId.trim() === '') {
        return {
            success: false,
            code: 'INVALID_USER_ID',
            error: 'Conversation userId is required.'
        };
    }

    const conversation = conversationsById.get(id);

    if (!conversation) {
        return {
            success: false,
            code: 'CONVERSATION_NOT_FOUND',
            error: 'Conversation was not found.'
        };
    }

    if (conversation.userId !== userId.trim()) {
        return {
            success: false,
            code: 'CONVERSATION_OWNERSHIP_CONFLICT',
            error: 'Conversation ownership does not match.'
        };
    }

    const identityKey = createConversationKey(conversation);
    const previous = cloneConversation(conversation);

    conversationsById.delete(id);
    conversationIdsByKey.delete(identityKey);
    try {
        writeStorage();
    } catch (error) {
        conversationsById.set(id, previous);
        conversationIdsByKey.set(identityKey, id);

        return {
            success: false,
            code: 'CONVERSATION_PERSISTENCE_FAILURE',
            error: error.message
        };
    }

    return {
        success: true,
        deleted: true,
        conversation: previous
    };
}

module.exports = {
    STORAGE_VERSION,
    getConversationStoragePath,
    configureConversationPersistence,
    loadConversationPersistence,
    saveConversation,
    updateConversation,
    updateConversationContextIds,
    getConversation,
    getConversationsByUser,
    updateConversationLifecycle,
    deleteConversation
};
function updateConversationContextIds(conversation, expectedVersion) {
    ensureLoaded();

    if (!conversation || typeof conversation !== 'object') {
        return {
            success: false,
            code: 'INVALID_CONVERSATION',
            error: 'Conversation is required.'
        };
    }

    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return {
            success: false,
            code: 'INVALID_CONVERSATION_VERSION',
            error: 'Conversation expectedVersion must be a positive integer.'
        };
    }

    if (!Array.isArray(conversation.contextIds)) {
        return {
            success: false,
            code: 'INVALID_CONTEXT_REFERENCE',
            error: 'Conversation contextIds must be an array.'
        };
    }

    const result = createConversationObject(conversation);
    if (!result.success) return result;

    const validated = result.conversation;
    const existing = conversationsById.get(validated.id);

    if (!existing) {
        return {
            success: false,
            code: 'CONVERSATION_NOT_FOUND',
            error: 'Conversation was not found.'
        };
    }

    if (existing.userId !== validated.userId) {
        return {
            success: false,
            code: 'CONVERSATION_OWNERSHIP_CONFLICT',
            error: 'Conversation ownership does not match.'
        };
    }

    if (existing.conversationKey !== validated.conversationKey) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation conversationKey is immutable.'
        };
    }

    if (existing.schemaVersion !== validated.schemaVersion || existing.createdAt !== validated.createdAt) {
        return {
            success: false,
            code: 'CONVERSATION_IDENTITY_CONFLICT',
            error: 'Conversation identity fields are immutable.'
        };
    }

    if (existing.lifecycle !== validated.lifecycle) {
        return {
            success: false,
            code: 'CONVERSATION_LIFECYCLE_CONFLICT',
            error: 'Conversation lifecycle must be changed through lifecycle authority.'
        };
    }

    if (existing.version !== expectedVersion) {
        return {
            success: false,
            code: 'CONVERSATION_CONFLICT',
            error: 'Conversation version conflict.'
        };
    }

    const updated = {
        ...existing,
        contextIds: [...validated.contextIds],
        version: existing.version + 1,
        updatedAt: validated.updatedAt
    };

    const previous = cloneConversation(existing);
    conversationsById.set(existing.id, cloneConversation(updated));

    try {
        writeStorage();
    } catch (error) {
        conversationsById.set(existing.id, previous);
        return {
            success: false,
            code: 'CONVERSATION_PERSISTENCE_FAILURE',
            error: error.message
        };
    }

    return {
        success: true,
        conversation: cloneConversation(updated)
    };
}

