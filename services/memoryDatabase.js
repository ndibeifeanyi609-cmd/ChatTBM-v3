// =====================================
// ChatTBM V5.6
// Long-Term Memory Storage
// Part 1
// Memory Database Layer
// =====================================



// =====================================
// TEMPORARY DATABASE
// Later upgrade:
// MongoDB / PostgreSQL
// =====================================

const memoryDatabase = {};




// =====================================
// CREATE USER PROFILE
// =====================================

function createUserMemory(userId){


    if(!memoryDatabase[userId]){


        memoryDatabase[userId] = {

            memories:{},

            created:
            new Date().toISOString(),

            updated:
            new Date().toISOString()

        };


    }


}




// =====================================
// SAVE LONG TERM MEMORY
// =====================================

function saveLongTermMemory(

    userId,

    key,

    value

){


    createUserMemory(userId);



    memoryDatabase[userId]
    .memories[key] = value;



    memoryDatabase[userId]
    .updated =
    new Date().toISOString();



    return {

        success:true,

        message:"Long term memory saved"

    };


}




// =====================================
// GET LONG TERM MEMORY
// =====================================

function getLongTermMemory(

    userId

){


    createUserMemory(userId);



    return memoryDatabase[userId]
    .memories;


}




// =====================================
// DELETE USER MEMORY
// =====================================

function deleteLongTermMemory(

    userId

){


    delete memoryDatabase[userId];


    return {

        success:true,

        message:"User memory deleted"

    };


}




// =====================================
// EXPORT
// =====================================

module.exports = {


    saveLongTermMemory,

    getLongTermMemory,

    deleteLongTermMemory


};
