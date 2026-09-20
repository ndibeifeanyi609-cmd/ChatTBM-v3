'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Verification and Failure Tests
// =====================================

const assert = require('assert');

const {
    validateOrchestrationRequest,
    createOrchestrationRequest
} = require('./IntelligenceOrchestrationRequest');

const {
    createIntelligenceOrchestrationObject,
    updateIntelligenceOrchestrationObject
} = require('./IntelligenceOrchestrationObject');

const {
    IntelligenceOrchestrationLifecycleStates,
    canTransition,
    transitionIntelligenceOrchestration
} = require('./IntelligenceOrchestrationLifecycle');

const {
    validateDependencies,
    createTransientOrchestration,
    composeIntelligence,
    handleOrchestration
} = require('./IntelligenceOrchestrationBoundary');

async function run() {
    // =================================
    // REQUEST VALIDATION
    // =================================

    assert.throws(
        () => validateOrchestrationRequest(null),
        /request must be an object/
    );

    assert.throws(
        () => validateOrchestrationRequest({
            operationId: 'op-1',
            input: {}
        }),
        /userId is required/
    );

    assert.throws(
        () => validateOrchestrationRequest({
            userId: 'user-1',
            input: {}
        }),
        /operationId is required/
    );

    assert.throws(
        () => validateOrchestrationRequest({
            userId: 'user-1',
            operationId: 'op-1'
        }),
        /input is required/
    );

    const request =
        createOrchestrationRequest({
            userId: 'user-1',
            operationId: 'op-1',
            input: {
                intent: 'test'
            }
        });

    assert.strictEqual(
        request.userId,
        'user-1'
    );

    assert.strictEqual(
        request.operationId,
        'op-1'
    );

    // =================================
    // IDENTITY / OWNERSHIP
    // =================================

    const orchestration =
        createIntelligenceOrchestrationObject({
            userId: 'user-1',
            operationId: 'op-1',
            input: {}
        });

    assert.strictEqual(
        orchestration.userId,
        'user-1'
    );

    assert.strictEqual(
        orchestration.operationId,
        'op-1'
    );

    const updated =
        updateIntelligenceOrchestrationObject(
            orchestration,
            {
                userId: 'attacker',
                operationId: 'other-op',
                state: 'resolving'
            }
        );

    assert.strictEqual(
        updated.userId,
        'user-1'
    );

    assert.strictEqual(
        updated.operationId,
        'op-1'
    );

    // =================================
    // LIFECYCLE
    // =================================

    assert.strictEqual(
        canTransition(
            IntelligenceOrchestrationLifecycleStates.REQUESTED,
            IntelligenceOrchestrationLifecycleStates.RESOLVING
        ),
        true
    );

    assert.strictEqual(
        canTransition(
            IntelligenceOrchestrationLifecycleStates.REQUESTED,
            IntelligenceOrchestrationLifecycleStates.COMPLETED
        ),
        false
    );

    assert.strictEqual(
        canTransition(
            IntelligenceOrchestrationLifecycleStates.COMPLETED,
            IntelligenceOrchestrationLifecycleStates.RESOLVING
        ),
        false
    );

    const resolving =
        transitionIntelligenceOrchestration(
            orchestration,
            IntelligenceOrchestrationLifecycleStates.RESOLVING
        );

    assert.strictEqual(
        resolving.success,
        true
    );

    const composed =
        transitionIntelligenceOrchestration(
            resolving.orchestration,
            IntelligenceOrchestrationLifecycleStates.COMPOSED
        );

    assert.strictEqual(
        composed.success,
        true
    );

    const completed =
        transitionIntelligenceOrchestration(
            composed.orchestration,
            IntelligenceOrchestrationLifecycleStates.COMPLETED
        );

    assert.strictEqual(
        completed.success,
        true
    );

    const invalidTerminalTransition =
        transitionIntelligenceOrchestration(
            completed.orchestration,
            IntelligenceOrchestrationLifecycleStates.RESOLVING
        );

    assert.strictEqual(
        invalidTerminalTransition.success,
        false
    );

    // =================================
    // TRANSIENT STATE
    // =================================

    assert.strictEqual(
        Object.prototype.hasOwnProperty.call(
            orchestration,
            'persistence'
        ),
        false
    );

    assert.strictEqual(
        Object.prototype.hasOwnProperty.call(
            orchestration,
            'registry'
        ),
        false
    );

    // =================================
    // DEPENDENCY BOUNDARY
    // =================================

    assert.throws(
        () => validateDependencies(),
        /Context boundary dependency is required/
    );

    const calls = {
        context: 0,
        memory: 0,
        profile: 0,
        assistant: 0
    };

    const dependencies = {
        contextBoundary: {
            getContextByInteraction(userId, interactionId) {
                calls.context += 1;

                return {
                    success: true,
                    context: {
                        id: 'context-1',
                        userId,
                        interactionId
                    }
                };
            }
        },

        memoryBoundary: {
            getMemoriesByUser(userId) {
                calls.memory += 1;

                return {
                    success: true,
                    memories: [
                        {
                            id: 'memory-1',
                            userId
                        }
                    ]
                };
            }
        },

        profileBoundary: {
            getProfilesByUser(userId) {
                calls.profile += 1;

                return {
                    success: true,
                    profiles: [
                        {
                            id: 'profile-1',
                            userId
                        }
                    ]
                };
            }
        },

        assistantEngine: {
            async generateReply(data) {
                calls.assistant += 1;

                assert.strictEqual(
                    data.userId,
                    'user-1'
                );

                return {
                    success: true,
                    response: 'test response'
                };
            }
        }
    };

    // =================================
    // CANONICAL COMPOSITION
    // =================================

    const transient =
        createTransientOrchestration(
            request
        );

    const composedResult =
        composeIntelligence(
            transient,
            {
                context: {
                    id: 'context-1'
                },
                memory: {
                    count: 1
                },
                profile: {
                    count: 1
                }
            }
        );

    assert.strictEqual(
        composedResult.userId,
        'user-1'
    );

    assert.strictEqual(
        composedResult.operationId,
        'op-1'
    );

    assert.strictEqual(
        composedResult.sourceOwnership.memory,
        'MemoryBoundary'
    );

    // =================================
    // SUCCESSFUL ORCHESTRATION
    // =================================

    const result =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-success',
                input: {
                    interactionId: 'interaction-1',
                    intent: 'test',
                    message: 'Hello',
                    generateAssistantReply: true
                }
            },
            dependencies
        );

    assert.strictEqual(
        result.success,
        true
    );

    assert.strictEqual(
        result.state,
        IntelligenceOrchestrationLifecycleStates.COMPLETED
    );

    assert.strictEqual(
        result.userId,
        'user-1'
    );

    assert.strictEqual(
        result.operationId,
        'op-success'
    );

    assert.strictEqual(
        calls.context,
        1
    );

    assert.strictEqual(
        calls.memory,
        1
    );

    assert.strictEqual(
        calls.profile,
        1
    );

    assert.strictEqual(
        calls.assistant,
        1
    );

    // =================================
    // CONTROLLED FAILURE
    // =================================

    const failed =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-failure',
                input: {
                    interactionId: 'interaction-1'
                }
            },
            {
                ...dependencies,
                memoryBoundary: {
                    getMemoriesByUser() {
                        return {
                            success: false,
                            error: 'Memory unavailable.'
                        };
                    }
                }
            }
        );

    assert.strictEqual(
        failed.success,
        false
    );

    assert.strictEqual(
        failed.state,
        IntelligenceOrchestrationLifecycleStates.FAILED
    );

    assert.strictEqual(
        failed.operationId,
        'op-failure'
    );

    // =================================
    // ASSISTANT FAILURE
    // =================================

    const assistantFailure =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-assistant-failure',
                input: {
                    generateAssistantReply: true,
                    message: 'Hello'
                }
            },
            {
                ...dependencies,
                assistantEngine: {
                    async generateReply() {
                        return {
                            success: false,
                            error: {
                                message:
                                    'Assistant unavailable.'
                            }
                        };
                    }
                }
            }
        );

    assert.strictEqual(
        assistantFailure.success,
        false
    );

    assert.strictEqual(
        assistantFailure.state,
        IntelligenceOrchestrationLifecycleStates.FAILED
    );

    // =================================
    // OWNERSHIP FAILURE
    // =================================

    const contextOwnershipFailure =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-context-ownership',
                input: {
                    interactionId: 'interaction-1'
                }
            },
            {
                ...dependencies,
                contextBoundary: {
                    getContextByInteraction() {
                        return {
                            success: true,
                            context: {
                                id: 'context-other',
                                userId: 'user-2'
                            }
                        };
                    }
                }
            }
        );

    assert.strictEqual(
        contextOwnershipFailure.success,
        false
    );

    assert.strictEqual(
        contextOwnershipFailure.state,
        IntelligenceOrchestrationLifecycleStates.FAILED
    );

    const memoryOwnershipFailure =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-memory-ownership',
                input: {}
            },
            {
                ...dependencies,
                memoryBoundary: {
                    getMemoriesByUser() {
                        return {
                            success: true,
                            memories: [
                                {
                                    id: 'memory-other',
                                    userId: 'user-2'
                                }
                            ]
                        };
                    }
                }
            }
        );

    assert.strictEqual(
        memoryOwnershipFailure.success,
        false
    );

    assert.strictEqual(
        memoryOwnershipFailure.state,
        IntelligenceOrchestrationLifecycleStates.FAILED
    );

    const profileOwnershipFailure =
        await handleOrchestration(
            {
                userId: 'user-1',
                operationId: 'op-profile-ownership',
                input: {}
            },
            {
                ...dependencies,
                profileBoundary: {
                    getProfilesByUser() {
                        return {
                            success: true,
                            profiles: [
                                {
                                    id: 'profile-other',
                                    userId: 'user-2'
                                }
                            ]
                        };
                    }
                }
            }
        );

    assert.strictEqual(
        profileOwnershipFailure.success,
        false
    );

    assert.strictEqual(
        profileOwnershipFailure.state,
        IntelligenceOrchestrationLifecycleStates.FAILED
    );


    // =================================
    // FALSE SUCCESS PREVENTION
    // =================================

    assert.notStrictEqual(
        failed.state,
        IntelligenceOrchestrationLifecycleStates.COMPLETED
    );

    assert.notStrictEqual(
        assistantFailure.state,
        IntelligenceOrchestrationLifecycleStates.COMPLETED
    );

    console.log(
        'Intelligence Orchestration tests passed.'
    );
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
