'use strict';

// =====================================
// ChatTBM
// REG-090 Context
//
// Canonical Context Boundary Tests
// =====================================

const assert = require('assert');

const {
    createContext,
    getContext,
    updateContext,
    closeContext,
    listContextsByUser,
    deleteContext
} = require('./ContextBoundary');

const {
    createContextId,
    clearContexts
} = require('./ContextPersistence');

clearContexts();

const created = createContext({
    userId: 'test-user',
    interactionId: 'interaction-1',
    value: {
        message: 'hello'
    }
});

assert.strictEqual(
    created.success,
    true
);

assert.ok(
    created.context
);

assert.strictEqual(
    created.context.userId,
    'test-user'
);

assert.strictEqual(
    created.context.interactionId,
    'interaction-1'
);

assert.strictEqual(
    created.context.lifecycle,
    'active'
);

assert.strictEqual(
    created.context.version,
    1
);

assert.strictEqual(
    created.context.id,
    createContextId(
        'test-user',
        'interaction-1'
    )
);

const id = created.context.id;

const duplicate = createContext({
    userId: 'test-user',
    interactionId: 'interaction-1',
    value: {
        message: 'different'
    }
});

assert.strictEqual(
    duplicate.success,
    false
);

const ownerRead = getContext(
    id,
    'test-user'
);

assert.strictEqual(
    ownerRead.success,
    true
);

const wrongOwnerRead = getContext(
    id,
    'other-user'
);

assert.strictEqual(
    wrongOwnerRead.success,
    false
);

const missingExpectedVersion = updateContext(
    id,
    'test-user',
    {
        changes: {
            value: {
                message: 'invalid'
            }
        }
    }
);

assert.strictEqual(
    missingExpectedVersion.success,
    false
);

const updated = updateContext(
    id,
    'test-user',
    {
        expectedVersion: 1,
        changes: {
            value: {
                message: 'updated'
            }
        }
    }
);

assert.strictEqual(
    updated.success,
    true
);

assert.strictEqual(
    updated.context.version,
    2
);

assert.strictEqual(
    updated.context.interactionId,
    'interaction-1'
);

const stale = updateContext(
    id,
    'test-user',
    {
        expectedVersion: 1,
        changes: {
            value: {
                message: 'stale'
            }
        }
    }
);

assert.strictEqual(
    stale.success,
    false
);

assert.strictEqual(
    stale.code,
    'CONTEXT_CONFLICT'
);

assert.strictEqual(
    stale.context.value.message,
    'updated'
);

const closed = closeContext(
    id,
    'test-user'
);

assert.strictEqual(
    closed.success,
    true
);

assert.strictEqual(
    closed.context.lifecycle,
    'closed'
);

const closedAgain = closeContext(
    id,
    'test-user'
);

assert.strictEqual(
    closedAgain.success,
    true
);

assert.strictEqual(
    closedAgain.idempotent,
    true
);

const list = listContextsByUser(
    'test-user'
);

assert.strictEqual(
    list.success,
    true
);

assert.strictEqual(
    list.contexts.length,
    1
);

const wrongOwnerDelete = deleteContext(
    id,
    'other-user'
);

assert.strictEqual(
    wrongOwnerDelete.success,
    false
);

const deleted = deleteContext(
    id,
    'test-user'
);

assert.strictEqual(
    deleted.success,
    true
);

const afterDelete = getContext(
    id,
    'test-user'
);

assert.strictEqual(
    afterDelete.success,
    false
);

clearContexts();

console.log(
    'REG-090 Context Boundary tests passed.'
);
