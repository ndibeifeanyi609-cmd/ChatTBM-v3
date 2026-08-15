// =====================================
// ChatTBM V6.7.4
// Creator Memory Engine
//
// Upgrade:
// - Memory Intelligence Connected
// - Intelligent Memory Ranking
// - Creator Knowledge Storage
// - Memory Retrieval Ready
// =====================================



const MemoryIntelligenceEngine =

require("./memoryIntelligenceEngine");





const memoryIntelligence =

new MemoryIntelligenceEngine();





const creatorMemories = {};








// =====================================
// CREATE MEMORY PROFILE
// =====================================


function createMemoryProfile(userId){


    if(!creatorMemories[userId]){


        creatorMemories[userId] = {


            userId,


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


            intelligentMemories:[],


            createdAt:new Date(),


            lastUpdated:new Date()



        };


    }



    return creatorMemories[userId];


}









// =====================================
// UPDATE CREATOR MEMORY
// =====================================


function updateCreatorMemory(

    userId,

    data = {}

){


    const memory =

    createMemoryProfile(userId);





    Object.keys(data)

    .forEach(key=>{


        if(Array.isArray(memory[key])){


            memory[key].push(

                data[key]

            );



            memory[key] = [

                ...new Set(

                    memory[key]

                )

            ];


        }


        else{


            memory[key] = data[key];


        }



    });





    memory.lastUpdated = new Date();



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





    if(!memory[type]){


        memory[type] = [];


    }






    if(information){


        memory[type].push(

            information

        );



        memory[type] = [

            ...new Set(

                memory[type]

            )

        ];



        const intelligentMemory =

        memoryIntelligence.remember(

            userId,

            information

        );



        memory.intelligentMemories.push(

            intelligentMemory

        );


    }





    memory.lastUpdated = new Date();



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


        saveCreatorMemory(

            userId,

            "contentStyle",

            "Cinematic style"

        );


    }






    if(text.includes("realistic")){


        saveCreatorMemory(

            userId,

            "contentStyle",

            "Realistic style"

        );


    }






    if(text.includes("action")){


        saveCreatorMemory(

            userId,

            "favoriteTopics",

            "Action content"

        );


    }






    if(text.includes("journey")){


        saveCreatorMemory(

            userId,

            "contentLessons",

            "Transformation storytelling"

        );


    }






    memory.lastUpdated = new Date();



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
// INTELLIGENT MEMORY
// =====================================


function getImportantMemories(userId){


    return memoryIntelligence

    .getImportantMemories(

        userId

    );


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

    searchMemory,

    getImportantMemories


};
