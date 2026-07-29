// =====================================
// ChatTBM V5.8
// Smart Response Engine
// AI Personality + Memory + Context
// =====================================

const {
    handleContextRequest
} = require("./contextEngine");

// =====================================
// MAIN RESPONSE GENERATOR
// =====================================

function generateResponse(

    intent,

    message,

    memory = {},

    history = [],

    facts = {},

    timeline = [],

    aiContext = {}

) {

    let response = "";

    const text =
    message.trim().toLowerCase();

    // =====================================
    // CONTEXT ENGINE
    // =====================================

    const contextResult =
    handleContextRequest(

        message,

        history

    );

    if (contextResult.matched) {

        return contextResult.response;

    }

    // =====================================
    // FRIENDLY GREETINGS
    // =====================================

    if (

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ) {

        return `Hello 👋

Welcome to ChatTBM.

I'm your AI Content Assistant.

I can help you with:

✍️ Social Media Captions
🎬 Video Scripts
💡 Viral Content Ideas
📢 Marketing Campaigns
📅 Content Planning
🏷️ Hashtags
📈 Content Growth

What would you like to create today?`;

    }

    // =====================================
    // THANK YOU
    // =====================================

    if (

        text.includes("thank")

    ) {

        return `You're welcome! 😊

I'm always here whenever you need help creating better content, growing your audience, or improving your ideas.

What would you like to work on next?`;

    }

    // =====================================
    // WHO ARE YOU
    // =====================================

    if (

        text.includes("who are you")

    ) {

        return `I'm ChatTBM, your AI Content Assistant.

I can help with content creation, marketing, captions, scripts, business ideas, planning, and much more while remembering your preferences to give more personalized responses.`;

    }

    // =====================================
    // EMPTY RESPONSE
    // =====================================

    if (text.length === 0) {

        return "Please type a message.";

    }

    // =====================================
    // RESPONSE STARTS BELOW
    // =====================================

    // =====================================
    // INTENT-BASED RESPONSE ENGINE
    // =====================================

    switch (intent) {

        case "content_creation":

            response =
`Great! I can help you create high-quality content.

Tell me:
• Your topic
• Your platform
• Your target audience
• Your goal

I'll create content tailored to your needs.`;

            break;

        case "script_generation":

            response =
`I'd be happy to help write your script.

Please tell me:
• Topic
• Video length
• Platform
• Style (Funny, Professional, Cinematic, etc.)

I'll generate a complete script for you.`;

            break;

        case "caption_generation":

            response =
`I can create engaging captions.

Tell me:
• What the post is about
• Your platform
• The tone you want

I'll write a caption designed to fit your content.`;

            break;

        case "marketing":

            response =
`I can help with marketing strategies, adverts, promotional content, and audience growth.

Tell me what you're promoting and your target audience.`;

            break;

        case "idea_generation":

            response =
`Let's brainstorm together.

Tell me your niche or topic, and I'll generate fresh content ideas, video concepts, and post suggestions.`;

            break;

        case "question":

            response =
`I'll do my best to answer your question clearly and accurately.

Please provide a little more detail if needed.`;

            break;

        case "greeting":

            response =
`Hello! 👋

It's great to see you again.

How can I help you today?`;

            break;

        default:

            response =
`I understand your request.

Could you give me a little more detail so I can provide the best possible answer?`;

    }

    // =====================================
    // PERSONAL MEMORY
    // =====================================

    if (memory.platform) {

        response +=
`\n\n📱 I remember you usually create content for ${memory.platform}.`;

    }

    if (memory.contentStyle) {

        response +=
`\n🎨 I'll keep the style ${memory.contentStyle}.`;

    }

    if (memory.tone) {

        response +=
`\n🎯 I'll use a ${memory.tone} tone where appropriate.`;

    }

    // =====================================
    // PREVIOUS CONVERSATION
    // =====================================

    if (

        facts &&
        facts.lastMessage

    ) {

        response +=
`\n\n🧠 I remember our previous discussion, so I'll continue building on it instead of starting from scratch.`;

    }

    if (

        history &&
        history.length > 3

    ) {

        response +=
`\n📚 I also have recent conversation history available to keep my responses consistent.`;

    }

    // =====================================
    // AI PERSONALIZATION
    // =====================================

    if (

        aiContext &&
        aiContext.enhancedPrompt

    ) {

        response +=
`\n\n🤖 I'll personalize this response using what I've learned about your preferences.`;

    }

    // =====================================
    // CONTINUE TO PART 3
    // =====================================

// =========================================
// ChatTBM V5.8
// Adaptive Response Engine
// Part 3
// Smart Personalization
// =========================================

class AdaptiveResponseEngine {

    constructor(identityEngine) {
        this.identityEngine = identityEngine;
    }

    // =====================================
    // BUILD USER CONTEXT
    // =====================================

    buildContext(userId) {

        const profile =
            this.identityEngine.getProfile(userId);

        return {

            platform:
                profile.favoritePlatform || "General",

            category:
                profile.favoriteCategory || "General",

            tone:
                profile.tone || "Friendly",

            writingStyle:
                profile.writingStyle || "Professional",

            language:
                profile.language || "English"

        };

    }

    // =====================================
    // PERSONALIZE PROMPT
    // =====================================

    personalize(userId, prompt) {

        const context =
            this.buildContext(userId);

        return {

            personality:
                context.writingStyle,

            goal:
                `Create ${context.category} content for ${context.platform}`,

            context,

            originalPrompt: prompt,

            enhancedPrompt: `
User Preferences

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
