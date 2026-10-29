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

const { createContext, getContextByInteraction, updateContext } = require('../context/ContextBoundary');
const { generateReply } = require('../services/assistantEngine');
const MemoryBoundary = require('../memory/MemoryBoundary');
const ConversationBoundary = require('../conversation/ConversationBoundary');

function validateInteractionRequest(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Interaction request is required.');
    }

    const {
        userId,
        interactionId,
        message,
        attachment
    } = data;

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

    let normalizedAttachment = null;

    if (attachment !== undefined && attachment !== null) {
        if (
            typeof attachment !== 'object' ||
            Array.isArray(attachment)
        ) {
            throw new Error('Invalid attachment.');
        }

        const validImage = attachment.type === 'image' &&
            typeof attachment.mimeType === 'string' &&
            attachment.mimeType.startsWith('image/') &&
            typeof attachment.data === 'string' &&
            Boolean(attachment.data.trim());
        const validPdf = attachment.type === 'document' &&
            attachment.mimeType === 'application/pdf' &&
            typeof attachment.data === 'string' &&
            Boolean(attachment.data.trim());
        const validText = attachment.type === 'text' &&
            attachment.mimeType === 'text/plain' &&
            typeof attachment.text === 'string' &&
            attachment.text.length <= 200000;

        if (!validImage && !validPdf && !validText) {
            throw new Error('Invalid attachment.');
        }

        normalizedAttachment = attachment.type === 'text'
            ? {
                type: 'text',
                name: typeof attachment.name === 'string' ? attachment.name : 'document.txt',
                mimeType: 'text/plain',
                text: attachment.text
            }
            : {
                type: attachment.type,
                name: typeof attachment.name === 'string' ? attachment.name : '',
                mimeType: attachment.mimeType,
                data: attachment.data
            };
    }

    return {
        userId,
        interactionId,
        message,
        attachment: normalizedAttachment
    };
}

async function ensureCanonicalConversation(userId, interactionId, contextId) {
    let resolved = await ConversationBoundary.resolveOrCreateConversation({
        userId,
        conversationKey: interactionId
    });
    if (!resolved || resolved.success !== true || !resolved.conversation) {
        return {
            success: false,
            code: resolved?.code || 'CONVERSATION_UNAVAILABLE',
            error: resolved?.error || 'Canonical Conversation is unavailable.'
        };
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const current = resolved.conversation;
        if (current.contextIds.includes(contextId)) {
            return { success: true, conversation: current, idempotent: true };
        }

        const linked = await ConversationBoundary.addContextReference(
            current.id,
            userId,
            contextId,
            current.version
        );
        if (linked && linked.success === true) return linked;

        if (linked?.code !== 'CONVERSATION_CONFLICT') {
            return {
                success: false,
                code: linked?.code || 'CONVERSATION_CONTEXT_LINK_FAILED',
                error: linked?.error || 'Context could not be linked to Conversation.'
            };
        }

        resolved = await ConversationBoundary.resolveOrCreateConversation({
            userId,
            conversationKey: interactionId
        });
        if (!resolved || resolved.success !== true || !resolved.conversation) {
            return {
                success: false,
                code: resolved?.code || 'CONVERSATION_UNAVAILABLE',
                error: resolved?.error || 'Canonical Conversation could not be reloaded.'
            };
        }
    }

    return {
        success: false,
        code: 'CONVERSATION_CONFLICT',
        error: 'Conversation changed concurrently; please retry.'
    };
}

function extractExplicitMemory(message) {
    if (typeof message !== 'string' || !/\\b(?:remember|save|store|keep)\\b/i.test(message)) return null;

    // Explicit first-person identity request, e.g. saving the user's role.
    const identityRequest = message.match(
        /\\b(?:remember|save|store|keep)\\s+(?:this|that)(?:\\s+as\\s+(?:a\\s+)?(?:personal\\s+)?memory)?\\s*:\\s*([^.!?\\n]{1,160})/i
    );
    if (identityRequest) {
        const claim = identityRequest[1].trim().replace(/\\s+/g, ' ');
        const identity = claim.match(/^(?:I am|I'm)\\s+(?:the\\s+)?(.+)$/i);
        if (identity && identity[1].trim()) {
            return { type: 'fact', subject: 'role', value: identity[1].trim() };
        }
    }

    const naturalLanguageMatch = message.match(
        /\\bmy\\s+([a-z][a-z0-9 _-]{1,50}?)\\s+is\\s+([^.!?\\n]{1,120})/i
    );
    const keyValueMatch = message.match(
        /\\b(?:remember|save|store|keep)\\s+(?:this\\s+)?([a-z][a-z0-9 _-]{0,50}?)\\s*:\\s*([^.!?\\n]{1,120})/i
    );
    const match = naturalLanguageMatch || keyValueMatch;
    if (!match) return null;
    const subject = match[1].trim().replace(/\\s+/g, ' ');
    const value = match[2].trim().replace(/\\s+/g, ' ');
    if (!subject || !value) return null;
    return { type: 'fact', subject, value };
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

        let contextResult = await getContextByInteraction(
            request.userId,
            request.interactionId
        );

        if (
            !contextResult ||
            contextResult.success === false ||
            !contextResult.context
        ) {
            const isMissingContext =
                contextResult?.error === 'Context not found.';

            if (isMissingContext) {
                contextResult = await createContext({
                    userId: request.userId,
                    interactionId: request.interactionId
                });
            }

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
        }

        const canonicalConversation = await ensureCanonicalConversation(
            request.userId,
            request.interactionId,
            contextResult.context.id
        );
        if (!canonicalConversation.success) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error: {
                    code: canonicalConversation.code,
                    message: canonicalConversation.error
                }
            };
        }

        const usePostgresMemory = Boolean(process.env.DATABASE_URL);
        const memoryIntent = extractExplicitMemory(request.message);
        if (memoryIntent) {
            const memoryData = {
                userId: request.userId,
                type: memoryIntent.type,
                subject: memoryIntent.subject,
                value: memoryIntent.value,
                lifecycle: 'active',
                provenance: { sourceType: 'explicit-user-request', sourceId: request.interactionId }
            };
            const saved = usePostgresMemory
                ? await MemoryBoundary.upsertPersistentMemory(memoryData)
                : await MemoryBoundary.createMemory(memoryData);
            if (!saved || saved.success !== true || !saved.memory) {
                return {
                    success: false,
                    userId: request.userId,
                    interactionId: request.interactionId,
                    error: {
                        code: 'MEMORY_SAVE_FAILED',
                        message: 'I could not safely save that memory. Please try again.'
                    }
                };
            }
        }

        const memoryResult = usePostgresMemory
            ? await MemoryBoundary.getPersistentMemoriesByUser(request.userId)
            : MemoryBoundary.getMemoriesByUser(request.userId);
        if (!memoryResult || memoryResult.success !== true || !Array.isArray(memoryResult.memories)) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error: {
                    code: 'MEMORY_RETRIEVAL_FAILED',
                    message: 'Personal memory could not be checked safely, so this response was not generated.'
                }
            };
        }

        const personalMemories = memoryResult.memories.filter(memory =>
            memory && memory.userId === request.userId
        );

        const assistantResult = await generateReply({
            userId: request.userId,
            message: request.message,
            attachment: request.attachment,
            memory: { memories: personalMemories }
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

        const persistedTurn = await updateContext(
            contextResult.context.id,
            request.userId,
            {
                expectedVersion: contextResult.context.version,
                changes: {
                    value: {
                        message: request.message,
                        response: assistantResult.response,
                        attachment: request.attachment
                    }
                }
            }
        );

        if (!persistedTurn || persistedTurn.success !== true) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error: {
                    code: persistedTurn?.code || 'CONTEXT_PERSISTENCE_FAILED',
                    message: persistedTurn?.error || 'The completed turn could not be saved.'
                }
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


async function handleStreamingInteraction(data = {}, onDelta, signal) {
    let request;

    try {
        request = validateInteractionRequest(data);
        if (typeof onDelta !== 'function') {
            throw Object.assign(new Error('A streaming callback is required.'), { code: 'INVALID_STREAM_CALLBACK' });
        }

        let contextResult = await getContextByInteraction(request.userId, request.interactionId);
        if (!contextResult || contextResult.success === false || !contextResult.context) {
            if (contextResult?.error === 'Context not found.') {
                contextResult = await createContext({
                    userId: request.userId,
                    interactionId: request.interactionId
                });
            }
            if (!contextResult || contextResult.success === false || !contextResult.context) {
                return { success: false, userId: request.userId, interactionId: request.interactionId,
                    error: { code: 'CONTEXT_UNAVAILABLE', message: contextResult?.error || 'Context is unavailable.' } };
            }
        }


        const canonicalConversation = await ensureCanonicalConversation(
            request.userId,
            request.interactionId,
            contextResult.context.id
        );
        if (!canonicalConversation.success) {
            return {
                success: false,
                userId: request.userId,
                interactionId: request.interactionId,
                error: {
                    code: canonicalConversation.code,
                    message: canonicalConversation.error
                }
            };
        }

        const usePostgresMemory = Boolean(process.env.DATABASE_URL);
        const memoryIntent = extractExplicitMemory(request.message);
        if (memoryIntent) {
            const memoryData = {
                userId: request.userId,
                type: memoryIntent.type,
                subject: memoryIntent.subject,
                value: memoryIntent.value,
                lifecycle: 'active',
                provenance: { sourceType: 'explicit-user-request', sourceId: request.interactionId }
            };
            const saved = usePostgresMemory
                ? await MemoryBoundary.upsertPersistentMemory(memoryData)
                : MemoryBoundary.createMemory(memoryData);
            if (!saved || saved.success !== true || !saved.memory) {
                return { success: false, userId: request.userId, interactionId: request.interactionId,
                    error: { code: 'MEMORY_SAVE_FAILED', message: 'I could not safely save that memory. Please try again.' } };
            }
        }

        const memoryResult = usePostgresMemory
            ? await MemoryBoundary.getPersistentMemoriesByUser(request.userId)
            : MemoryBoundary.getMemoriesByUser(request.userId);
        if (!memoryResult || memoryResult.success !== true || !Array.isArray(memoryResult.memories)) {
            return { success: false, userId: request.userId, interactionId: request.interactionId,
                error: { code: 'MEMORY_RETRIEVAL_FAILED', message: 'Personal memory could not be checked safely, so this response was not generated.' } };
        }

        const personalMemories = memoryResult.memories.filter(memory =>
            memory && memory.userId === request.userId
        );
        const { generateStreamingReply } = require('../services/assistantEngine');
        const assistantResult = await generateStreamingReply({
            userId: request.userId,
            message: request.message,
            attachment: request.attachment,
            memory: { memories: personalMemories }
        }, onDelta, signal);

        if (!assistantResult || assistantResult.success === false) {
            return { success: false, userId: request.userId, interactionId: request.interactionId,
                error: normalizeAssistantInteractionError(assistantResult?.error) };
        }

        if (signal?.aborted) {
            return { success: false, userId: request.userId, interactionId: request.interactionId,
                error: { code: 'STREAM_CANCELLED', message: 'Streaming request was cancelled.' } };
        }

        const persistedTurn = await updateContext(
            contextResult.context.id,
            request.userId,
            {
                expectedVersion: contextResult.context.version,
                changes: { value: {
                    message: request.message,
                    response: assistantResult.response,
                    attachment: request.attachment
                } }
            }
        );

        if (!persistedTurn || persistedTurn.success !== true) {
            return { success: false, userId: request.userId, interactionId: request.interactionId,
                error: { code: persistedTurn?.code || 'CONTEXT_PERSISTENCE_FAILED',
                    message: persistedTurn?.error || 'The completed turn could not be saved.' } };
        }

        return { success: true, userId: request.userId, interactionId: request.interactionId,
            response: assistantResult.response };
    } catch (error) {
        return { success: false, userId: request?.userId, interactionId: request?.interactionId,
            error: normalizeInteractionError(error) };
    }
}


module.exports = {
    validateInteractionRequest,
    normalizeInteractionError,
    normalizeAssistantInteractionError,
    extractExplicitMemory,
    ensureCanonicalConversation,
    handleInteraction,
    handleStreamingInteraction
};
