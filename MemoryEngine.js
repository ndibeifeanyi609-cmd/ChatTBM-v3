// =====================================
// ChatTBM V7.1
// Frontend Memory Engine
//
// Purpose:
// - Store user memories locally
// - Provide AI context
// - Prepare future backend sync
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
    value
){

    const memories =
    loadMemory();


    memories.push({

        type,

        value,

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
    .slice(-5)
    .forEach(memory=>{


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

    buildMemoryContext,

    clearMemory

};



console.log(
"✅ ChatTBM Frontend Memory Engine Loaded"
);
