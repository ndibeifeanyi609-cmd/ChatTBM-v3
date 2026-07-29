
// =========================================
// ChatTBM V5.8
// Memory Learning Engine
// Part 4
// =========================================

const {
    saveMemory
} = require("./memoryEngine");

function learnFromMessage(userId, message) {

    const text = message.toLowerCase();

    // =====================================
    // PLATFORM DETECTION
    // =====================================

    if (text.includes("facebook")) {

        saveMemory(userId, "platform", "Facebook");

    }

    if (text.includes("instagram")) {

        saveMemory(userId, "platform", "Instagram");

    }

    if (text.includes("tiktok")) {

        saveMemory(userId, "platform", "TikTok");

    }

    if (text.includes("youtube")) {

        saveMemory(userId, "platform", "YouTube");

    }

    // =====================================
    // CONTENT STYLE
    // =====================================

    if (text.includes("cinematic")) {

        saveMemory(userId, "contentStyle", "Cinematic");

    }

    if (text.includes("funny")) {

        saveMemory(userId, "contentStyle", "Funny");

    }

    if (text.includes("professional")) {

        saveMemory(userId, "contentStyle", "Professional");

    }

    // =====================================
    // TONE
    // =====================================

    if (text.includes("friendly")) {

        saveMemory(userId, "tone", "Friendly");

    }

    if (text.includes("formal")) {

        saveMemory(userId, "tone", "Formal");

    }

    if (text.includes("casual")) {

        saveMemory(userId, "tone", "Casual");

    }

    // =====================================
    // USER GOALS
    // =====================================

    if (text.includes("viral")) {

        saveMemory(userId, "goal", "Create viral content");

    }

    if (text.includes("business")) {

        saveMemory(userId, "goal", "Grow business");

    }

    if (text.includes("marketing")) {

        saveMemory(userId, "goal", "Improve marketing");

    }

    if (text.includes("sales")) {

        saveMemory(userId, "goal", "Increase sales");

    }

    return {

        success: true,

        learned: true

    };

}

module.exports = {

    learnFromMessage

};
