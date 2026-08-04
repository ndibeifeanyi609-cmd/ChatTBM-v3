// =====================================
// ChatTBM V8.8
// Smart Memory Intelligence Engine
//
// Upgrade:
// - Memory ranking
// - Better context handling
// - User preference learning
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
// MEMORY LEARNING
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

    buildMemoryContext,

    clearMemory


};







console.log(

"🧠 ChatTBM V8.8 Smart Memory Engine Loaded"

);
