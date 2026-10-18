'use strict';
const express = require('express');
const { getPool } = require('../database/Postgres');
const router = express.Router();
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES = 500;
const MAX_CONTENT_LENGTH = 100000;

function validateConversationId(value) {
    return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 200;
}
function validateMessages(value) {
    if (!Array.isArray(value) || value.length > MAX_MESSAGES) return { success: false, error: 'Conversation messages must be an array of at most 500 messages.' };
    const messages = [];
    for (const item of value) {
        if (!item || typeof item !== 'object' || Array.isArray(item) ||
            typeof item.id !== 'string' || !item.id.trim() || item.id.length > 200 ||
            !['user', 'assistant'].includes(item.role) ||
            typeof item.content !== 'string' || !item.content.trim() ||
            item.content.length > MAX_CONTENT_LENGTH) {
            return { success: false, error: 'A conversation message is invalid.' };
        }
        const timestamp = Number(item.timestamp);
        messages.push({ id: item.id, role: item.role, content: item.content, timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now() });
    }
    return { success: true, messages };
}
function getUserId(req, res) {
    const id = req.authUser && req.authUser.id;
    if (typeof id !== 'string' || !id.trim()) {
        res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_REQUIRED', message: 'Sign in to continue.' } });
        return null;
    }
    return id;
}
function mapRow(row) {
    return { interactionId: row.conversation_id, messages: row.messages, updatedAt: new Date(row.updated_at).getTime() };
}
function unavailable(res) {
    return res.status(503).json({ success: false, error: { code: 'CONVERSATION_HISTORY_UNAVAILABLE', message: 'Conversation history is temporarily unavailable.' } });
}
router.get('/', async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    try {
        const pool = getPool();
        if (!pool) return unavailable(res);
        const result = await pool.query('SELECT conversation_id, messages, updated_at FROM chattbm_chat_history WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2', [userId, MAX_CONVERSATIONS]);
        return res.json({ success: true, conversations: result.rows.map(mapRow) });
    } catch (_) { return unavailable(res); }
});
router.get('/:conversationId', async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = req.params.conversationId;
    if (!validateConversationId(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_CONVERSATION_ID', message: 'Conversation id is invalid.' } });
    try {
        const pool = getPool();
        if (!pool) return unavailable(res);
        const result = await pool.query('SELECT conversation_id, messages, updated_at FROM chattbm_chat_history WHERE user_id = $1 AND conversation_id = $2', [userId, id]);
        if (!result.rowCount) return res.status(404).json({ success: false, error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation was not found.' } });
        return res.json({ success: true, conversation: mapRow(result.rows[0]) });
    } catch (_) { return unavailable(res); }
});
router.put('/:conversationId', async (req, res) => {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = req.params.conversationId;
    if (!validateConversationId(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_CONVERSATION_ID', message: 'Conversation id is invalid.' } });
    const checked = validateMessages(req.body && req.body.messages);
    if (!checked.success) return res.status(400).json({ success: false, error: { code: 'INVALID_CONVERSATION_MESSAGES', message: checked.error } });
    try {
        const pool = getPool();
        if (!pool) return unavailable(res);
        const result = await pool.query('INSERT INTO chattbm_chat_history (user_id, conversation_id, messages, updated_at) VALUES ($1, $2, $3::jsonb, NOW()) ON CONFLICT (user_id, conversation_id) DO UPDATE SET messages = EXCLUDED.messages, updated_at = NOW() RETURNING conversation_id, messages, updated_at', [userId, id, JSON.stringify(checked.messages)]);
        return res.json({ success: true, conversation: mapRow(result.rows[0]) });
    } catch (_) { return unavailable(res); }
});
module.exports = { router, validateConversationId, validateMessages };
