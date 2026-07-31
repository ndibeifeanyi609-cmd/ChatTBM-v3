// =====================================
// ChatTBM V6.2
// Permanent User Personality Profile
// User Identity Memory Engine
// =====================================


// =====================================
// TEMPORARY PROFILE DATABASE
//
// Future upgrade:
// MongoDB / PostgreSQL / Firebase
// =====================================

const userProfiles = {};




// =====================================
// CREATE USER PROFILE
// =====================================

function createProfile(userId){


    if(!userProfiles[userId]){


        userProfiles[userId] = {


            userId,


            creatorName:"",


            niche:"",


            platforms:[],


            writingStyle:"",


            tone:"",


            audience:"",


            responsePreference:"",


            interests:[],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }


    return userProfiles[userId];


}





// =====================================
// GET PROFILE
// =====================================

function getProfile(userId){


    return createProfile(userId);


}





// =====================================
// UPDATE PROFILE
// =====================================

function updateProfile(

    userId,

    data

){


    const profile =

    createProfile(userId);



    Object.keys(data)

    .forEach(key=>{


        if(

            data[key] !== undefined

        ){

            profile[key] = data[key];

        }


    });



    profile.updated =

    new Date().toISOString();



    return profile;


}





// =====================================
// ADD INTEREST
// =====================================

function addInterest(

    userId,

    interest

){


    const profile =

    createProfile(userId);



    if(

        !profile.interests.includes(

            interest

        )

    ){

        profile.interests.push(

            interest

        );

    }



    profile.updated =

    new Date().toISOString();



    return profile;


}





// =====================================
// BUILD PERSONAL AI CONTEXT
// Used by Response Engine
// =====================================

function buildProfileContext(

    userId

){


    const profile =

    createProfile(userId);



    return {


        creatorName:

        profile.creatorName,


        niche:

        profile.niche,


        style:

        profile.writingStyle,


        tone:

        profile.tone,


        audience:

        profile.audience,


        responsePreference:

        profile.responsePreference


    };


}





// =====================================
// DELETE PROFILE
// =====================================

function deleteProfile(

    userId

){


    if(userProfiles[userId]){


        delete userProfiles[userId];


        return true;


    }



    return false;


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    createProfile,

    getProfile,

    updateProfile,

    addInterest,

    buildProfileContext,

    deleteProfile


};
