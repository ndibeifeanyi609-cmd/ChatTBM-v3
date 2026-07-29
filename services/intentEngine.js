// =====================================
// ChatTBM V5.7
// Intent Engine
// Detects the user's intent
// =====================================

// =====================================
// DETECT USER INTENT
// =====================================

function detectIntent(message = "") {

    const text = message
        .trim()
        .toLowerCase();

    // =====================================
    // CONTENT CREATION
    // =====================================

    if (

        text.includes("caption") ||
        text.includes("post") ||
        text.includes("content") ||
        text.includes("write content")

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
        text.includes("reel") ||
        text.includes("short") ||
        text.includes("storyboard")

    ) {

        return "script_generation";

    }

    // =====================================
    // MARKETING
    // =====================================

    if (

        text.includes("advert") ||
        text.includes("advertisement") ||
        text.includes("marketing") ||
        text.includes("business") ||
        text.includes("promotion") ||
        text.includes("brand")

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
        text.includes("viral") ||
        text.includes("content idea")

    ) {

        return "idea_generation";

    }

    // =====================================
    // GREETINGS
    // =====================================

    if (

        text === "hi" ||
        text === "hello" ||
        text === "hey" ||
        text === "good morning" ||
        text === "good afternoon" ||
        text === "good evening"

    ) {

        return "greeting";

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
