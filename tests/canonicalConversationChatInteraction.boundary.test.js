'use strict';

// REG-094: exercise the complete ChatInteractionBoundary orchestration without
// provider calls or persistent storage. Dependencies are isolated at require time.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

function loadBoundaryWithMocks(overrides) {
    const boundaryPath = path.resolve(__dirname, '../chatInteraction/ChatInteractionBoundary.js');
    const originalLoad = Module._load;
    const calls = [];
    const context = {
        id: 'context_test_1',
        userId: 'user_test_1',
        interactionId: 'interaction_test_1',
        version: 1
    };
    const conversation = {
        id: 'conversation_test_1',
        userId: 'user_test_1',
        conversationKey: 'interaction_test_1',
        contextIds: ['context_test_1'],
        version: 2
    };

    const mocks = {
        '../context/ContextBoundary': {
            createContext: async () => ({ success: true, context }),
            getContextByInteraction: async () => ({ success: true, context }),
            updateContext: async (...args) => {
                calls.push(['updateContext', ...args]);
                return { success: true, context };
            }
        },
        '../services/assistantEngine': {
            generateReply: async (...args) => {
                calls.push(['generateReply', ...args]);
                return { success: true, response: 'Test reply' };
            }
        },
        '../memory/MemoryBoundary': {
            createMemory: () => ({ success: true, memory: { userId: 'user_test_1' } }),
            createPersistentMemory: async () => ({ success: true, memory: { userId: 'user_test_1' } }),
            getMemoriesByUser: () => ({ success: true, memories: [] }),
            getPersistentMemoriesByUser: async () => ({ success: true, memories: [] })
        },
        '../conversation/ConversationBoundary': {
            resolveOrCreateConversation: async (...args) => {
                calls.push(['resolveOrCreateConversation', ...args]);
                if (overrides && overrides.conversationUnavailable) {
                    return { success: false, code: 'CONVERSATION_UNAVAILABLE', error: 'Unavailable' };
                }
                return { success: true, conversation };
            },
            addContextReference: async (...args) => {
                calls.push(['addContextReference', ...args]);
                return { success: true, conversation };
            }
        }
    };

    Module._load = function (request, parent, isMain) {
        if (parent && parent.filename === boundaryPath && Object.prototype.hasOwnProperty.call(mocks, request)) {
            return mocks[request];
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    try {
        delete require.cache[boundaryPath];
        const boundary = require(boundaryPath);
        return { boundary, calls, context, conversation };
    } finally {
        Module._load = originalLoad;
        delete require.cache[boundaryPath];
    }
}

test('handleInteraction links canonical Conversation before generating and persisting the turn', async () => {
    const { boundary, calls } = loadBoundaryWithMocks();
    const result = await boundary.handleInteraction({
        userId: 'user_test_1',
        interactionId: 'interaction_test_1',
        message: 'Hello'
    });

    assert.equal(result.success, true);
    assert.equal(result.response, 'Test reply');
    const names = calls.map(call => call[0]);
    assert.ok(names.indexOf('resolveOrCreateConversation') >= 0);
    assert.ok(names.indexOf('addContextReference') > names.indexOf('resolveOrCreateConversation'));
    assert.ok(names.indexOf('generateReply') > names.indexOf('addContextReference'));
    assert.ok(names.indexOf('updateContext') > names.indexOf('generateReply'));
    assert.equal(calls.find(call => call[0] === 'updateContext')[3].changes.value.response, 'Test reply');
});

test('handleInteraction stops safely when canonical Conversation is unavailable', async () => {
    const { boundary, calls } = loadBoundaryWithMocks({ conversationUnavailable: true });
    const result = await boundary.handleInteraction({
        userId: 'user_test_1',
        interactionId: 'interaction_test_1',
        message: 'Hello'
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, 'CONVERSATION_UNAVAILABLE');
    assert.equal(calls.some(call => call[0] === 'generateReply'), false);
    assert.equal(calls.some(call => call[0] === 'updateContext'), false);
});
