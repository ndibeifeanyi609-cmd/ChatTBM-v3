// =====================================
// ChatTBM V6.7
// Creator Identity Engine
//
// Purpose:
// - Build creator identity
// - Learn creator preferences
// - Store creator profile
// =====================================


const creatorProfiles = {};




// =====================================
// CREATE PROFILE
// =====================================

function createCreatorProfile(userId){


    if(!creatorProfiles[userId]){


        creatorProfiles[userId] = {


            creatorName:"",

            niche:"",

            contentStyle:"",

            personality:"",

            audience:"",

            tone:"",

            preferredTopics:[],

            brandKeywords:[],

            createdAt:new Date(),

            updatedAt:new Date()


        };


    }



    return creatorProfiles[userId];

}






// =====================================
// UPDATE PROFILE
// =====================================

function updateCreatorIdentity(

    userId,

    data={}

){


    const profile =

    createCreatorProfile(userId);



    Object.keys(data)

    .forEach(key=>{


        if(data[key] !== undefined){


            profile[key] = data[key];


        }


    });



    profile.updatedAt =

    new Date();



    return profile;


}






// =====================================
// LEARN CREATOR IDENTITY
// =====================================

function learnCreatorIdentity(

    userId,

    content

){


    const text =

    String(content || "")

    .toLowerCase();



    const updates = {};



    const topics = [];



    const keywords = [];






    if(

        text.includes("action") ||

        text.includes("fight") ||

        text.includes("battle")

    ){

        updates.niche =

        "Action Content";


        topics.push("Action");

    }






    if(

        text.includes("comedy") ||

        text.includes("funny") ||

        text.includes("laugh")

    ){

        updates.personality =

        "Entertainment";


        topics.push("Comedy");

    }






    if(

        text.includes("journey") ||

        text.includes("growth") ||

        text.includes("struggle")

    ){

        updates.tone =

        "Motivational";


        keywords.push("Growth");

    }






    if(

        text.includes("cinematic") ||

        text.includes("realistic")

    ){

        updates.contentStyle =

        "Cinematic Realistic";


        keywords.push("Cinematic");

    }





    const profile =

    updateCreatorIdentity(

        userId,

        updates

    );





    profile.preferredTopics =

    [

        ...new Set(

            [

                ...profile.preferredTopics,

                ...topics

            ]

        )

    ];





    profile.brandKeywords =

    [

        ...new Set(

            [

                ...profile.brandKeywords,

                ...keywords

            ]

        )

    ];





    return profile;


}






// =====================================
// GET PROFILE
// =====================================

function getCreatorIdentity(userId){


    return createCreatorProfile(userId);


}






module.exports = {


    createCreatorProfile,

    updateCreatorIdentity,

    learnCreatorIdentity,

    getCreatorIdentity


};
