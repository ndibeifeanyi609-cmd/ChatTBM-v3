// =====================================
// ChatTBM V6.1
// Learning Engine
// Phase 1
// =====================================


// =====================================
// LEARNING STORE
// =====================================

const learningStore = {};


// =====================================
// CREATE USER LEARNING SPACE
// =====================================

function createLearningProfile(userId) {

    if (!learningStore[userId]) {

        learningStore[userId] = {

            userId,

            preferences: {},

            corrections: [],

            totalLearning: 0,

            created: new Date().toISOString(),

            updated: new Date().toISOString()

        };

    }

    return learningStore[userId];

}


// =====================================
// UPDATE TIMESTAMP
// =====================================

function updateLearningTime(userId) {

    const profile = createLearningProfile(userId);

    profile.updated = new Date().toISOString();

}


// =====================================
// LEARN A PREFERENCE
// =====================================

function learnPreference(userId, key, value) {

    const profile = createLearningProfile(userId);

    if (!profile.preferences[key]) {

        profile.preferences[key] = {

            value,

            confidence: 1

        };

    } else {

        profile.preferences[key].value = value;

        profile.preferences[key].confidence += 1;

    }

    profile.totalLearning++;

    updateLearningTime(userId);

    return profile.preferences[key];

}
