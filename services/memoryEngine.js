// =====================================
// ChatTBM V5.6
// Memory Engine
// Part 2
// Long-Term Storage Connection
// =====================================



const {

    saveLongTermMemory,

    getLongTermMemory,

    deleteLongTermMemory

} = require("./memoryDatabase");





// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(

    userId,

    key,

    value

){


    return saveLongTermMemory(

        userId,

        key,

        value

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

    getLongTermMemory(

        userId

    );



    if(memories[key]){


        return memories[key];


    }



    return null;


}





// =====================================
// GET ALL MEMORY
// =====================================

function getAllMemory(

    userId

){


    return getLongTermMemory(

        userId

    );


}





// =====================================
// ADD MEMORY NOTE
// =====================================

function addMemoryNote(

    userId,

    note

){


    return saveLongTermMemory(

        userId,

        "note",

        note

    );


}





// =====================================
// CLEAR MEMORY
// =====================================

function clearMemory(

    userId

){


    return deleteLongTermMemory(

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
