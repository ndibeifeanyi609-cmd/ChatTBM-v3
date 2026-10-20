'use strict';

const { getPool } = require('./Postgres');
const { isDeepStrictEqual } = require('node:util');
const {
    createConversationId,
    createConversationObject
} = require('../conversation/ConversationObject');
const {
    isValidConversationLifecycle,
    canTransitionConversationLifecycle
} = require('../conversation/ConversationLifecycle');

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function failure(code, error) {
    return { success: false, code, error };
}

function database() {
    const pool = getPool();
    if (!pool) throw new Error('PostgreSQL is not configured.');
    return pool;
}

function validate(conversation) {
    const result = createConversationObject(conversation);
    if (!result.success) return result;
    if (!isValidConversationLifecycle(result.conversation.lifecycle)) {
        return failure('INVALID_CONVERSATION_LIFECYCLE', 'Conversation lifecycle is invalid.');
    }
    const value = result.conversation;
    if (value.id !== createConversationId(value.userId, value.conversationKey)) {
        return failure('CONVERSATION_IDENTITY_CONFLICT', 'Conversation identity does not match canonical identity.');
    }
    return { success: true, conversation: value };
}

function mapRow(row) {
    return row ? row.payload : null;
}

async function saveConversation(conversation) {
    const checked = validate(conversation);
    if (!checked.success) return checked;
    const value = checked.conversation;
    const pool = database();
    const existing = await pool.query(
        'SELECT payload FROM chattbm_conversations WHERE id = $1 OR (user_id = $2 AND conversation_key = $3)',
        [value.id, value.userId, value.conversationKey]
    );
    if (existing.rows.length) {
        const saved = mapRow(existing.rows[0]);
        if (saved.id === value.id && isDeepStrictEqual(saved, value)) {
            return { success: true, conversation: clone(saved), idempotent: true };
        }
        return failure(
            saved.id === value.id ? 'CONVERSATION_ID_CONFLICT' : 'CONVERSATION_IDENTITY_CONFLICT',
            'Conversation identity already exists with different state.'
        );
    }
    try {
        await pool.query(
            'INSERT INTO chattbm_conversations (id, user_id, conversation_key, version, lifecycle, created_at, updated_at, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)',
            [value.id, value.userId, value.conversationKey, value.version, value.lifecycle, value.createdAt, value.updatedAt, JSON.stringify(value)]
        );
    } catch (error) {
        if (error.code === '23505') {
            return failure('CONVERSATION_IDENTITY_CONFLICT', 'Conversation identity already exists.');
        }
        throw error;
    }
    return { success: true, conversation: clone(value) };
}

async function updateConversation(conversation, expectedVersion) {
    const checked = validate(conversation);
    if (!checked.success) return checked;
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return failure('INVALID_CONVERSATION_VERSION', 'Conversation expectedVersion must be a positive integer.');
    }
    const value = checked.conversation;
    const pool = database();
    const result = await pool.query(
        'UPDATE chattbm_conversations SET version = version + 1, updated_at = $1, payload = jsonb_set(jsonb_set($2::jsonb, \'{version}\', to_jsonb(version + 1)), \'{updatedAt}\', to_jsonb($1::text)) WHERE id = $3 AND user_id = $4 AND conversation_key = $5 AND version = $6 AND lifecycle = $7 AND created_at = $8 RETURNING payload',
        [value.updatedAt, JSON.stringify(value), value.id, value.userId, value.conversationKey, expectedVersion, value.lifecycle, value.createdAt]
    );
    if (!result.rowCount) {
        const found = await pool.query('SELECT user_id, version FROM chattbm_conversations WHERE id = $1', [value.id]);
        if (!found.rowCount) return failure('CONVERSATION_NOT_FOUND', 'Conversation was not found.');
        if (found.rows[0].user_id !== value.userId) return failure('CONVERSATION_OWNERSHIP_CONFLICT', 'Conversation ownership does not match.');
        return failure('CONVERSATION_CONFLICT', 'Conversation version conflict or immutable fields changed.');
    }
    return { success: true, conversation: clone(result.rows[0].payload) };
}

async function updateConversationLifecycle(conversation, expectedVersion) {
    const checked = validate(conversation);
    if (!checked.success) return checked;
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        return failure('INVALID_CONVERSATION_VERSION', 'Conversation expectedVersion must be a positive integer.');
    }
    const value = checked.conversation;
    const pool = database();
    const current = await pool.query('SELECT payload FROM chattbm_conversations WHERE id = $1 AND user_id = $2', [value.id, value.userId]);
    if (!current.rowCount) return failure('CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    const previous = current.rows[0].payload;
    if (previous.version !== expectedVersion) return failure('CONVERSATION_CONFLICT', 'Conversation version conflict.');
    if (previous.conversationKey !== value.conversationKey || previous.createdAt !== value.createdAt || previous.schemaVersion !== value.schemaVersion) {
        return failure('CONVERSATION_IDENTITY_CONFLICT', 'Conversation identity fields are immutable.');
    }
    if (previous.lifecycle !== value.lifecycle && !canTransitionConversationLifecycle(previous.lifecycle, value.lifecycle)) {
        return failure('CONVERSATION_INVALID_LIFECYCLE_TRANSITION', 'Invalid Conversation lifecycle transition.');
    }
    const result = await pool.query(
        'UPDATE chattbm_conversations SET lifecycle = $1, updated_at = $2, payload = $3::jsonb WHERE id = $4 AND user_id = $5 AND version = $6 RETURNING payload',
        [value.lifecycle, value.updatedAt, JSON.stringify(value), value.id, value.userId, expectedVersion]
    );
    if (!result.rowCount) return failure('CONVERSATION_CONFLICT', 'Conversation version conflict.');
    return { success: true, conversation: clone(result.rows[0].payload) };
}

async function getConversation(id, userId) {
    if (typeof id !== 'string' || !id.trim()) return failure('INVALID_CONVERSATION_ID', 'Conversation id is required.');
    if (typeof userId !== 'string' || !userId.trim()) return failure('INVALID_USER_ID', 'Conversation userId is required.');
    const result = await database().query(
        'SELECT payload FROM chattbm_conversations WHERE id = $1',
        [id]
    );
    if (!result.rowCount) return failure('CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    if (result.rows[0].payload.userId !== userId.trim()) return failure('CONVERSATION_OWNERSHIP_CONFLICT', 'Conversation ownership does not match.');
    return { success: true, conversation: clone(result.rows[0].payload) };
}

async function getConversationsByUser(userId) {
    if (typeof userId !== 'string' || !userId.trim()) return failure('INVALID_USER_ID', 'Conversation userId is required.');
    const result = await database().query(
        'SELECT payload FROM chattbm_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId.trim()]
    );
    return { success: true, conversations: result.rows.map(row => clone(row.payload)) };
}

async function deleteConversation(id, userId) {
    if (typeof id !== 'string' || !id.trim()) return failure('INVALID_CONVERSATION_ID', 'Conversation id is required.');
    if (typeof userId !== 'string' || !userId.trim()) return failure('INVALID_USER_ID', 'Conversation userId is required.');
    const result = await database().query(
        'DELETE FROM chattbm_conversations WHERE id = $1 AND user_id = $2 RETURNING payload',
        [id, userId.trim()]
    );
    if (!result.rowCount) {
        const found = await database().query('SELECT user_id FROM chattbm_conversations WHERE id = $1', [id]);
        if (found.rowCount) return failure('CONVERSATION_OWNERSHIP_CONFLICT', 'Conversation ownership does not match.');
        return failure('CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    }
    return { success: true, deleted: true, conversation: clone(result.rows[0].payload) };
}

async function updateConversationContextIds(conversation, expectedVersion) {
    const checked = validate(conversation);
    if (!checked.success) return checked;
    if (!Array.isArray(checked.conversation.contextIds)) return failure('INVALID_CONTEXT_REFERENCE', 'Conversation contextIds must be an array.');
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) return failure('INVALID_CONVERSATION_VERSION', 'Conversation expectedVersion must be a positive integer.');
    const value = checked.conversation;
    const pool = database();
    const current = await pool.query('SELECT payload FROM chattbm_conversations WHERE id = $1 AND user_id = $2', [value.id, value.userId]);
    if (!current.rowCount) return failure('CONVERSATION_NOT_FOUND', 'Conversation was not found.');
    const previous = current.rows[0].payload;
    if (previous.version !== expectedVersion) return failure('CONVERSATION_CONFLICT', 'Conversation version conflict.');
    if (previous.conversationKey !== value.conversationKey || previous.createdAt !== value.createdAt || previous.schemaVersion !== value.schemaVersion) return failure('CONVERSATION_IDENTITY_CONFLICT', 'Conversation identity fields are immutable.');
    if (previous.lifecycle !== value.lifecycle) return failure('CONVERSATION_LIFECYCLE_CONFLICT', 'Conversation lifecycle must be changed through lifecycle authority.');
    const updated = { ...previous, contextIds: [...value.contextIds], version: previous.version + 1, updatedAt: value.updatedAt };
    const result = await pool.query('UPDATE chattbm_conversations SET version = $1, updated_at = $2, payload = $3::jsonb WHERE id = $4 AND user_id = $5 AND version = $6 RETURNING payload', [updated.version, updated.updatedAt, JSON.stringify(updated), value.id, value.userId, expectedVersion]);
    if (!result.rowCount) return failure('CONVERSATION_CONFLICT', 'Conversation version conflict.');
    return { success: true, conversation: clone(result.rows[0].payload) };
}

module.exports = {
    saveConversation,
    updateConversation,
    updateConversationLifecycle,
    updateConversationContextIds,
    getConversation,
    getConversationsByUser,
    deleteConversation
};
