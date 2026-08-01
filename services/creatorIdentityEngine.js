// =====================================
// ChatTBM V6.7
// Creator Identity Engine
//
// Purpose:
// - Build creator identity
// - Store creator style
// - Detect creator preferences
// =====================================



// Temporary memory storage
// Later this can connect to a database

const creatorProfiles = {};




// =====================================
// CREATE DEFAULT PROFILE
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


            createdAt:new Date()



        };


    }



    return creatorProfiles[userId];


}






// =====================================
// UPDATE CREATOR IDENTITY
// =====================================

function updateCreatorIdentity(

    userId,

    data

){


    const profile =

    createCreatorProfile(userId);



    Object.keys(data).forEach(key=>{


        if(data[key] !== undefined){


            profile[key] = data[key];


        }


    });



    return profile;


}






// =====================================
// LEARN FROM CONTENT
// =====================================

function learnCreatorIdentity(

    userId,

    content

){


    const text =

    String(content)

    .toLowerCase();



    const updates = {};





    if(

        text.includes("action") ||

        text.includes("fight") ||

        text.includes("battle")

    ){


        updates.niche =

        "Action Content";


    }




    if(

        text.includes("funny") ||

        text.includes("comedy") ||

        text.includes("laugh")

    ){


        updates.personality =

        "Entertainment";


    }




    if(

        text.includes("journey") ||

        text.includes("struggle") ||

        text.includes("growth")

    ){


        updates.tone =

        "Motivational";


    }




    if(

        text.includes("cinematic") ||

        text.includes("realistic")

    ){


        updates.contentStyle =

        "Cinematic Realistic";


    }



    return updateCreatorIdentity(

        userId,

        updates

    );


}






// =====================================
// GET CREATOR IDENTITY
// =====================================

function getCreatorIdentity(userId){


    return createCreatorProfile(

        userId

    );


}






// =====================================
// EXPORT
// =====================================

module.exports = {


    createCreatorProfile,


    updateCreatorIdentity,


    learnCreatorIdentity,


    getCreatorIdentity


};
