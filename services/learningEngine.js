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

// =====================================
// LEARN FROM USER CORRECTION
// =====================================

function learnCorrection(

    userId,

    original,

    correction

){

    const profile =

    createLearningProfile(userId);



    profile.corrections.push({

        original,

        correction,

        timestamp:

        new Date().toISOString()

    });



    profile.totalLearning++;


    updateLearningTime(userId);



    return {

        success:true,

        message:"Correction learned",

        correction

    };

}





// =====================================
// GET USER LEARNING PROFILE
// =====================================

function getLearningProfile(

    userId

){

    return createLearningProfile(

        userId

    );

}





// =====================================
// GET USER PREFERENCES
// =====================================

function getPreferences(

    userId

){

    const profile =

    createLearningProfile(

        userId

    );



    return profile.preferences;

}





// =====================================
// APPLY LEARNING TO CONTEXT
// =====================================

function buildLearningContext(

    userId

){

    const profile =

    createLearningProfile(

        userId

    );



    const preferences =

    profile.preferences;



    const keys =

    Object.keys(

        preferences

    );



    if(keys.length === 0){

        return "";

    }



    let context =

    "Learned user preferences:\n";



    keys.forEach(key=>{


        context +=

        `- ${key}: ${preferences[key].value}\n`;


    });



    return context;

}





// =====================================
// LEARNING STATISTICS
// =====================================

function getLearningStats(

    userId

){

    const profile =

    createLearningProfile(

        userId

    );



    return {

        totalLearning:

        profile.totalLearning,


        preferences:

        Object.keys(

            profile.preferences

        ).length,


        corrections:

        profile.corrections.length

    };

}





// =====================================
// EXPORT
// =====================================

module.exports = {


    createLearningProfile,

    learnPreference,

    learnCorrection,

    getLearningProfile,

    getPreferences,

    buildLearningContext,

    getLearningStats


};
