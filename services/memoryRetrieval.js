// =====================================
// ChatTBM V5.5
// Advanced Memory Retrieval Engine
// Part 1
// Selects relevant memories
// =====================================


// =====================================
// RETRIEVE RELEVANT MEMORY
// =====================================

function retrieveMemory(

    memory = {},

    message = ""

){

    const text =
    message.toLowerCase();


    const relevantMemory = {};



    // =====================================
    // PLATFORM MEMORY
    // =====================================

    if(memory.platform){

        relevantMemory.platform =
        memory.platform;

    }



    // =====================================
    // STYLE MEMORY
    // =====================================

    if(memory.contentStyle){

        relevantMemory.contentStyle =
        memory.contentStyle;

    }



    // =====================================
    // TONE MEMORY
    // =====================================

    if(memory.tone){

        relevantMemory.tone =
        memory.tone;

    }



    // =====================================
    // GOAL MEMORY
    // =====================================

    if(memory.goal){

        relevantMemory.goal =
        memory.goal;

    }



    // =====================================
    // MESSAGE BASED FILTER
    // =====================================


    if(
        text.includes("script") &&
        memory.contentStyle
    ){

        relevantMemory.reason =
        "Using preferred content style for script.";

    }



    if(
        text.includes("post") ||
        text.includes("caption")
    ){

        relevantMemory.reason =
        "Using saved content preferences.";

    }



    return relevantMemory;


}



module.exports = {

    retrieveMemory

};
