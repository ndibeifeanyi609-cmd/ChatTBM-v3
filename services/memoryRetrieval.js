// =====================================
// ChatTBM V5.9.2
// Memory Intelligence Retrieval
// =====================================



// =====================================
// SEARCH RELEVANT MEMORY
// =====================================

function retrieveMemory(

    memories = {},

    message = ""

){


    const text =

    message.toLowerCase();



    const results = [];



    Object.keys(memories).forEach(key=>{


        const value =

        String(memories[key])

        .toLowerCase();



        let score = 0;



        // Key match

        if(

            text.includes(

                key.toLowerCase()

            )

        ){

            score += 5;

        }



        // Value match

        if(

            text.includes(value)

        ){

            score += 5;

        }





        // Important user preferences

        if(

            [

                "platform",

                "contentStyle",

                "tone",

                "goal"

            ].includes(key)

        ){

            score += 3;

        }





        if(score > 0){


            results.push({

                key,

                value:

                memories[key],

                score


            });


        }



    });





    results.sort(

        (a,b)=>

        b.score-a.score

    );



    return results;


}





// =====================================
// BUILD MEMORY CONTEXT
// =====================================

function buildMemoryContext(

    memories = []

){


    if(!memories.length){

        return "";

    }



    let context =

    "User preferences:\n";



    memories.forEach(memory=>{


        context +=

        `- ${memory.key}: ${memory.value}\n`;


    });



    return context;


}





module.exports = {


    retrieveMemory,

    buildMemoryContext


};
