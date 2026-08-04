// =====================================
// ChatTBM V8.7
// AI Core
//
// Upgrade:
// - Memory context
// - Context-aware routing
// - Skill pipeline
// - Better response handling
// - Future AI engine ready
// =====================================



const ChatTBM_Core = {


    version: "8.7",


    status: "ready"


};







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){


    console.log(

        "🧠 ChatTBM Processing:",

        message

    );





    const userId = "guest";





    let memoryContext = "";



    let response = null;



    let intent = "unknown";







    // =================================
    // MEMORY CONTEXT
    // =================================


    try{


        if(

            window.ChatTBMMemory &&

            window.ChatTBMMemory.buildMemoryContext

        ){


            memoryContext =

            window.ChatTBMMemory.buildMemoryContext();



        }


    }


    catch(error){


        console.error(

            "Memory Error:",

            error

        );


    }







    // =================================
    // SKILL ROUTING
    // =================================


    try{


        if(

            window.ChatTBMRouter &&

            window.ChatTBMRouter.routeMessage

        ){



            response =

            window.ChatTBMRouter.routeMessage(

                message,

                memoryContext

            );



            intent =

            window.ChatTBMRouter.detectIntent(

                message

            );



        }


    }


    catch(error){


        console.error(

            "Router Error:",

            error

        );


    }







    // =================================
    // FALLBACK
    // =================================


    if(!response){


        response =

        `🤖 ChatTBM is ready to help.


You asked:

"${message}"`;



    }







    return {


        message,


        intent,


        memoryContext,


        response,


        userId,


        timestamp:

        new Date().toISOString()



    };


}







// =====================================
// STATUS
// =====================================


function getCoreStatus(){


    return {


        version:

        ChatTBM_Core.version,


        status:

        ChatTBM_Core.status


    };


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCore = {


    processMessage,


    getCoreStatus


};







console.log(

"🧠 ChatTBM V8.7 AI Core Loaded"

);
