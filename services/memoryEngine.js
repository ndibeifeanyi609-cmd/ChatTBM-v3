// =====================================
// ChatTBM V5.1
// Real Memory Engine
// User Profile + Creator Memory
// =====================================


const memoryStore = {};



// =====================================
// CREATE USER MEMORY
// =====================================

function createUserMemory(userId){


    if(!memoryStore[userId]){


        memoryStore[userId] = {


            profile:{},


            preferences:{},


            history:[]


        };


    }


}





// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(
    userId,
    category,
    key,
    value
){


    createUserMemory(userId);



    if(
        !memoryStore[userId][category]
    ){

        memoryStore[userId][category] = {};

    }



    memoryStore[userId][category][key] = value;



    return {

        success:true,

        message:
        "Memory saved"

    };


}





// =====================================
// GET MEMORY
// =====================================

function getMemory(
    userId,
    category,
    key
){


    createUserMemory(userId);



    if(
        memoryStore[userId][category] &&
        memoryStore[userId][category][key]
    ){

        return memoryStore[userId][category][key];

    }



    return null;


}





// =====================================
// GET COMPLETE PROFILE
// =====================================

function getAllMemory(userId){


    createUserMemory(userId);



    return memoryStore[userId];


}






// =====================================
// ADD IMPORTANT MEMORY
// =====================================

function addMemoryNote(
    userId,
    note
){


    createUserMemory(userId);



    memoryStore[userId]
    .history
    .push({

        note,

        date:
        new Date().toISOString()

    });



    return {

        success:true

    };


}





// =====================================
// CLEAR USER MEMORY
// =====================================

function clearMemory(userId){


    if(memoryStore[userId]){


        delete memoryStore[userId];


    }



    return {

        success:true,

        message:
        "Memory cleared"

    };


}




// =====================================
// EXPORTS
// =====================================


module.exports = {


    saveMemory,

    getMemory,

    getAllMemory,

    addMemoryNote,

    clearMemory


};
