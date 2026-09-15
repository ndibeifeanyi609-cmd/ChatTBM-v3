'use strict';

// =====================================
// ChatTBM
// REG-091 Chat Interaction Boundary
//
// Canonical Chat Interaction Boundary Tests
// =====================================

const assert = require('assert');

const {
    validateInteractionRequest,
    normalizeInteractionError,
    handleInteraction
} = require('./ChatInteractionBoundary');

const {
    createContext,
    getContextByInteraction
} = require('../context/ContextBoundary');

const {
    clearContexts
} = require('../context/ContextPersistence');

clearContexts();

async function runTests() {

    console.log('\n=== REG-091 CHAT INTERACTION BOUNDARY TEST ===\n');

    // =====================================
    // REQUEST VALIDATION
    // =====================================

    assert.throws(
        () => validateInteractionRequest(null),
        /Interaction request is required/
    );

    assert.throws(
        () => validateInteractionRequest({
            interactionId: 'interaction-091',
            message: 'hello'
        }),
        /userId is required/
    );

    assert.throws(
        () => validateInteractionRequest({
            userId: 'user-091',
            message: 'hello'
        }),
        /interactionId is required/
    );

    assert.throws(
        () => validateInteractionRequest({
            userId: 'user-091',
            interactionId: 'interaction-091'
        }),
        /Message is required/
    );

    console.log('✓ Interaction request validation');

    // =====================================
    // IDENTITY PRESERVATION
    // =====================================

    const request =
        validateInteractionRequest({
            userId: 'user-091',
            interactionId: 'interaction-091',
            message: 'hello'
        });

    assert.strictEqual(
        request.userId,
        'user-091'
    );

    assert.strictEqual(
        request.interactionId,
        'interaction-091'
    );

    assert.strictEqual(
        request.message,
        'hello'
    );

    console.log('✓ Interaction identity preservation');

    // =====================================
    // ERROR NORMALIZATION
    // =====================================

    const normalized =
        normalizeInteractionError(
            new Error('Simulated interaction failure')
        );

    assert.strictEqual(
        normalized.code,
        'CHAT_INTERACTION_ERROR'
    );

    assert.strictEqual(
        normalized.message,
        'Simulated interaction failure'
    );

    console.log('✓ Interaction failure normalization');

    // =====================================
    // CONTEXT GATE
    // =====================================

    const missingContext =
        await handleInteraction({
            userId: 'user-091',
            interactionId: 'missing-interaction-091',
            message: 'hello'
        });

    assert.strictEqual(
        missingContext.success,
        false
    );

    assert.strictEqual(
        missingContext.userId,
        'user-091'
    );

    assert.strictEqual(
        missingContext.interactionId,
        'missing-interaction-091'
    );

    assert.strictEqual(
        missingContext.error.code,
        'CONTEXT_UNAVAILABLE'
    );

    console.log('✓ Missing Context produces controlled failure');

    // =====================================
    // CANONICAL CONTEXT COORDINATION
    // =====================================

    const created =
        createContext({
            userId: 'user-091',
            interactionId: 'interaction-091',
            value: {
                message: 'hello'
            }
        });

    assert.strictEqual(
        created.success,
        true
    );

    const resolved =
        getContextByInteraction(
            'user-091',
            'interaction-091'
        );

    assert.strictEqual(
        resolved.success,
        true
    );

    assert.strictEqual(
        resolved.context.userId,
        'user-091'
    );


    assert.strictEqual(
        resolved.context.interactionId,
        'interaction-091'
    );

    console.log('✓ Context resolved through canonical Context capability');

    // =====================================
    // CONTEXT OWNERSHIP
    // =====================================

    const wrongOwner =
        getContextByInteraction(
            'other-user-091',
            'interaction-091'
        );

    assert.strictEqual(
        wrongOwner.success,
        false
    );

    console.log('✓ Context ownership remains protected');

    // =====================================
    // ASSISTANT DELEGATION /
    // CONTROLLED PROVIDER FAILURE
    // =====================================

    const result =
        await handleInteraction({
            userId: 'user-091',
            interactionId: 'interaction-091',
            message: 'Test provider availability'
        });

    assert.strictEqual(
        result.success,
        false
    );

    assert.strictEqual(
        result.userId,
        'user-091'
    );

    assert.strictEqual(
        result.interactionId,
        'interaction-091'
    );

    assert.ok(
        result.error
    );

    assert.strictEqual(
        result.error.code,
        'PROVIDER_UNAVAILABLE'
    );

    console.log(
        '✓ Assistant delegation preserves controlled provider failure'
    );

    // =====================================
    // FALSE-SUCCESS PREVENTION
    // =====================================

    assert.notStrictEqual(
        result.success,
        true
    );

    console.log('✓ Provider failure cannot become false interaction success');

    console.log(
        '\n=== REG-091 CHAT INTERACTION BOUNDARY VERIFIED ===\n'
    );
}

runTests().catch(error => {

    console.error(
        '\n=== REG-091 CHAT INTERACTION BOUNDARY FAILED ==='
    );

    console.error(error);

    process.exitCode = 1;
});
