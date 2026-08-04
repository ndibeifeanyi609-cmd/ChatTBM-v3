// =====================================
// ChatTBM V7.1
// AI Core Engine
//
// Purpose:
// - Understand user requests
// - Detect intent
// - Route requests
// - Prepare context
// - Return unified response
// =====================================


// =====================================
// AI CORE
// =====================================

const AICore = {

    version: "7.1",

    initialized: false,

    modules: {

        memory: false,

        intent: false,

        router: false,

        provider: false

    }

};


// =====================================
// INITIALIZE
// =====================================

function initializeAICore() {

    AICore.initialized = true;

    AICore.modules.memory = true;
    AICore.modules.intent = true;
    AICore.modules.router = true;
    AICore.modules.provider = true;

    console.log("🧠 AI Core Initialized");

}


// =====================================
// MAIN ENTRY
// =====================================

async function processMessage(message) {

    const intent = detectIntent(message);

    const route = routeIntent(intent);

    return {

        success: true,

        intent,

        route,

        originalMessage: message

    };

}


// =====================================
// INTENT DETECTION
// =====================================

function detectIntent(message) {

    const text = message.toLowerCase();

    if (
        text.includes("code") ||
        text.includes("javascript") ||
        text.includes("python") ||
        text.includes("html")
    ) {
        return "coding";
    }

    if (
        text.includes("caption") ||
        text.includes("script") ||
        text.includes("content")
    ) {
        return "creator";
    }

    if (
        text.includes("business") ||
        text.includes("marketing")
    ) {
        return "business";
    }

    if (
        text.includes("study") ||
        text.includes("learn") ||
        text.includes("exam")
    ) {
        return "education";
    }

    return "general";

}


// =====================================
// ROUTER
// =====================================

function routeIntent(intent) {

    switch (intent) {

        case "coding":
            return "Coding Assistant";

        case "creator":
            return "Creator Studio";

        case "business":
            return "Business Assistant";

        case "education":
            return "Learning Assistant";

        default:
            return "General AI";

    }

}


// =====================================
// STATUS
// =====================================

function getAICoreStatus() {

    return AICore;

}


// =====================================
// EXPORT
// =====================================

window.ChatTBMCore = {

    initializeAICore,

    processMessage,

    getAICoreStatus

};


// =====================================
// STARTUP
// =====================================

initializeAICore();

console.log("✅ ChatTBM AI Core Ready");
