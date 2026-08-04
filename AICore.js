// =====================================
// ChatTBM V8.2
// AI Core
//
// Upgrade:
// - Memory extraction
// - Memory context loading
// - Skill routing
// - Better reasoning flow
// =====================================



const ChatTBM_Core = {


    version: "8.2",


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
    // MEMORY LEARNING
    // =================================


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.analyzeMemory

    ){



        window.ChatTBMMemory.analyzeMemory(

            message

        );



        console.log(

            "💾 Memory Analysis Complete"

        );


    }







    let memoryContext = "";







    // =================================
    // MEMORY CONTEXT
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
    // SKILL ROUTER
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

            "🎯 Skill Response:",

            response

        );


    }







    if(!response){



        response =

        "🤖 ChatTBM is processing your request.";


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

"🧠 ChatTBM V8.2 AI Core Loaded"

);
