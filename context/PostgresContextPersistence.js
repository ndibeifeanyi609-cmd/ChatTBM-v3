'use strict';

const { getPool } = require('../database/Postgres');
const { createContextId, createContextKey } = require('./ContextPersistence');
const { createContextObject } = require('./ContextObject');
const { isValidLifecycleState, canTransition } = require('./ContextLifecycle');

function failure(code, error, context = null) {
    return { success: false, code, error, context };
}

function database() {
    const pool = getPool();
    if (!pool) throw new Error('PostgreSQL is not configured.');
    return pool;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function validate(context) {
    if (!context || typeof context !== 'object') {
        return failure('INVALID_CONTEXT', 'Context object is required.');
    }

    let result;
    try {
        result = createContextObject(context);
    } catch (error) {
        return failure('INVALID_CONTEXT', error.message);
    }

    const value = result;
    if (value.id !== createContextId(value.userId, value.interactionId)) {
        return failure('CONTEXT_IDENTITY_CONFLICT', 'Context id does not match canonical identity.');
    }
    if (!isValidLifecycleState(value.lifecycle)) {
        return failure('INVALID_CONTEXT_LIFECYCLE', 'Context lifecycle is invalid.');
    }
    return { success: true, context: value };
}

function mapRow(row) {
    return row ? row.payload : null;
}

async function saveContext(context) {
    const checked = validate(context);
    if (!checked.success) return checked;

    const value = checked.context;
    const pool = database();
    const existing = await pool.query(
        'SELECT payload FROM chattbm_contexts WHERE id = $1 OR (user_id = $2 AND interaction_id = $3)',
        [value.id, value.userId, value.interactionId]
    );

    if (existing.rowCount) {
        const stored = mapRow(existing.rows[0]);
        if (stored.id === value.id && JSON.stringify(stored) === JSON.stringify(value)) {
            return { success: true, context: clone(stored), idempotent: true };
        }
        return failure(
            stored.id === value.id ? 'CONTEXT_ID_CONFLICT' : 'CONTEXT_IDENTITY_CONFLICT',
            'Context identity already exists with different state.',
            clone(stored)
        );
    }

    try {
        await pool.query(
            'INSERT INTO chattbm_contexts (id, user_id, interaction_id, version, schema_version, lifecycle, created_at, updated_at, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)',
            [
                value.id, value.userId, value.interactionId, value.version,
                value.schemaVersion, value.lifecycle, value.createdAt,
                value.updatedAt, JSON.stringify(value)
            ]
        );
    } catch (error) {
        if (error.code === '23505') {
            return failure('CONTEXT_IDENTITY_CONFLICT', 'Context identity already exists.');
        }
        throw error;
    }

    return { success: true, context: clone(value), idempotent: false };
}

async function updateContext(context) {
    const checked = validate(context);
    if (!checked.success) return checked;

    const value = checked.context;
    const expectedVersion = value.version - 1;
    if (expectedVersion < 1) {
        return failure('INVALID_CONTEXT_VERSION', 'Updated Context version must advance by one.');
    }

    const result = await database().query(
        'UPDATE chattbm_contexts SET version = $1, updated_at = $2, payload = $3::jsonb WHERE id = $4 AND user_id = $5 AND interaction_id = $6 AND version = $7 AND lifecycle = $8 AND created_at = $9 AND schema_version = $10 RETURNING payload',
        [
            value.version, value.updatedAt, JSON.stringify(value), value.id,
            value.userId, value.interactionId, expectedVersion, value.lifecycle,
            value.createdAt, value.schemaVersion
        ]
    );

    if (result.rowCount) {
        return { success: true, context: clone(result.rows[0].payload) };
    }

    const found = await database().query(
        'SELECT payload FROM chattbm_contexts WHERE id = $1',
        [value.id]
    );
    if (!found.rowCount) return failure('CONTEXT_NOT_FOUND', 'Context not found.');
    const current = found.rows[0].payload;
    if (current.userId !== value.userId) {
        return failure('CONTEXT_OWNERSHIP_CONFLICT', 'Context ownership does not match.', clone(current));
    }
    return failure('CONTEXT_CONFLICT', 'Context version conflict or immutable fields changed.', clone(current));
}

async function updateContextLifecycle(context) {
    const checked = validate(context);
    if (!checked.success) return checked;

    const value = checked.context;
    const result = await database().query(
        'UPDATE chattbm_contexts SET lifecycle = $1, updated_at = $2, payload = $3::jsonb WHERE id = $4 AND user_id = $5 AND interaction_id = $6 AND version = $7 AND lifecycle <> $1 AND created_at = $8 AND schema_version = $9 RETURNING payload',
        [
            value.lifecycle, value.updatedAt, JSON.stringify(value), value.id,
            value.userId, value.interactionId, value.version, value.createdAt,
            value.schemaVersion
        ]
    );

    if (result.rowCount) return { success: true, context: clone(result.rows[0].payload) };

    const found = await database().query(
        'SELECT payload FROM chattbm_contexts WHERE id = $1',
        [value.id]
    );
    if (!found.rowCount) return failure('CONTEXT_NOT_FOUND', 'Context not found.');
    const current = found.rows[0].payload;
    if (current.userId !== value.userId) {
        return failure('CONTEXT_OWNERSHIP_CONFLICT', 'Context ownership does not match.', clone(current));
    }
    if (current.lifecycle === value.lifecycle && current.version === value.version) {
        return { success: true, context: clone(current), idempotent: true };
    }
    if (!canTransition(current.lifecycle, value.lifecycle)) {
        return failure('CONTEXT_INVALID_LIFECYCLE_TRANSITION', 'Invalid Context lifecycle transition.', clone(current));
    }
    return failure('CONTEXT_CONFLICT', 'Context changed during lifecycle transition.', clone(current));
}

async function getContext(id) {
    if (typeof id !== 'string' || !id.trim()) {
        return failure('INVALID_CONTEXT_ID', 'Context id is required.');
    }
    const result = await database().query(
        'SELECT payload FROM chattbm_contexts WHERE id = $1',
        [id]
    );
    if (!result.rowCount) return failure('CONTEXT_NOT_FOUND', 'Context not found.');
    return { success: true, context: clone(result.rows[0].payload) };
}

async function getContextsByUser(userId) {
    if (typeof userId !== 'string' || !userId.trim()) {
        return { success: false, contexts: [], code: 'INVALID_USER_ID', error: 'Context userId is required.' };
    }
    const result = await database().query(
        'SELECT payload FROM chattbm_contexts WHERE user_id = $1 ORDER BY created_at ASC, interaction_id ASC',
        [userId.trim()]
    );
    return { success: true, contexts: result.rows.map(row => clone(row.payload)) };
}

async function deleteContext(id, userId) {
    if (typeof id !== 'string' || !id.trim()) {
        return failure('INVALID_CONTEXT_ID', 'Context id is required.');
    }
    if (typeof userId !== 'string' || !userId.trim()) {
        return failure('INVALID_USER_ID', 'Context userId is required.');
    }

    const result = await database().query(
        'DELETE FROM chattbm_contexts WHERE id = $1 AND user_id = $2 RETURNING payload',
        [id, userId.trim()]
    );
    if (result.rowCount) return { success: true, context: clone(result.rows[0].payload) };

    const found = await database().query(
        'SELECT user_id FROM chattbm_contexts WHERE id = $1',
        [id]
    );
    if (found.rowCount) return failure('CONTEXT_OWNERSHIP_CONFLICT', 'Context ownership does not match.');
    return failure('CONTEXT_NOT_FOUND', 'Context not found.');
}

module.exports = {
    createContextKey,
    createContextId,
    saveContext,
    updateContext,
    updateContextLifecycle,
    getContext,
    getContextsByUser,
    deleteContext
};
