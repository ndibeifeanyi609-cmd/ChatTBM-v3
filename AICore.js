// =====================================
// ChatTBM V8.3
// AI Core
//
// Upgrade:
// - Memory learning
// - Memory context
// - Context-aware skill routing
// - Better AI pipeline
// =====================================



const ChatTBM_Core = {


    version: "8.3",


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







    // =================================
    // LEARN FROM MESSAGE
    // =================================


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.analyzeMemory

    ){


        window.ChatTBMMemory.analyzeMemory(

            message

        );


        console.log(

            "💾 Memory Updated"

        );


    }







    let memoryContext = "";







    // =================================
    // LOAD MEMORY CONTEXT
    // =================================


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.buildMemoryContext

    ){



        memoryContext =

        window.ChatTBMMemory.buildMemoryContext();



        console.log(

            "🧠 Memory Context:",

            memoryContext

        );


    }







    let response = null;







    // =================================
    // CONTEXT AWARE ROUTING
    // =================================


    if(

        window.ChatTBMRouter &&

        window.ChatTBMRouter.routeMessage

    ){



        response =

        window.ChatTBMRouter.routeMessage(

            message,

            memoryContext

        );



        console.log(

            "🎯 Skill Response:",

            response

        );


    }







    // =================================
    // FALLBACK
    // =================================


    if(!response){



        response =

        "🤖 ChatTBM is ready to help.";


    }







    return {


        message,


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

"🧠 ChatTBM V8.3 Context AI Core Loaded"

);
