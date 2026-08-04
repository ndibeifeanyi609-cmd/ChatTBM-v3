// =====================================
// ChatTBM V8.2
// Smart Memory Engine
//
// Upgrade:
// - Better memory storage
// - Duplicate protection
// - Importance ranking
// - AI context preparation
// =====================================



const CHATTBM_MEMORY_KEY =

"ChatTBM_Memory";







// =====================================
// LOAD MEMORY
// =====================================


function loadMemory(){


    const data =

    localStorage.getItem(

        CHATTBM_MEMORY_KEY

    );



    if(!data){


        return [];


    }



    return JSON.parse(data);


}







// =====================================
// SAVE MEMORY
// =====================================


function saveMemory(

    type,

    value,

    importance = "normal"

){


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







    let context =

    "Known user information:\n";







    memories

    .slice(-10)

    .forEach(memory=>{


        context +=


        `- ${memory.type}: ${memory.value}\n`;



    });







    return context;


}







// =====================================
// AUTO MEMORY EXTRACTION
// =====================================


function analyzeMemory(message){



    const text =

    message.toLowerCase();







    if(

        text.includes("my business is")

    ){


        const value =

        message

        .split(

            "is"

        )[1]

        .trim();





        saveMemory(

            "business",

            value,

            "high"

        );


    }







    if(

        text.includes("i am") ||

        text.includes("i'm")

    ){


        saveMemory(

            "user",

            message,

            "medium"

        );


    }



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


    buildMemoryContext,


    analyzeMemory,


    clearMemory


};







console.log(

"🧠 ChatTBM V8.2 Smart Memory Engine Loaded"

);
