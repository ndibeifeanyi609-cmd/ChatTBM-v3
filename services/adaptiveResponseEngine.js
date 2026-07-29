// =========================================
// ChatTBM V5.7
// Adaptive Response Engine
// Part 4
// =========================================

class AdaptiveResponseEngine {

    constructor(identityEngine) {
        this.identityEngine = identityEngine;
    }

    buildContext(userId) {

        const profile = this.identityEngine.getProfile(userId);

        return {
            platform: profile.favoritePlatform,
            category: profile.favoriteCategory,
            tone: profile.tone,
            writingStyle: profile.writingStyle,
            language: profile.language
        };

    }

    personalize(userId, prompt) {

        const context = this.buildContext(userId);

        return {
            originalPrompt: prompt,

            enhancedPrompt:
`
User Preference

Platform: ${context.platform}

Category: ${context.category}

Tone: ${context.tone}

Writing Style: ${context.writingStyle}

Language: ${context.language}

User Request:
${prompt}
`
        };

    }

}

module.exports = AdaptiveResponseEngine;
