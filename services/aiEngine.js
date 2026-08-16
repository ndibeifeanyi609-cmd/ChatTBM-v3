// =====================================
// ChatTBM V7.0
// AI Engine
//
// Provider Application Adapter
//
// Responsibilities:
// - Preserve existing AI Engine contract
// - Delegate AI execution to AIProviderBoundary
// - Keep provider-specific logic outside
//
// Provider Boundary:
// - AIProviderBoundary
//
// Current Provider:
// - GeminiProvider
//
// Future:
// - Grok
// - Other AI Providers
// =====================================

const {
    AIProviderBoundary
} = require("./AIProviderBoundary");

const {
    GeminiProvider
} = require("./GeminiProvider");

// =====================================
// INITIALIZE PROVIDER BOUNDARY
// =====================================

const providerBoundary =
    new AIProviderBoundary();

const geminiProvider =
    new GeminiProvider();

providerBoundary.registerProvider(
    geminiProvider.name,
    geminiProvider
);

providerBoundary.setProvider(
    geminiProvider.name
);

// =====================================
// GENERATE AI RESPONSE
// =====================================

async function generateAIResponse({

    systemPrompt,

    message,

    userId

}) {

    const result =
        await providerBoundary.generateResponse({

            systemPrompt,

            message,

            userId

        });

    if (!result.success) {

        const error =
            new Error(
                result.error?.message ||
                "AI provider failed."
            );

        error.code =
            result.error?.code ||
            "AI_PROVIDER_ERROR";

        throw error;

    }

    return result.response;

}

// =====================================
// EXPORTS
// =====================================

module.exports = {

    generateAIResponse

};
