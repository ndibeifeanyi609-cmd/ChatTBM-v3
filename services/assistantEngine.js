'use strict';

// =====================================
// ChatTBM V7.0
// Assistant Engine
//
// Canonical Assistant Orchestration Boundary
//
// Responsibilities:
// - Validate assistant requests
// - Normalize user identity
// - Preserve controlled request inputs
// - Build the AI request
// - Delegate AI execution to aiEngine
// - Normalize controlled failures
//
// Does NOT:
// - Access provider SDKs
// - Own AI provider state
// - Own Memory
// - Own Learning
// - Own Forecasts
// - Own Evaluations
// - Own persistence
// - Own registries
// - Implement target-consumer behavior
// =====================================

const {
    generateAIResponse
} = require("./aiEngine");

// =====================================
// REQUEST VALIDATION
// =====================================

function validateAssistantRequest(data) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        throw new Error(
            "Assistant request must be an object"
        );
    }

    if (
        data.message === undefined ||
        data.message === null ||
        data.message === ""
    ) {
        throw new Error(
            "Assistant message is required"
        );
    }

    if (
        data.context !== undefined &&
        (
            typeof data.context !== "object" ||
            data.context === null ||
            Array.isArray(data.context)
        )
    ) {
        throw new Error(
            "Invalid assistant context"
        );
    }

    if (
        data.memory !== undefined &&
        (
            typeof data.memory !== "object" ||
            data.memory === null ||
            Array.isArray(data.memory)
        )
    ) {
        throw new Error(
            "Invalid assistant memory"
        );
    }

    if (
        data.intelligence !== undefined &&
        (
            typeof data.intelligence !== "object" ||
            data.intelligence === null ||
            Array.isArray(data.intelligence)
        )
    ) {
        throw new Error(
            "Invalid assistant intelligence"
        );
    }

    return true;
}

// =====================================
// USER ID NORMALIZATION
// =====================================

function normalizeUserId(userId) {

    if (
        userId === undefined ||
        userId === null ||
        userId === ""
    ) {
        return "guest";
    }

    return String(userId);
}

// =====================================
// MESSAGE NORMALIZATION
// =====================================

function normalizeMessage(message) {

    return String(message).trim();
}

// =====================================
// AI REQUEST CONSTRUCTION
// =====================================

function buildAIRequest(data) {

    const userId =
        normalizeUserId(data.userId);

    const message =
        normalizeMessage(data.message);

    return {
        systemPrompt:
`You are ChatTBM.

You are an intelligent AI assistant.

Your goal is to help users with any legitimate task including:

• General questions
• Writing
• Programming
• Business
• Learning
• Research
• Content creation

Be accurate.

Be helpful.

Be friendly.

If you don't know something, say so instead of inventing information.`,

        message,

        userId
    };
}

// =====================================
// FAILURE NORMALIZATION
// =====================================

function normalizeAssistantError(error) {

    const normalized =
        error instanceof Error
            ? error
            : new Error(
                String(error || "Assistant execution failed.")
            );

    return {
        code:
            normalized.code ||
            "ASSISTANT_ERROR",

        message:
            normalized.message ||
            "Assistant execution failed."
    };
}

// =====================================
// GENERATE REPLY
// =====================================

async function generateReply(data = {}) {

    validateAssistantRequest(data);

    const aiRequest =
        buildAIRequest(data);

  

// =====================================
// AI EXECUTION
// =====================================

    try {

        const response =
            await generateAIResponse(aiRequest);

        return {
            success: true,
            userId: aiRequest.userId,
            response
        };

    }

    catch (error) {

        const normalized =
            normalizeAssistantError(error);

        console.error(
            "Assistant Engine Error:",
            normalized
        );

        return {
            success: false,
            userId: aiRequest.userId,
            error: normalized
        };

    }

}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    generateReply,
    validateAssistantRequest,
    normalizeUserId,
    normalizeMessage,
    buildAIRequest,
    normalizeAssistantError
};

