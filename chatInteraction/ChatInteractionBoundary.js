'use strict';

// =====================================
// ChatTBM
// REG-091 Chat Interaction Boundary
// =====================================
//
// Canonical application-level coordination
// boundary for a normal ChatTBM interaction.
//
// Responsibilities:
// - validate canonical interaction identity
// - preserve userId and interactionId
// - coordinate approved Context capability
// - delegate assistant generation through Assistant Engine
// - normalize controlled interaction failures
//
// MUST NOT:
// - access Context persistence directly
// - access AI provider SDKs directly
// - own provider state
// - own Context state
// - create competing interaction persistence
// - become Intelligence Orchestration
// =====================================

const { getContextByInteraction } = require('../context/ContextBoundary');
const { generateReply } = require('../services/assistantEngine');

function validateInteractionRequest(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Interaction request is required.');
    }

    const { userId, interactionId, message } = data;

    if (
        typeof userId !== 'string' ||
        userId.trim() === ''
    ) {
        throw new Error('userId is required.');
    }

    if (
        typeof interactionId !== 'string' ||
        interactionId.trim() === ''
    ) {
        throw new Error('interactionId is required.');
    }

    if (
        typeof message !== 'string' ||
        message.trim() === ''
    ) {
        throw new Error('Message is required.');
    }

    return {
        userId,
        interactionId,
        message
    };
}

function normalizeAssistantInteractionError(error) {
    const normalized =
        error && typeof error === 'object'
            ? error
            : {};

    return {
        code:
            typeof normalized.code === 'string' &&
            normalized.code.trim() !== ''
                ? normalized.code
                : 'ASSISTANT_ERROR',

        message:
            typeof normalized.message === 'string' &&
            normalized.message.trim() !== ''
                ? normalized.message
                : 'Assistant execution failed.'
    };
}

function normalizeInteractionError(error) {
    return {
        code: error?.code || 'CHAT_INTERACTION_ERROR',
        message: error?.message || 'Chat interaction failed.'
    };
}

async function handleInteraction(data = {}) {
    let request;

    try {
        request = validateInteractionRequest(data);

        const contextResult = getContextByInteraction(
            request.userId,
            request.interactionId
        );

        if (
            !contextResult ||
            contextResult.success === false ||
            !contextResult.context
        ) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error: {
                    code: 'CONTEXT_UNAVAILABLE',
                    message:
                        contextResult?.error ||
                        'Context is unavailable.'
                }
            };
        }

        const assistantResult = await generateReply({
            userId: request.userId,
            message: request.message
        });

        if (
            !assistantResult ||
            assistantResult.success === false
        ) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error:
                    normalizeAssistantInteractionError(
                        assistantResult?.error
                    )
            };
        }

        return {
            success: true,
            userId: request.userId,
            interactionId: request.interactionId,
            response: assistantResult.response
        };
    } catch (error) {
        return {
            success: false,
            userId: request?.userId,
            interactionId: request?.interactionId,
            error: normalizeInteractionError(error)
        };
    }
}

module.exports = {
    validateInteractionRequest,
    normalizeInteractionError,
    normalizeAssistantInteractionError,
    handleInteraction
};
