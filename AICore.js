// =====================================
// ChatTBM V8.1
// AI Core
//
// Upgrade:
// - Memory Context
// - Skill Routing
// - Response Processing
// - Conversation Learning
// =====================================



const ChatTBM_Core = {


    version: "8.1",


    status: "ready"


};







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){



    console.log(

        "🧠 AI Core Processing:",

        message

    );







    const userId = "guest";



    let memoryContext = "";







    // =================================
    // LOAD MEMORY
    // =================================


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.buildMemoryContext

    ){


        memoryContext =

        window.ChatTBMMemory.buildMemoryContext(

            userId

        );


        console.log(

            "🧠 Memory Context:",

            memoryContext

        );


    }







    let response = null;







    // =================================
    // SKILL ROUTING
    // =================================


    if(

        window.ChatTBMRouter &&

        window.ChatTBMRouter.routeMessage

    ){



        response =

        window.ChatTBMRouter.routeMessage(

            message

        );



        console.log(

            "🎯 Routed Response:",

            response

        );


    }







    // =================================
    // FALLBACK
    // =================================


    if(!response){


        response =

        "🤖 ChatTBM is processing your request.";


    }







    // =================================
    // SAVE MEMORY
    // =================================


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.addMemoryNote

    ){


        window.ChatTBMMemory.addMemoryNote(

            userId,

            message

        );


        console.log(

            "💾 Memory Saved"

        );


    }







    return {


        message,


        memoryContext,


        response,


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

"🧠 ChatTBM V8.1 AI Core Loaded"

);
