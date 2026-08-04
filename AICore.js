// =====================================
// ChatTBM V8.9
// Personalized AI Core
//
// Upgrade:
// - Memory aware responses
// - Context personalization
// - Skill pipeline improvement
// - Better response metadata
// - Future AI engine ready
// =====================================



const ChatTBM_Core = {


    version: "8.9",


    status: "ready"


};







// =====================================
// BUILD PERSONAL CONTEXT
// =====================================


function personalizeResponse(

    response,

    memoryContext

){


    if(

        !memoryContext

    ){

        return response;

    }



    return {


        text: response,


        memoryUsed: true,


        context: memoryContext


    };


}







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){



    console.log(

        "🧠 ChatTBM V8.9 Processing:",

        message

    );





    const userId = "guest";



    let memoryContext = "";


    let response = null;


    let intent = "unknown";







    // =================================
    // MEMORY
    // =================================


    try{


        if(

            window.ChatTBMMemory &&

            window.ChatTBMMemory.analyzeMemory

        ){


            window.ChatTBMMemory.analyzeMemory(

                message

            );


        }







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
    // ROUTING
    // =================================


    try{


        if(

            window.ChatTBMRouter &&

            window.ChatTBMRouter.routeMessage

        ){


            intent =

            window.ChatTBMRouter.detectIntent(

                message

            );



            response =

            window.ChatTBMRouter.routeMessage(

                message,

                memoryContext

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







    // =================================
    // FINAL RESPONSE PACKAGE
    // =================================


    return {


        message,


        intent,


        response,


        memoryContext,


        personalized:

        memoryContext.length > 0,


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

"🧠 ChatTBM V8.9 Personalized AI Core Loaded"

);
