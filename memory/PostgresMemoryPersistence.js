'use strict';

const { getPool } = require('../database/Postgres');

function getDb() {
    const db = getPool();
    if (!db) throw new Error('PostgreSQL is not configured for Memory persistence.');
    return db;
}

async function initialize() {
    await getDb().query(`
        CREATE TABLE IF NOT EXISTS chattbm_memories (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            memory_type TEXT NOT NULL,
            subject TEXT NOT NULL,
            lifecycle TEXT NOT NULL,
            payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            UNIQUE (user_id, memory_type, subject)
        )
    `);
    await getDb().query(`
        CREATE INDEX IF NOT EXISTS chattbm_memories_user_lifecycle_idx
        ON chattbm_memories (user_id, lifecycle)
    `);
    return { success: true };
}

async function getAll() {
    const result = await getDb().query(
        'SELECT payload FROM chattbm_memories ORDER BY created_at ASC'
    );
    return result.rows.map(row => row.payload);
}

async function getById(id) {
    const result = await getDb().query(
        'SELECT payload FROM chattbm_memories WHERE id = $1',
        [id]
    );
    return result.rows[0]?.payload || null;
}

async function getByUser(userId) {
    const result = await getDb().query(
        'SELECT payload FROM chattbm_memories WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
    );
    return result.rows.map(row => row.payload);
}

async function save(memory) {
    const result = await getDb().query(
        `INSERT INTO chattbm_memories
            (id, user_id, memory_type, subject, lifecycle, payload, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
         ON CONFLICT (user_id, memory_type, subject) DO NOTHING
         RETURNING payload`,
        [
            memory.id, memory.userId, memory.type, memory.subject,
            memory.lifecycle, JSON.stringify(memory), memory.createdAt, memory.updatedAt
        ]
    );
    if (result.rows[0]) return { success: true, saved: true, memory: result.rows[0].payload };
    const existing = await getByUserAndIdentity(memory.userId, memory.type, memory.subject);
    if (existing && existing.id === memory.id) {
        return { success: true, saved: false, idempotent: true, memory: existing };
    }
    return { success: false, conflict: true, error: 'Memory identity already exists.', memory: existing };
}

async function getByUserAndIdentity(userId, type, subject) {
    const result = await getDb().query(
        'SELECT payload FROM chattbm_memories WHERE user_id = $1 AND memory_type = $2 AND subject = $3',
        [userId, type, subject]
    );
    return result.rows[0]?.payload || null;
}

async function update(memory) {
    const result = await getDb().query(
        `UPDATE chattbm_memories
         SET memory_type = $3, subject = $4, lifecycle = $5,
             payload = $6::jsonb, updated_at = $7
         WHERE id = $1 AND user_id = $2
         RETURNING payload`,
        [memory.id, memory.userId, memory.type, memory.subject, memory.lifecycle,
         JSON.stringify(memory), memory.updatedAt]
    );
    if (result.rows[0]) return { success: true, updated: true, memory: result.rows[0].payload };
    const existing = await getById(memory.id);
    if (!existing) return { success: false, notFound: true, error: 'Memory not found.' };
    return { success: false, ownershipFailure: true, error: 'Memory ownership mismatch.' };
}

async function remove(id, userId) {
    const result = await getDb().query(
        'DELETE FROM chattbm_memories WHERE id = $1 AND user_id = $2 RETURNING payload',
        [id, userId]
    );
    if (result.rows[0]) return { success: true, deleted: true, memory: result.rows[0].payload };
    const existing = await getById(id);
    if (!existing) return { success: false, notFound: true, error: 'Memory not found.' };
    return { success: false, ownershipFailure: true, error: 'Memory ownership mismatch.' };
}

module.exports = { initialize, getAll, getById, getByUser, save, update, remove };
