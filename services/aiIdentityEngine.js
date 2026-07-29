// =========================================
// ChatTBM V5.7
// Personal AI Identity Engine
// Part 3
// Personality Scoring Engine
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

                },

                scores: {

                    platforms: {
                        Facebook: 0,
                        Instagram: 0,
                        TikTok: 0,
                        YouTube: 0
                    },

                    categories: {
                        General: 0,
                        Sports: 0,
                        Business: 0,
                        Comedy: 0,
                        Motivation: 0
                    },

                    tones: {
                        Professional: 0,
                        Friendly: 0,
                        Funny: 0
                    }

                }

            };

        }

        return this.users[userId];

    }

    increaseScore(group, key) {

        if (group[key] !== undefined) {
            group[key]++;
        }

    }

    highestScore(group) {

        let best = null;
        let score = -1;

        for (const item in group) {

            if (group[item] > score) {

                score = group[item];
                best = item;

            }

        }

        return best;

    }

    learn(userId, message) {

        const user = this.createUser(userId);

        const text = message.toLowerCase();

        user.learning.history.push(message);

        user.learning.prompts.push(message);

        if (user.learning.prompts.length > 50) {
            user.learning.prompts.shift();
        }

        // Platforms

        if (text.includes("facebook"))
            this.increaseScore(user.scores.platforms, "Facebook");

        if (text.includes("instagram"))
            this.increaseScore(user.scores.platforms, "Instagram");

        if (text.includes("tiktok"))
            this.increaseScore(user.scores.platforms, "TikTok");

        if (text.includes("youtube"))
            this.increaseScore(user.scores.platforms, "YouTube");

        // Categories

        if (text.includes("football") ||
            text.includes("soccer") ||
            text.includes("sport"))
            this.increaseScore(user.scores.categories, "Sports");

        if (text.includes("business"))
            this.increaseScore(user.scores.categories, "Business");

        if (text.includes("comedy") ||
            text.includes("funny"))
            this.increaseScore(user.scores.categories, "Comedy");

        if (text.includes("motivation"))
            this.increaseScore(user.scores.categories, "Motivation");

        // Tone

        if (text.includes("professional"))
            this.increaseScore(user.scores.tones, "Professional");

        if (text.includes("friendly"))
            this.increaseScore(user.scores.tones, "Friendly");

        if (text.includes("funny"))
            this.increaseScore(user.scores.tones, "Funny");

        // Update profile using highest scores

        user.profile.favoritePlatform =
            this.highestScore(user.scores.platforms);

        user.profile.favoriteCategory =
            this.highestScore(user.scores.categories);

        user.profile.tone =
            this.highestScore(user.scores.tones);

        if (!user.learning.interests.includes(user.profile.favoriteCategory)) {

            user.learning.interests.push(
                user.profile.favoriteCategory
            );

        }

        return user;

    }

    getProfile(userId) {

        return this.createUser(userId).profile;

    }

    getScores(userId) {

        return this.createUser(userId).scores;

    }

}

module.exports = AIIdentityEngine;
