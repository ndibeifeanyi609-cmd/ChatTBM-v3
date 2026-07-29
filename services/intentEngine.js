// =====================================
// ChatTBM V5.7
// Intent Engine
// Detects what the user wants
// =====================================

// =====================================
// DETECT USER INTENT
// =====================================

function detectIntent(message = "") {

    const text = message.toLowerCase().trim();

    // =====================================
    // CONTENT CREATION
    // =====================================

    if (
        text.includes("caption") ||
        text.includes("content") ||
        text.includes("post") ||
        text.includes("social media")
    ) {

        return "content_creation";

    }

    // =====================================
    // SCRIPT GENERATION
    // =====================================

    if (
        text.includes("script") ||
        text.includes("video") ||
        text.includes("youtube") ||
        text.includes("tiktok") ||
        text.includes("reel")
    ) {

        return "script_generation";

    }

    // =====================================
    // MARKETING
    // =====================================

    if (
        text.includes("marketing") ||
        text.includes("advert") ||
        text.includes("advertisement") ||
        text.includes("promotion") ||
        text.includes("business") ||
        text.includes("sell")
    ) {

        return "marketing";

    }

    // =====================================
    // IDEA GENERATION
    // =====================================

    if (
        text.includes("idea") ||
        text.includes("ideas") ||
        text.includes("brainstorm") ||
        text.includes("creative")
    ) {

        return "idea_generation";

    }

    // =====================================
    // GENERAL QUESTIONS
    // =====================================

    if (
        text.includes("what") ||
        text.includes("who") ||
        text.includes("where") ||
        text.includes("when") ||
        text.includes("why") ||
        text.includes("how")
    ) {

        return "general_question";

    }

    // =====================================
    // DEFAULT
    // =====================================

    return "general_question";

}

// =====================================
// EXPORT
// =====================================

module.exports = {

    detectIntent

};
