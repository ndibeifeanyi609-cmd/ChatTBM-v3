// =====================================
// ChatTBM V5.9.2
// Memory Engine
// Database Connected Edition
// =====================================


const {

    saveMemory: databaseSaveMemory,

    getMemories,

    searchMemory,

    getBestMemories,

    deleteMemory,

    clearUserMemory

} = require("./memoryDatabase");





// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(

    userId,

    key,

    value,

    options = {}

){

    return databaseSaveMemory(

        userId,

        {

            type:key,

            value:value,

            score:

            options.score || 10,

            level:

            options.level || "TEMPORARY",

            metadata:

            options.metadata || {}

        }

    );

}





// =====================================
// GET SINGLE MEMORY
// =====================================

function getMemory(

    userId,

    key

){


    const memories =

    getMemories(userId);



    const found =

    memories.find(

        memory =>

        memory.type === key

    );



    return found || null;


}





// =====================================
// GET ALL MEMORY
// =====================================

function getAllMemory(

    userId

){

    return getMemories(userId);

}





// =====================================
// SEARCH MEMORY
// =====================================

function findMemory(

    userId,

    query

){

    return searchMemory(

        userId,

        query

    );

}





// =====================================
// GET IMPORTANT MEMORY
// =====================================

function getImportantMemory(

    userId

){

    return getBestMemories(

        userId,

        10

    );

}





// =====================================
// ADD MEMORY NOTE
// =====================================

function addMemoryNote(

    userId,

    note

){

    return saveMemory(

        userId,

        "note",

        note,

        {

            score:20,

            level:"LONG_TERM"

        }

    );

}





// =====================================
// DELETE MEMORY
// =====================================

function removeMemory(

    userId,

    memoryId

){

    return deleteMemory(

        userId,

        memoryId

    );

}





// =====================================
// CLEAR USER MEMORY
// =====================================

function clearMemory(

    userId

){

    return clearUserMemory(

        userId

    );

}





// =====================================
// MEMORY CONTEXT BUILDER
// Used by AI Brain
// =====================================

function buildMemoryContext(

    userId

){

    const memories =

    getBestMemories(

        userId,

        5

    );



    if(!memories.length){

        return "";

    }



    let context =

    "Known user information:\n";



    memories.forEach(memory=>{


        context +=

        `- ${memory.type}: ${memory.value}\n`;


    });



    return context;

}





// =====================================
// EXPORT
// =====================================

module.exports = {


    saveMemory,

    getMemory,

    getAllMemory,

    findMemory,

    getImportantMemory,

    addMemoryNote,

    removeMemory,

    clearMemory,

    buildMemoryContext


};
