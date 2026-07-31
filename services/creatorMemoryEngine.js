// =====================================
// ChatTBM V6.3
// Advanced Creator Memory System
// Creator Brain Foundation
// =====================================


// =====================================
// TEMPORARY CREATOR DATABASE
//
// Future:
// MongoDB / PostgreSQL / Firebase
// =====================================

const creatorMemory = {};





// =====================================
// CREATE CREATOR MEMORY SPACE
// =====================================

function createCreatorMemory(userId){


    if(!creatorMemory[userId]){


        creatorMemory[userId] = {


            userId,


            brandVoice: "",


            contentStyle: "",


            audience: "",


            successfulContent: [],


            viralPatterns: [],


            strategies: [],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }



    return creatorMemory[userId];


}





// =====================================
// GET CREATOR MEMORY
// =====================================

function getCreatorMemory(userId){


    return createCreatorMemory(

        userId

    );


}





// =====================================
// UPDATE CREATOR MEMORY
// =====================================

function updateCreatorMemory(

    userId,

    data

){


    const memory =

    createCreatorMemory(

        userId

    );



    Object.keys(data)

    .forEach(key=>{


        if(data[key] !== undefined){


            memory[key] = data[key];


        }


    });



    memory.updated =

    new Date().toISOString();



    return memory;


}
