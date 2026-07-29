// =========================================
// ChatTBM V5.7
// Personal AI Identity Engine
// Part 2
// Automatic Learning Engine
// =========================================

class AIIdentityEngine {

    constructor() {
        this.users = {};
    }

    createUser(userId) {

        if (!this.users[userId]) {

            this.users[userId] = {

                id: userId,

                profile: {

                    name: "",

                    language: "English",

                    writingStyle: "Professional",

                    tone: "Friendly",

                    favoritePlatform: "Facebook",

                    favoriteCategory: "General"

                },

                learning: {

                    prompts: [],

                    interests: [],

                    history: []

                }

            };

        }

        return this.users[userId];

    }

    // -------------------------
    // Learn from each message
    // -------------------------

    learn(userId, message) {

        const user = this.createUser(userId);

        const text = message.toLowerCase();

        user.learning.history.push(message);

        // Save recent prompts
        user.learning.prompts.push(message);

        if (user.learning.prompts.length > 50) {
            user.learning.prompts.shift();
        }

        // Detect favorite platform
        if (text.includes("facebook")) {
            user.profile.favoritePlatform = "Facebook";
        }

        if (text.includes("instagram")) {
            user.profile.favoritePlatform = "Instagram";
        }

        if (text.includes("tiktok")) {
            user.profile.favoritePlatform = "TikTok";
        }

        if (text.includes("youtube")) {
            user.profile.favoritePlatform = "YouTube";
        }

        // Detect content niche
        if (text.includes("football") ||
            text.includes("soccer") ||
            text.includes("sport")) {

            user.profile.favoriteCategory = "Sports";
        }

        if (text.includes("business")) {
            user.profile.favoriteCategory = "Business";
        }

        if (text.includes("comedy") ||
            text.includes("funny")) {

            user.profile.favoriteCategory = "Comedy";
        }

        if (text.includes("motivation")) {
            user.profile.favoriteCategory = "Motivation";
        }

        // Detect preferred tone
        if (text.includes("professional")) {
            user.profile.tone = "Professional";
        }

        if (text.includes("funny")) {
            user.profile.tone = "Funny";
        }

        if (text.includes("friendly")) {
            user.profile.tone = "Friendly";
        }

        // Store interests
        if (!user.learning.interests.includes(user.profile.favoriteCategory)) {
            user.learning.interests.push(user.profile.favoriteCategory);
        }

        return user;

    }

    // -------------------------
    // Get profile
    // -------------------------

    getProfile(userId) {
        return this.createUser(userId).profile;
    }

}

module.exports = AIIdentityEngine;
