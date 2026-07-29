// =====================================
// ChatTBM V5.9.1
// Memory Engine
// Database Bridge Layer
// =====================================


// =====================================
// CONNECT MEMORY DATABASE
// =====================================

const {

    saveMemory: saveDatabaseMemory,

    getMemories,

    clearUserMemory

} = require("./memoryDatabase");




// =====================================
// SAVE MEMORY
// Compatibility Function
// =====================================

function saveMemory(

    userId,

    key,

    value

){


    return saveDatabaseMemory(

        userId,

        {

            type: key,

            value: value,

            score: 50,

            level: "TEMPORARY",

            metadata: {

                source: "Memory Engine"

            }

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



    const memory =

    memories.find(

        item => item.type === key

    );



    return memory || null;


}





// =====================================
// GET ALL MEMORY
// =====================================

function getAllMemory(

    userId

){


    const memories =

    getMemories(userId);



    return memories;


}





// =====================================
// ADD MEMORY NOTE
// =====================================

function addMemoryNote(

    userId,

    note

){


    return saveDatabaseMemory(

        userId,

        {

            type:"note",

            value:note,

            score:40,

            level:"TEMPORARY",

            metadata:{

                source:"Memory Note"

            }

        }

    );


}





// =====================================
// CLEAR MEMORY
// =====================================

function clearMemory(

    userId

){


    return clearUserMemory(

        userId

    );


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    saveMemory,


    getMemory,


    getAllMemory,


    addMemoryNote,


    clearMemory


};
