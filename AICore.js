// =====================================
// ChatTBM V9.1
// AI Core
//
// Upgrade:
// - Memory context
// - Creator intelligence
// - Creator memory learning
// - Context-aware routing
// - Personalized pipeline
// - Skill compatibility
// =====================================



const ChatTBM_Core = {


    version: "9.1",


    status: "ready"


};







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){



    console.log(

        "🧠 ChatTBM V9.1 Processing:",

        message

    );





    const userId = "guest";



    let memoryContext = "";


    let creatorContext = null;


    let response = null;


    let intent = "unknown";







    // =================================
    // MEMORY SYSTEM
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
    // CREATOR INTELLIGENCE
    // =================================


    try{


        if(

            window.ChatTBMCreatorIntelligence &&

            window.ChatTBMCreatorIntelligence.analyzeCreatorContext

        ){


            creatorContext =

            window.ChatTBMCreatorIntelligence.analyzeCreatorContext(

                message,

                memoryContext

            );



            console.log(

                "🎯 Creator Context:",

                creatorContext

            );


        }


    }


    catch(error){


        console.error(

            "Creator Intelligence Error:",

            error

        );


    }







    // =================================
    // CREATOR MEMORY LEARNING
    //
    // V9.6 CONNECTION
    // =================================


    try{


        if(

            window.ChatTBMMemory &&

            window.ChatTBMMemory.learnCreatorContext

        ){


            window.ChatTBMMemory.learnCreatorContext(

                creatorContext

            );


            console.log(

                "🧠 Creator Memory Updated"

            );


        }


    }


    catch(error){


        console.error(

            "Creator Memory Learning Error:",

            error

        );


    }







    // =================================
    // SKILL ROUTER
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

                memoryContext,

                creatorContext

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


        response,


        memoryContext,


        creatorContext,


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

"🧠 ChatTBM V9.1 AI Core Creator Memory Bridge Loaded"

);
