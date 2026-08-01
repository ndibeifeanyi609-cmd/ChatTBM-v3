// =====================================
// ChatTBM V6.7
// Creator Memory Engine
//
// Purpose:
// - Store creator knowledge
// - Learn content preferences
// - Recall creator patterns
// =====================================


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

            createdAt:new Date(),

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

        Array.isArray(memory[type])

        &&

        information

    ){


        memory[type].push(

            information

        );



        memory[type] =

        [

            ...new Set(

                memory[type]

            )

        ];

    }



    memory.lastUpdated =

    new Date();



    return memory;


}






// =====================================
// LEARN MEMORY
// =====================================

function learnCreatorMemory(

    userId,

    content

){


    const text =

    String(content || "")

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

        text.includes("action")

    ){

        memory.favoriteTopics.push(

            "Action"

        );


    }





    if(

        text.includes("growth") ||

        text.includes("journey")

    ){

        memory.contentLessons.push(

            "Uses transformation storytelling"

        );


    }






    Object.keys(memory)

    .forEach(key=>{


        if(Array.isArray(memory[key])){


            memory[key] =

            [

                ...new Set(

                    memory[key]

                )

            ];

        }


    });





    memory.lastUpdated =

    new Date();



    return memory;


}






// =====================================
// GET MEMORY
// =====================================

function getCreatorMemory(userId){


    return createMemoryProfile(userId);


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



    const results=[];



    Object.values(memory)

    .forEach(item=>{


        if(Array.isArray(item)){


            item.forEach(value=>{


                if(

                    String(value)

                    .toLowerCase()

                    .includes(

                        String(keyword)

                        .toLowerCase()

                    )

                ){


                    results.push(value);


                }


            });


        }


    });



    return results;


}






module.exports = {


    createMemoryProfile,

    saveCreatorMemory,

    learnCreatorMemory,

    getCreatorMemory,

    searchMemory


};
