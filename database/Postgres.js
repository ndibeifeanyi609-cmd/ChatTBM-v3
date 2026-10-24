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
            ssl: process.env.NODE_ENV === 'production' || process.env.CHATTBM_TEST_DATABASE_SSL === 'true'
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

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_users (
            id TEXT PRIMARY KEY,
            email_normalized TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            email_verified_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            disabled_at TIMESTAMPTZ
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_contexts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
            interaction_id TEXT NOT NULL,
            version INTEGER NOT NULL CHECK (version >= 1),
            schema_version TEXT NOT NULL,
            lifecycle TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
            CONSTRAINT chattbm_contexts_user_interaction_unique
                UNIQUE (user_id, interaction_id)
        )
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS chattbm_contexts_user_created_idx
        ON chattbm_contexts (user_id, created_at DESC)
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS chattbm_contexts_user_updated_idx
        ON chattbm_contexts (user_id, updated_at DESC)
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_chat_history (
            user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
            conversation_id TEXT NOT NULL,
            messages JSONB NOT NULL CHECK (jsonb_typeof(messages) = 'array'),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, conversation_id)
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_oauth_identities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
            provider TEXT NOT NULL,
            provider_subject TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (provider, provider_subject),
            UNIQUE (user_id, provider)
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_google_oauth_states (
            state_hash TEXT PRIMARY KEY,
            link_user_id TEXT REFERENCES chattbm_users(id) ON DELETE CASCADE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS chattbm_google_oauth_states_expires_at_idx
        ON chattbm_google_oauth_states (expires_at)
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS chattbm_auth_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES chattbm_users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL,
            revoked_at TIMESTAMPTZ,
            last_seen_at TIMESTAMPTZ
        )
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS chattbm_auth_sessions_user_id_idx
        ON chattbm_auth_sessions (user_id)
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS chattbm_auth_sessions_expires_at_idx
        ON chattbm_auth_sessions (expires_at)
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
    getPool,
    initializeDatabase,
    checkDatabase,
    getDatabaseStatus,
    closeDatabase
};
