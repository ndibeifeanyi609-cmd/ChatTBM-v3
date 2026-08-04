// =====================================
// ChatTBM V7.3
// AI Core
//
// Purpose:
// - Process user messages
// - Connect memory
// - Connect skill router
// - Prepare advanced reasoning
// =====================================



const ChatTBM_Core = {


    version: "7.3",


    status: "ready"


};







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){



    let memoryContext = "";





    // Get memory context


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.buildMemoryContext

    ){


        memoryContext =

        window.ChatTBMMemory.buildMemoryContext();


    }







    // Route to skill


    let response = null;



    if(

        window.ChatTBMRouter &&

        window.ChatTBMRouter.routeMessage

    ){



        response =

        window.ChatTBMRouter.routeMessage(

            message

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

"🧠 ChatTBM V7.3 AI Core Loaded"

);
