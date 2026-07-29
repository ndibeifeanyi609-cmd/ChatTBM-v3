// =====================================
// ChatTBM V5.9.2
// Personal AI Brain
// Memory + Relationship + Context
// =====================================



const {

    getBestMemories

} = require("./memoryDatabase");



const {

    retrieveMemory,

    buildMemoryContext

} = require("./memoryRetrieval");



const relationshipEngine =

require("./relationshipEngine");





// =====================================
// CREATE USER BRAIN CONTEXT
// =====================================

function buildBrainContext(

    userId,

    message,

    oldMemory = {}

){


    // =============================
    // LONG TERM MEMORY
    // =============================

    const longTermMemory =

    getBestMemories(

        userId,

        5

    );





    // =============================
    // OLD MEMORY SYSTEM
    // =============================

    const retrievedMemory =

    retrieveMemory(

        oldMemory,

        message

    );






    // =============================
    // RELATIONSHIPS
    // =============================

    const relationships =

    relationshipEngine.find(

        userId

    );






    // =============================
    // CREATE AI UNDERSTANDING
    // =============================

    const memoryContext =

    buildMemoryContext(

        retrievedMemory

    );





    return {


        userId,


        longTermMemory,


        retrievedMemory,


        relationships,


        memoryContext,


        timestamp:

        new Date().toISOString()


    };


}





// =====================================
// LEARN FROM CONVERSATION
// =====================================

function learnBrain(

    userId,

    message

){


    return {


        userId,


        learned:

        true,


        message,


        timestamp:

        new Date().toISOString()


    };


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    buildBrainContext,


    learnBrain


};
