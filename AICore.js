// =====================================
// ChatTBM V7.4
// AI Core
//
// Purpose:
// - Process user messages
// - Connect memory
// - Connect skill router
// - Manage AI reasoning flow
// =====================================



const ChatTBM_Core = {


    version: "7.4",


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





    let memoryContext = "";





    // Memory connection


    if(

        window.ChatTBMMemory &&

        window.ChatTBMMemory.buildMemoryContext

    ){


        memoryContext =

        window.ChatTBMMemory.buildMemoryContext(

            "guest"

        );


    }







    let response = null;





    // Skill Router connection


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

    else{


        console.log(

            "⚠️ Skill Router not available"

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

"🧠 ChatTBM V7.4 AI Core Loaded"

);
