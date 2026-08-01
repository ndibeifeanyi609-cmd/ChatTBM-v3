// =====================================
// ChatTBM V6.7
// Creator Memory Engine
//
// Purpose:
// - Store creator memories
// - Remember important preferences
// - Retrieve creator knowledge
// =====================================



// Temporary memory storage
// Later this can connect to database

const creatorMemories = {};




// =====================================
// CREATE MEMORY PROFILE
// =====================================

function createMemoryProfile(userId){


    if(!creatorMemories[userId]){


        creatorMemories[userId] = {


            preferences:[],


            successfulPatterns:[],


            contentLessons:[],


            favoriteTopics:[],


            audienceInsights:[],


            lastUpdated:new Date()



        };


    }



    return creatorMemories[userId];


}







// =====================================
// SAVE MEMORY
// =====================================

function saveCreatorMemory(

    userId,

    type,

    information

){


    const memory =

    createMemoryProfile(userId);



    if(

        memory[type] &&

        Array.isArray(memory[type])

    ){


        memory[type].push(

            information

        );


    }



    memory.lastUpdated =

    new Date();




    return memory;


}







// =====================================
// LEARN FROM CONTENT
// =====================================

function learnCreatorMemory(

    userId,

    content

){


    const text =

    String(content)

    .toLowerCase();





    const memory =

    createMemoryProfile(userId);





    if(

        text.includes("cinematic")

    ){

        memory.preferences.push(

            "Prefers cinematic style"

        );

    }




    if(

        text.includes("realistic")

    ){

        memory.preferences.push(

            "Prefers realistic content"

        );

    }





    if(

        text.includes("comedy")

    ){

        memory.favoriteTopics.push(

            "Comedy"

        );

    }





    if(

        text.includes("motivation") ||

        text.includes("journey")

    ){

        memory.contentLessons.push(

            "Uses inspirational storytelling"

        );

    }





    // Remove duplicates

    memory.preferences =

    [...new Set(

        memory.preferences

    )];



    memory.favoriteTopics =

    [...new Set(

        memory.favoriteTopics

    )];



    memory.contentLessons =

    [...new Set(

        memory.contentLessons

    )];





    memory.lastUpdated =

    new Date();





    return memory;


}








// =====================================
// GET MEMORY
// =====================================

function getCreatorMemory(userId){


    return createMemoryProfile(

        userId

    );


}








// =====================================
// SEARCH MEMORY
// =====================================

function searchMemory(

    userId,

    keyword

){


    const memory =

    createMemoryProfile(userId);



    const results = [];



    Object.values(memory)

    .forEach(item=>{



        if(Array.isArray(item)){



            item.forEach(value=>{



                if(

                    String(value)

                    .toLowerCase()

                    .includes(

                        keyword.toLowerCase()

                    )

                ){


                    results.push(value);


                }


            });


        }



    });




    return results;


}







// =====================================
// EXPORT
// =====================================

module.exports = {


    createMemoryProfile,


    saveCreatorMemory,


    learnCreatorMemory,


    getCreatorMemory,


    searchMemory


};
