
// =====================================
// ChatTBM V5.2
// Memory Learning Engine
// Learns user preferences automatically
// =====================================

const {
    saveMemory,
    getAllMemory
} = require("./memoryEngine");



function learnFromMessage(userId, message) {

    const text = message.toLowerCase();

    const memory =
    getAllMemory(userId);



    if (!memory.profile) {
        memory.profile = {};
    }



    // =====================================
    // PLATFORM
    // =====================================

    if (text.includes("tiktok")) {
        saveMemory(userId, "platform", "TikTok");
    }

    if (text.includes("instagram")) {
        saveMemory(userId, "platform", "Instagram");
    }

    if (text.includes("facebook")) {
        saveMemory(userId, "platform", "Facebook");
    }

    if (text.includes("youtube")) {
        saveMemory(userId, "platform", "YouTube");
    }



    // =====================================
    // CONTENT STYLE
    // =====================================

    if (text.includes("funny")) {
        saveMemory(userId, "contentStyle", "Funny");
    }

    if (text.includes("cinematic")) {
        saveMemory(userId, "contentStyle", "Cinematic");
    }

    if (text.includes("educational")) {
        saveMemory(userId, "contentStyle", "Educational");
    }

    if (text.includes("motivational")) {
        saveMemory(userId, "contentStyle", "Motivational");
    }



    // =====================================
    // NICHE
    // =====================================

    if (text.includes("football")) {
        saveMemory(userId, "niche", "Football");
    }

    if (text.includes("business")) {
        saveMemory(userId, "niche", "Business");
    }

    if (text.includes("gaming")) {
        saveMemory(userId, "niche", "Gaming");
    }

    if (text.includes("comedy")) {
        saveMemory(userId, "niche", "Comedy");
    }

    if (text.includes("technology")) {
        saveMemory(userId, "niche", "Technology");
    }



    // =====================================
    // AUDIENCE
    // =====================================

    if (text.includes("teen")) {
        saveMemory(userId, "audience", "Teenagers");
    }

    if (text.includes("student")) {
        saveMemory(userId, "audience", "Students");
    }

    if (text.includes("creator")) {
        saveMemory(userId, "audience", "Content Creators");
    }

    if (text.includes("business owner")) {
        saveMemory(userId, "audience", "Business Owners");
    }



    // =====================================
    // GOAL
    // =====================================

    if (
        text.includes("grow") ||
        text.includes("followers")
    ) {

        saveMemory(
            userId,
            "goal",
            "Audience Growth"
        );

    }



    // =====================================
    // EXPERIENCE
    // =====================================

    if (text.includes("beginner")) {
        saveMemory(userId, "experience", "Beginner");
    }

    if (text.includes("intermediate")) {
        saveMemory(userId, "experience", "Intermediate");
    }

    if (text.includes("expert")) {
        saveMemory(userId, "experience", "Expert");
    }

}



module.exports = {

    learnFromMessage

};
