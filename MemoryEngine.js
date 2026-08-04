// =====================================
// ChatTBM V9.6
// Smart Memory Intelligence Engine
//
// Upgrade:
// - Memory ranking
// - Better context handling
// - User preference learning
// - Creator intelligence learning
// - Creator profile memory
// - Safe storage
// - Future backend ready
// =====================================



const CHATTBM_MEMORY_KEY =
"ChatTBM_Memory";







// =====================================
// LOAD MEMORY
// =====================================


function loadMemory(){


    try{


        const data =

        localStorage.getItem(

            CHATTBM_MEMORY_KEY

        );


        if(!data){

            return [];

        }


        return JSON.parse(data);


    }


    catch(error){


        console.error(

            "Memory Load Error:",

            error

        );


        return [];


    }


}







// =====================================
// SAVE MEMORY
// =====================================


function saveMemory(

    type,

    value,

    importance="normal"

){


    try{


        const memories =

        loadMemory();





        const exists =

        memories.some(

            memory =>

            memory.type === type &&

            memory.value === value

        );





        if(exists){

            return false;

        }







        memories.push({


            type,


            value,


            importance,


            created:

            new Date().toISOString()



        });







        localStorage.setItem(

            CHATTBM_MEMORY_KEY,

            JSON.stringify(memories)

        );



        return true;


    }


    catch(error){


        console.error(

            "Memory Save Error:",

            error

        );


        return false;


    }


}







// =====================================
// GET ALL MEMORY
// =====================================


function getMemories(){


    return loadMemory();


}







// =====================================
// SEARCH MEMORY
// =====================================


function searchMemory(query){


    const memories =

    loadMemory();





    return memories.filter(

        memory =>


        memory.value

        .toLowerCase()

        .includes(

            query.toLowerCase()

        )


    );


}







// =====================================
// MEMORY IMPORTANCE SCORE
// =====================================


function memoryScore(memory){


    if(

        memory.importance === "high"

    ){

        return 3;

    }



    if(

        memory.importance === "medium"

    ){

        return 2;

    }



    return 1;


}







// =====================================
// BASIC MEMORY LEARNING
// =====================================


function analyzeMemory(message){



    try{


        const text =

        message.toLowerCase();







        if(

            text.includes(

                "my business is"

            )

        ){



            const parts =

            message.split(

                /my business is/i

            );





            if(parts[1]){


                saveMemory(

                    "business",

                    parts[1].trim(),

                    "high"

                );


            }


        }







        if(

            text.startsWith("i am") ||

            text.startsWith("i'm")

        ){


            saveMemory(

                "user",

                message,

                "medium"

            );


        }







    }


    catch(error){


        console.error(

            "Memory Analysis Error:",

            error

        );


    }


}







// =====================================
// CREATOR INTELLIGENCE MEMORY LEARNING
//
// V9.6 Upgrade:
// - Learns creator identity
// - Learns niche
// - Learns platform
// - Learns goals
// - Learns strategy
// =====================================


function learnCreatorContext(

    creatorContext

){


    try{


        if(!creatorContext){

            return;

        }






        if(

            creatorContext.creator

        ){


            saveMemory(

                "creator_identity",

                "content creator",

                "high"

            );


        }






        if(

            creatorContext.niche

        ){


            saveMemory(

                "creator_niche",

                creatorContext.niche,

                "high"

            );


        }






        if(

            creatorContext.fitness

        ){


            saveMemory(

                "creator_interest",

                "fitness",

                "high"

            );


        }






        if(

            creatorContext.business

        ){


            saveMemory(

                "creator_business",

                "brand and business growth",

                "high"

            );


        }






        if(

            creatorContext.platform

        ){


            saveMemory(

                "creator_platform",

                creatorContext.platform,

                "medium"

            );


        }






        if(

            creatorContext.goal

        ){


            saveMemory(

                "creator_goal",

                creatorContext.goal,

                "high"

            );


        }






        if(

            creatorContext.strategy

        ){


            saveMemory(

                "creator_strategy",

                creatorContext.strategy,

                "medium"

            );


        }



    }



    catch(error){


        console.error(

            "Creator Learning Error:",

            error

        );


    }


}







// =====================================
// BUILD AI CONTEXT
// =====================================


function buildMemoryContext(){



    const memories =

    loadMemory();





    if(

        memories.length === 0

    ){

        return "";

    }







    const important =

    memories

    .sort(

        (a,b)=>

        memoryScore(b)

        -

        memoryScore(a)

    )

    .slice(0,10);







    let context =

    "Known user information:\n";







    important.forEach(memory=>{


        context +=

        `- ${memory.type}: ${memory.value}\n`;



    });







    return context;


}







// =====================================
// CLEAR MEMORY
// =====================================


function clearMemory(){


    localStorage.removeItem(

        CHATTBM_MEMORY_KEY

    );


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMMemory = {


    saveMemory,

    getMemories,

    searchMemory,

    analyzeMemory,

    learnCreatorContext,

    buildMemoryContext,

    clearMemory


};







console.log(

"🧠 ChatTBM V9.6 Creator Memory Intelligence Loaded"

);
