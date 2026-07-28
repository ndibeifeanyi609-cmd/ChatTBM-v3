// =====================================
// ChatTBM V5.2
// Structured Memory Engine
// =====================================

const memoryStore = {};



// =====================================
// CREATE USER MEMORY
// =====================================

function createUser(userId){

    if(!memoryStore[userId]){

        memoryStore[userId] = {

            profile:{},

            preferences:{},

            notes:[]

        };

    }

}




// =====================================
// SAVE MEMORY
// =====================================

function saveMemory(
    userId,
    key,
    value
){

    createUser(userId);

    memoryStore[userId]
    .profile[key] = value;

    return {

        success:true,

        message:"Memory saved"

    };

}




// =====================================
// GET MEMORY
// =====================================

function getMemory(
    userId,
    key
){

    createUser(userId);

    return memoryStore[userId]
        .profile[key] || null;

}




// =====================================
// GET ALL MEMORY
// =====================================

function getAllMemory(
    userId
){

    createUser(userId);

    return memoryStore[userId];

}




// =====================================
// ADD MEMORY NOTE
// =====================================

function addMemoryNote(
    userId,
    note
){

    createUser(userId);

    memoryStore[userId]
    .notes
    .push({

        text:note,

        created:
        new Date().toISOString()

    });

}




// =====================================
// CLEAR MEMORY
// =====================================

function clearMemory(
    userId
){

    delete memoryStore[userId];

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
