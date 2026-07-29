// =====================================
// ChatTBM V5.9.2
// Memory Intelligence Retrieval
// Database Memory Format Edition
// =====================================



// =====================================
// SEARCH RELEVANT MEMORY
// =====================================

function retrieveMemory(

    memories = [],

    message = ""

){

    const text =

    message.toLowerCase();



    const results = [];



    memories.forEach(memory=>{


        if(!memory) return;



        const type =

        String(memory.type || "")

        .toLowerCase();



        const value =

        String(memory.value || "")

        .toLowerCase();



        let score = 0;



        // =============================
        // TYPE MATCH
        // =============================

        if(

            text.includes(type)

        ){

            score += 5;

        }





        // =============================
        // VALUE MATCH
        // =============================

        if(

            text.includes(value)

        ){

            score += 8;

        }





        // =============================
        // IMPORTANT MEMORY LEVELS
        // =============================

        if(

            memory.level === "PERMANENT"

        ){

            score += 5;

        }



        if(

            memory.level === "LONG_TERM"

        ){

            score += 3;

        }





        // =============================
        // IMPORTANT TYPES
        // =============================

        const importantTypes = [

            "platform",

            "contentstyle",

            "tone",

            "goal",

            "project",

            "name"

        ];



        if(

            importantTypes.includes(type)

        ){

            score += 3;

        }





        if(score > 0){


            results.push({

                id:

                memory.id,


                type:

                memory.type,


                value:

                memory.value,


                level:

                memory.level,


                score


            });


        }


    });





    // =============================
    // SORT BEST MEMORY FIRST
    // =============================

    results.sort(

        (a,b)=>

        b.score - a.score

    );



    return results;


}





// =====================================
// BUILD AI MEMORY CONTEXT
// =====================================

function buildMemoryContext(

    memories = []

){


    if(!memories.length){

        return "";

    }



    let context =

    "User memory:\n";





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


    retrieveMemory,

    buildMemoryContext


};
