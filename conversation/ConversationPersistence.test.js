'use strict';

const assert = require('assert');

const {
    createConversationId,
    createConversationObject
} = require('./ConversationObject');

const {
    saveConversation,
    updateConversation,
    updateConversationContextIds,
    getConversation,
    getConversationsByUser,
    updateConversationLifecycle,
    deleteConversation
} = require('./ConversationPersistence');

const suffix = Date.now();
const userA = 'persistence-test-a-' + suffix;
const userB = 'persistence-test-b-' + suffix;

const created = createConversationObject({
    userId: userA,
    conversationKey: 'persistence-' + suffix,
    metadata: {
        label: 'original'
    }
});

assert.strictEqual(created.success, true);
assert.strictEqual(
    created.conversation.id,
    createConversationId(
        userA,
        'persistence-' + suffix
    )
);
assert.strictEqual(created.conversation.version, 1);

const saved = saveConversation(created.conversation);

assert.strictEqual(saved.success, true);
assert.strictEqual(saved.conversation.version, 1);

const replay = saveConversation(created.conversation);

assert.strictEqual(replay.success, true);
assert.strictEqual(replay.idempotent, true);

const conflictingIdentity = createConversationObject({
    userId: userA,
    conversationKey: 'persistence-' + suffix,
    metadata: {
        label: 'conflict'
    }
});

assert.strictEqual(conflictingIdentity.success, true);

const conflictSave = saveConversation(
    conflictingIdentity.conversation
);

assert.strictEqual(conflictSave.success, false);

const ownerRead = getConversation(
    created.conversation.id,
    userA
);

assert.strictEqual(ownerRead.success, true);

const wrongOwnerRead = getConversation(
    created.conversation.id,
    userB
);

assert.strictEqual(wrongOwnerRead.success, false);
assert.strictEqual(
    wrongOwnerRead.code,
    'CONVERSATION_OWNERSHIP_CONFLICT'
);

const updated = updateConversation(
    {
        ...created.conversation,
        metadata: {
            label: 'updated'
        },
        updatedAt: new Date().toISOString()
    },
    1
);

assert.strictEqual(updated.success, true);
assert.strictEqual(updated.conversation.version, 2);
assert.strictEqual(updated.conversation.metadata.label, 'updated');

const stale = updateConversation(
    {
        ...created.conversation,
        metadata: {
            label: 'stale'
        },
        updatedAt: new Date().toISOString()
    },
    1
);

assert.strictEqual(stale.success, false);
assert.strictEqual(stale.code, 'CONVERSATION_CONFLICT');

const contextId =
    'context_persistence_test_' + suffix;

const contextUpdated = updateConversationContextIds(
    {
        ...updated.conversation,
        contextIds: [contextId],
        updatedAt: new Date().toISOString()
    },
    2
);

assert.strictEqual(contextUpdated.success, true);
assert.strictEqual(contextUpdated.conversation.version, 3);
assert.deepStrictEqual(
    contextUpdated.conversation.contextIds,
    [contextId]
);

const lifecycleClosed = updateConversationLifecycle(
    {
        ...contextUpdated.conversation,
        lifecycle: 'closed',
        updatedAt: new Date().toISOString()
    },
    3
);

assert.strictEqual(lifecycleClosed.success, true);
assert.strictEqual(lifecycleClosed.conversation.lifecycle, 'closed');
assert.strictEqual(lifecycleClosed.conversation.version, 3);

const lifecycleRepeat = updateConversationLifecycle(
    {
        ...lifecycleClosed.conversation,
        lifecycle: 'closed',
        updatedAt: new Date().toISOString()
    },
    3
);

assert.strictEqual(lifecycleRepeat.success, true);
assert.strictEqual(lifecycleRepeat.conversation.version, 3);

const reopen = updateConversationLifecycle(
    {
        ...lifecycleClosed.conversation,
        lifecycle: 'active',
        updatedAt: new Date().toISOString()
    },
    3
);

assert.strictEqual(reopen.success, false);
assert.strictEqual(
    reopen.code,
    'CONVERSATION_INVALID_LIFECYCLE_TRANSITION'
);

const staleContextUpdate = updateConversationContextIds(
    {
        ...lifecycleClosed.conversation,
        contextIds: [],
        updatedAt: new Date().toISOString()
    },
    2
);

assert.strictEqual(staleContextUpdate.success, false);
assert.strictEqual(
    staleContextUpdate.code,
    'CONVERSATION_CONFLICT'
);

const listed = getConversationsByUser(userA);

assert.strictEqual(listed.success, true);
assert.strictEqual(
    listed.conversations.some(
        conversation => conversation.id === created.conversation.id
    ),
    true
);

const wrongOwnerDelete = deleteConversation(
    created.conversation.id,
    userB
);

assert.strictEqual(wrongOwnerDelete.success, false);
assert.strictEqual(
    wrongOwnerDelete.code,
    'CONVERSATION_OWNERSHIP_CONFLICT'
);

const deleted = deleteConversation(
    created.conversation.id,
    userA
);

assert.strictEqual(deleted.success, true);
assert.strictEqual(deleted.deleted, true);

const afterDelete = getConversation(
    created.conversation.id,
    userA
);

assert.strictEqual(afterDelete.success, false);
assert.strictEqual(
    afterDelete.code,
    'CONVERSATION_NOT_FOUND'
);

console.log('\n=== CONVERSATION PERSISTENCE TEST PASSED ===\n');
