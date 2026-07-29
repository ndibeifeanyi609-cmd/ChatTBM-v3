// =====================================
// ChatTBM V5.7
// Smart Response Engine
// Personalized AI Responses
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

    // =====================================
    // CHECK CONTEXT FIRST
    // =====================================

    const contextResult =
    handleContextRequest(

        message,

        history

    );

    if (contextResult.matched) {

        return contextResult.response;

    }

    const text =
    message.trim().toLowerCase();

    // =====================================
    // GREETING
    // =====================================

    if (

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ) {

        return `
Hello 👋

Welcome to ChatTBM.

I'm your AI Content Assistant.

I can help you with:

✍️ Captions
🎬 Video Scripts
💡 Content Ideas
📢 Marketing
📅 Content Planning

What would you like to create today?
`;

    }

    // =====================================
    // INTENT RESPONSE
    // =====================================

    switch (intent) {

        case "content_creation":

            response =
            "I can help you create content. Tell me your platform and topic.";

            break;

        case "script_generation":

            response =
            "I can create a video script. Tell me the topic, style and length.";

            break;

        case "marketing":

            response =
            "I can help create adverts, promotions and marketing strategies.";

            break;

        case "idea_generation":

            response =
            "I can generate creative ideas. Tell me what you want ideas for.";

            break;

        case "greeting":

            response =
            "Hello! I'm ChatTBM. What would you like to create today?";

            break;

        default:

            response =
            "I understand. Tell me more details and I'll help you.";

    }

    // =====================================
    // MEMORY PERSONALIZATION
    // =====================================

    if (memory.contentStyle) {

        response +=
        "\n\n🎨 Preferred Style: " +
        memory.contentStyle;

    }

    if (memory.platform) {

        response +=
        "\n📱 Preferred Platform: " +
        memory.platform;

    }

    if (memory.tone) {

        response +=
        "\n🎯 Preferred Tone: " +
        memory.tone;

    }

    // =====================================
    // PERSONAL AI CONTEXT
    // =====================================

    if (

        aiContext &&

        aiContext.personality

    ) {

        response +=
        "\n\n🤖 AI Mode: " +
        aiContext.personality;

    }

    if (

        aiContext &&

        aiContext.goal

    ) {

        response +=
        "\n🎯 Current Goal: " +
        aiContext.goal;

    }

    // =====================================
    // CONVERSATION MEMORY
    // =====================================

    if (

        facts &&

        facts.lastMessage

    ) {

        response +=
        "\n\n🧠 I remember our previous discussion.";

    }

    if (

        timeline &&

        timeline.length > 0

    ) {

        response +=
        "\n📚 Conversation history available.";

    }

    return response;

}

module.exports = {

    generateResponse

};
