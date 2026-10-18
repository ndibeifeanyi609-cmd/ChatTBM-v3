'use strict';

const { Pool } = require('pg');

let pool = null;
let databaseStatus = 'not_configured';

function getPool() {
    if (!process.env.DATABASE_URL) {
        databaseStatus = 'not_configured';
        return null;
    }

    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : undefined,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
        });

        pool.on('error', () => {
            databaseStatus = 'error';
        });
    }

    return pool;
}

async function initializeDatabase() {
    const db = getPool();

    if (!db) {
        return { connected: false, status: databaseStatus };
    }

    await db.query('SELECT 1');

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            conversation_key TEXT NOT NULL,
            version INTEGER NOT NULL,
            lifecycle TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            payload JSONB NOT NULL,
            UNIQUE (user_id, conversation_key)
        )
    `);

    databaseStatus = 'connected';
    return { connected: true, status: databaseStatus };
}

async function checkDatabase() {
    const db = getPool();

    if (!db) {
        return { connected: false, status: 'not_configured' };
    }

    try {
        await db.query('SELECT 1');
        databaseStatus = 'connected';
        return { connected: true, status: databaseStatus };
    } catch (_) {
        databaseStatus = 'error';
        return { connected: false, status: databaseStatus };
    }
}

function getDatabaseStatus() {
    return databaseStatus;
}

async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

module.exports = {
    initializeDatabase,
    checkDatabase,
    getDatabaseStatus,
    closeDatabase
};
