// =====================================
// ChatTBM V6.7.1
// Creator Memory Engine
//
// Purpose:
// - Store creator knowledge
// - Learn creator preferences
// - Support Creator Learning Engine
// - Build creator intelligence profile
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

            brandVoice:[],

            contentStyle:[],

            audience:[],

            strategies:[],

            viralPatterns:[],

            createdAt:new Date(),

            lastUpdated:new Date()


        };


    }


    return creatorMemories[userId];

}





// =====================================
// UPDATE CREATOR MEMORY
// Used by creatorLearningEngine.js
// =====================================

function updateCreatorMemory(

    userId,

    data = {}

){


    const memory =

    createMemoryProfile(userId);



    Object.keys(data).forEach(key=>{


        if(

            Array.isArray(memory[key])

        ){


            memory[key].push(

                data[key]

            );



            memory[key] =

            [

                ...new Set(

                    memory[key]

                )

            ];


        }

        else {


            memory[key] = data[key];


        }


    });



    memory.lastUpdated =

    new Date();



    return memory;


}





// =====================================
// SAVE CREATOR MEMORY
// =====================================

function saveCreatorMemory(

    userId,

    type,

    information

){


    const memory =

    createMemoryProfile(userId);



    if(

        !memory[type]

    ){

        memory[type] = [];

    }



    if(information){


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
// LEARN CREATOR MEMORY
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



    if(text.includes("cinematic")){


        memory.preferences.push(

            "Cinematic style"

        );


    }



    if(text.includes("realistic")){


        memory.preferences.push(

            "Realistic style"

        );


    }



    if(text.includes("action")){


        memory.favoriteTopics.push(

            "Action content"

        );


    }



    if(text.includes("journey")){


        memory.contentLessons.push(

            "Transformation storytelling"

        );


    }



    memory.lastUpdated =

    new Date();



    return memory;


}





// =====================================
// GET CREATOR MEMORY
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



    const results = [];



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





// =====================================
// EXPORT
// =====================================

module.exports = {


    createMemoryProfile,

    updateCreatorMemory,

    saveCreatorMemory,

    learnCreatorMemory,

    getCreatorMemory,

    searchMemory


};
