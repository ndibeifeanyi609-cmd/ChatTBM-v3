'use strict';

// =====================================
// ChatTBM
// REG-095 Intelligence Orchestration
//
// Canonical Intelligence Orchestration Boundary
// =====================================
//
// Responsibility:
// - Validate canonical orchestration requests
// - Preserve userId and operationId
// - Own transient orchestration lifecycle
// - Coordinate approved canonical boundaries
// - Delegate assistant generation through Assistant Engine
// - Normalize controlled failures
//
// MUST NOT:
// - Own durable Intelligence persistence
// - Own an Intelligence registry
// - Access domain persistence directly
// - Access AI Engine/provider SDKs directly
// - Become a Project/Workspace/Tool/Action boundary
// - Author legacy intelligence services
// =====================================

const {
    createOrchestrationRequest
} = require('./IntelligenceOrchestrationRequest');

const {
    createIntelligenceOrchestrationObject,
    updateIntelligenceOrchestrationObject
} = require('./IntelligenceOrchestrationObject');

const {
    IntelligenceOrchestrationLifecycleStates,
    transitionIntelligenceOrchestration
} = require('./IntelligenceOrchestrationLifecycle');

function normalizeError(error, fallbackCode = 'INTELLIGENCE_ORCHESTRATION_ERROR') {
    return {
        code:
            error?.code ||
            fallbackCode,

        message:
            typeof error?.message === 'string' &&
            error.message.trim() !== ''
                ? error.message
                : 'Intelligence orchestration failed.'
    };
}

function validateDependencies(dependencies = {}) {
    if (
        !dependencies ||
        typeof dependencies !== 'object' ||
        Array.isArray(dependencies)
    ) {
        throw new Error(
            'Intelligence orchestration dependencies are required.'
        );
    }

    if (
        !dependencies.contextBoundary ||
        typeof dependencies.contextBoundary !== 'object'
    ) {
        throw new Error(
            'Context boundary dependency is required.'
        );
    }

    if (
        typeof dependencies.contextBoundary.getContextByInteraction !==
        'function'
    ) {
        throw new Error(
            'Context boundary must implement getContextByInteraction().'
        );
    }

    if (
        !dependencies.memoryBoundary ||
        typeof dependencies.memoryBoundary !== 'object'
    ) {
        throw new Error(
            'Memory boundary dependency is required.'
        );
    }

    if (
        typeof dependencies.memoryBoundary.getMemoriesByUser !==
        'function'
    ) {
        throw new Error(
            'Memory boundary must implement getMemoriesByUser().'
        );
    }

    if (
        !dependencies.profileBoundary ||
        typeof dependencies.profileBoundary !== 'object'
    ) {
        throw new Error(
            'Profile boundary dependency is required.'
        );
    }

    if (
        typeof dependencies.profileBoundary.getProfilesByUser !==
        'function'
    ) {
        throw new Error(
            'Profile boundary must implement getProfilesByUser().'
        );
    }

    if (
        !dependencies.assistantEngine ||
        typeof dependencies.assistantEngine.generateReply !==
        'function'
    ) {
        throw new Error(
            'Assistant Engine dependency is required.'
        );
    }

    return true;
}

function createTransientOrchestration(request) {
    return createIntelligenceOrchestrationObject({
        userId: request.userId,
        operationId: request.operationId,
        input: request.input,
        state:
            IntelligenceOrchestrationLifecycleStates.REQUESTED
    });
}

function transitionOrchestration(
    orchestration,
    nextState
) {
    const result =
        transitionIntelligenceOrchestration(
            orchestration,
            nextState
        );

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.orchestration;
}

function resolveCanonicalInformation(
    orchestration,
    dependencies
) {
    const input = orchestration.input;
    const availableInformation = {};

    if (input.interactionId) {
        const contextResult =
            dependencies.contextBoundary
                .getContextByInteraction(
                    orchestration.userId,
                    input.interactionId
                );

        if (
            !contextResult ||
            contextResult.success === false
        ) {
            throw new Error(
                contextResult?.error ||
                'Context is unavailable.'
            );
        }

        if (
            !contextResult.context ||
            contextResult.context.userId !== orchestration.userId
        ) {
            throw new Error(
                'Context ownership violation.'
            );
        }

        availableInformation.context = {
            id: contextResult.context.id
        };
    }

    const memoryResult =
        dependencies.memoryBoundary
            .getMemoriesByUser(
                orchestration.userId
            );

    if (
        !memoryResult ||
        memoryResult.success === false
    ) {
        throw new Error(
            memoryResult?.error ||
            'Memory is unavailable.'
        );
    }

        if (
            Array.isArray(memoryResult.memories) &&
            memoryResult.memories.some(
                memory => memory.userId !== orchestration.userId
            )
        ) {
            throw new Error(
                'Memory ownership violation.'
            );
        }

    availableInformation.memory = {
        count:
            Array.isArray(memoryResult.memories)
                ? memoryResult.memories.length
                : 0
    };

    const profileResult =
        dependencies.profileBoundary
            .getProfilesByUser(
                orchestration.userId
            );

    if (
        !profileResult ||
        profileResult.success === false
    ) {
        throw new Error(
            profileResult?.error ||
            'Profile is unavailable.'
        );
    }

        if (
            Array.isArray(profileResult.profiles) &&
            profileResult.profiles.some(
                profile => profile.userId !== orchestration.userId
            )
        ) {
            throw new Error(
                'Profile ownership violation.'
            );
        }

        availableInformation.profile = {
            count:
                Array.isArray(profileResult.profiles)
                    ? profileResult.profiles.length
                    : 0
        };

    return availableInformation;
}

function composeIntelligence(
    orchestration,
    availableInformation
) {
    return {
        operationId:
            orchestration.operationId,

        userId:
            orchestration.userId,

        requestedIntent:
            orchestration.input.intent ??
            null,

        availableInformation: {
            ...availableInformation
        },

        authorizedOperations:
            Array.isArray(
                orchestration.input.authorizedOperations
            )
                ? [
                    ...orchestration.input.authorizedOperations
                ]
                : [],

        sourceOwnership: {
            context: 'ContextBoundary',
            memory: 'MemoryBoundary',
            profile: 'ProfileBoundary'
        }
    };
}

async function delegateAssistant(
    orchestration,
    composedIntelligence,
    dependencies
) {
    if (
        orchestration.input.generateAssistantReply !== true
    ) {
        return {
            delegated: false,
            result: null
        };
    }

    const result =
        await dependencies.assistantEngine.generateReply({
            userId: orchestration.userId,
            message:
                orchestration.input.message || '',
            intelligence: composedIntelligence
        });

    if (
        !result ||
        result.success === false
    ) {
        throw new Error(
            result?.error?.message ||
            'Assistant execution failed.'
        );
    }

    return {
        delegated: true,
        result
    };
}

async function handleOrchestration(
    data = {},
    dependencies = {}
) {
    let request = null;
    let orchestration = null;

    try {
        request =
            createOrchestrationRequest(data);

        validateDependencies(dependencies);

        orchestration =
            createTransientOrchestration(
                request
            );

        orchestration =
            transitionOrchestration(
                orchestration,
                IntelligenceOrchestrationLifecycleStates.RESOLVING
            );

        const availableInformation =
            resolveCanonicalInformation(
                orchestration,
                dependencies
            );

        orchestration =
            updateIntelligenceOrchestrationObject(
                orchestration,

                 {
                    availableInformation
                }
            );

        const composedIntelligence =
            composeIntelligence(
                orchestration,
                availableInformation
            );

        orchestration =
            transitionOrchestration(
                updateIntelligenceOrchestrationObject(
                    orchestration,
                    {
                        composedIntelligence
                    }
                ),
                IntelligenceOrchestrationLifecycleStates.COMPOSED
            );

        const delegatedExecution =
            await delegateAssistant(
                orchestration,
                composedIntelligence,
                dependencies
            );

        orchestration =
            updateIntelligenceOrchestrationObject(
                orchestration,
                {
                    delegatedExecution
                }
            );

        orchestration =
            transitionOrchestration(
                orchestration,
                IntelligenceOrchestrationLifecycleStates.COMPLETED
            );

        return {
            success: true,
            userId: orchestration.userId,
            operationId: orchestration.operationId,
            state: orchestration.state,
            orchestration: {
                ...orchestration
            }
        };
    } catch (error) {
        const normalized =
            normalizeError(error);

        if (orchestration) {
            const failed =
                transitionIntelligenceOrchestration(
                    orchestration,
                    IntelligenceOrchestrationLifecycleStates.FAILED
                );

            orchestration =
                failed.success
                    ? failed.orchestration
                    : orchestration;
        }

        return {
            success: false,
            userId:
                request?.userId,
            operationId:
                request?.operationId,
            state:
                orchestration?.state ||
                null,
            error: normalized,
            orchestration:
                orchestration
                    ? { ...orchestration }
                    : null
        };
    }
}

module.exports = {
    normalizeError,
    validateDependencies,
    createTransientOrchestration,
    transitionOrchestration,
    resolveCanonicalInformation,
    composeIntelligence,
    delegateAssistant,
    handleOrchestration
};
