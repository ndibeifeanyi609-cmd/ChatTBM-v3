// =====================================
// ChatTBM V5.6
// User Memory Profile System
// Part 3
// =====================================



// =====================================
// USER PROFILE DATABASE
// =====================================

const userProfiles = {};




// =====================================
// CREATE PROFILE
// =====================================

function createProfile(userId){


    if(!userProfiles[userId]){


        userProfiles[userId] = {

            preferences:{},

            interests:[],

            goals:[],

            history:[],

            created:
            new Date().toISOString()


        };


    }


}





// =====================================
// UPDATE PREFERENCE
// =====================================

function updatePreference(

    userId,

    key,

    value

){


    createProfile(userId);



    userProfiles[userId]
    .preferences[key] = value;



    return {

        success:true,

        message:"Preference updated"

    };


}





// =====================================
// ADD INTEREST
// =====================================

function addInterest(

    userId,

    interest

){


    createProfile(userId);



    userProfiles[userId]
    .interests
    .push(interest);



}





// =====================================
// ADD GOAL
// =====================================

function addGoal(

    userId,

    goal

){


    createProfile(userId);



    userProfiles[userId]
    .goals
    .push(goal);



}





// =====================================
// ADD HISTORY
// =====================================

function addProfileHistory(

    userId,

    event

){


    createProfile(userId);



    userProfiles[userId]
    .history
    .push({

        event,

        date:
        new Date().toISOString()

    });


}





// =====================================
// GET PROFILE
// =====================================

function getProfile(

    userId

){


    createProfile(userId);



    return userProfiles[userId];


}





// =====================================
// DELETE PROFILE
// =====================================

function deleteProfile(

    userId

){


    delete userProfiles[userId];


    return {

        success:true,

        message:"Profile deleted"

    };


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    createProfile,

    updatePreference,

    addInterest,

    addGoal,

    addProfileHistory,

    getProfile,

    deleteProfile


};
