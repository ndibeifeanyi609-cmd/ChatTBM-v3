'use strict';

// PostgreSQL integration test for REG-097 Context persistence.
// Run with DATABASE_URL set to a disposable test database.
// This test intentionally skips rather than touching an unconfigured database.

const assert = require('assert');
const crypto = require('crypto');

if (!process.env.DATABASE_URL) {
    console.log('SKIP: PostgreSQL Context persistence integration test (DATABASE_URL is unset).');
    process.exit(0);
}

const { initializeDatabase, getPool, closeDatabase } = require('../database/Postgres');
const { createContextObject } = require('./ContextObject');
const persistence = require('./PostgresContextPersistence');

async function run() {
    const userId = 'context-test-' + crypto.randomUUID();
    const interactionId = 'interaction-' + crypto.randomUUID();
    const id = persistence.createContextId(userId, interactionId);
    const pool = getPool();

    try {
        const initialized = await initializeDatabase();
        assert.strictEqual(initialized.connected, true);

        await pool.query(
            'INSERT INTO chattbm_users (id, email_normalized, password_hash) VALUES ($1, $2, $3)',
            [userId, userId + '@example.invalid', 'test-only-not-a-real-password-hash']
        );

        const context = createContextObject({
            id,
            userId,
            interactionId,
            value: { message: 'hello', response: 'world' }
        });

        const saved = await persistence.saveContext(context);
        assert.strictEqual(saved.success, true);
        assert.strictEqual(saved.idempotent, false);

        const repeated = await persistence.saveContext(context);
        assert.strictEqual(repeated.success, true);
        assert.strictEqual(repeated.idempotent, true);

        const conflicting = await persistence.saveContext({
            ...context,
            value: { message: 'different payload' }
        });
        assert.strictEqual(conflicting.success, false);
        assert.strictEqual(conflicting.code, 'CONTEXT_ID_CONFLICT');

        const read = await persistence.getContext(id);
        assert.strictEqual(read.success, true);
        assert.deepStrictEqual(read.context.value, context.value);

        const updatedContext = {
            ...context,
            value: { message: 'hello', response: 'updated' },
            version: 2,
            updatedAt: new Date().toISOString()
        };
        const updated = await persistence.updateContext(updatedContext);
        assert.strictEqual(updated.success, true);
        assert.strictEqual(updated.context.version, 2);

        const stale = await persistence.updateContext({
            ...updatedContext,
            value: { message: 'stale' },
            updatedAt: new Date().toISOString()
        });
        assert.strictEqual(stale.success, false);
        assert.strictEqual(stale.code, 'CONTEXT_CONFLICT');

        const listed = await persistence.getContextsByUser(userId);
        assert.strictEqual(listed.success, true);
        assert.strictEqual(listed.contexts.length, 1);

        const deleted = await persistence.deleteContext(id, userId);
        assert.strictEqual(deleted.success, true);

        const missing = await persistence.getContext(id);
        assert.strictEqual(missing.success, false);
        assert.strictEqual(missing.code, 'CONTEXT_NOT_FOUND');

        console.log('REG-097 PostgreSQL Context persistence integration tests passed.');
    } finally {
        await pool.query('DELETE FROM chattbm_users WHERE id = $1', [userId]).catch(() => {});
        await closeDatabase();
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
