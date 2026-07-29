// =====================================
// ChatTBM V5.9.2
// Personal AI Brain
// Memory + Relationship + Context Engine
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
// BUILD USER BRAIN CONTEXT
// =====================================

function buildBrainContext(

    userId,

    message,

    oldMemory = []

){

    // =============================
    // IMPORTANT LONG TERM MEMORY
    // =============================

    const longTermMemory =

    getBestMemories(

        userId,

        5

    );





    // =============================
    // SEARCH RELEVANT MEMORY
    // =============================

    const relevantMemory =

    retrieveMemory(

        oldMemory.length

        ?

        oldMemory

        :

        longTermMemory,

        message

    );





    // =============================
    // USER RELATIONSHIPS
    // =============================

    const relationships =

    relationshipEngine.find(

        userId

    );





    // =============================
    // AI MEMORY CONTEXT
    // =============================

    const memoryContext =

    buildMemoryContext(

        relevantMemory

    );





    return {

        userId,


        longTermMemory,


        relevantMemory,


        relationships,


        memoryContext,


        timestamp:

        new Date().toISOString()

    };


}





// =====================================
// LEARN FROM USER MESSAGE
// =====================================

function learnBrain(

    userId,

    message

){

    return {


        userId,


        learned:true,


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
