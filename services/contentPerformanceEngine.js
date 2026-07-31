// =====================================
// ChatTBM V6.4
// Content Performance Memory Engine
//
// Learns:
// - Successful Content
// - Audience Reaction
// - Winning Patterns
// - Content Results
// =====================================



// =====================================
// TEMPORARY PERFORMANCE DATABASE
//
// Future upgrade:
// MongoDB / PostgreSQL / Firebase
// =====================================

const contentPerformanceDB = {};





// =====================================
// CREATE USER CONTENT MEMORY
// =====================================

function createContentMemory(userId){


    if(!contentPerformanceDB[userId]){


        contentPerformanceDB[userId] = {


            userId,


            contents: [],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }



    return contentPerformanceDB[userId];


}





// =====================================
// SAVE CONTENT PERFORMANCE
// =====================================

function saveContentPerformance(

    userId,

    data

){


    const memory =

    createContentMemory(

        userId

    );





    const content = {


        id:

        Date.now().toString(),



        title:

        data.title || "",



        type:

        data.type || "general",



        platform:

        data.platform || "",



        performance:

        data.performance || "",



        reason:

        data.reason || "",



        audienceReaction:

        data.audienceReaction || "",



        hook:

        data.hook || "",



        created:

        new Date().toISOString()


    };





    memory.contents.push(

        content

    );



    memory.updated =

    new Date().toISOString();





    return content;


}





// =====================================
// GET CONTENT HISTORY
// =====================================

function getContentPerformance(

    userId

){


    const memory =

    createContentMemory(

        userId

    );



    return memory.contents;


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    createContentMemory,


    saveContentPerformance,


    getContentPerformance


};
