// =====================================
// ChatTBM V5.5
// Advanced Memory Retrieval Engine
// Part 4
// Ranking Integration
// =====================================


const {
    rankMemories
} = require("./memoryRanking");




// =====================================
// RETRIEVE RELEVANT MEMORY
// =====================================

function retrieveMemory(

    memory = {},

    message = ""

){


    // =====================================
    // RANK ALL MEMORIES
    // =====================================

    const rankedMemories =

    rankMemories(

        memory,

        message

    );




    const relevantMemory = {};




    // =====================================
    // SELECT TOP MEMORIES
    // =====================================

    rankedMemories

    .slice(0,5)

    .forEach(

        item => {


            if(item.score > 1){


                relevantMemory[item.key] =
                item.value;


            }


        }

    );





    // =====================================
    // MEMORY METADATA
    // =====================================

    relevantMemory._memoryInfo = {

        total:
        rankedMemories.length,


        selected:
        Object.keys(relevantMemory)
        .length,


        ranking:
        rankedMemories

    };




    return relevantMemory;


}




module.exports = {

    retrieveMemory

};
