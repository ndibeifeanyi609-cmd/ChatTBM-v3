// =====================================
// ChatTBM V9.8
// AI Core Creator Profile Bridge
//
// Upgrade:
// - Memory context
// - Creator intelligence
// - Creator memory learning
// - Creator profile extraction
// - Creator profile passing
// - Context-aware routing
// - Personalized pipeline
// - Skill compatibility
// =====================================



const ChatTBM_Core = {


    version: "9.8",


    status: "ready"


};







// =====================================
// PROCESS MESSAGE
// =====================================


async function processMessage(message){



    console.log(

        "🧠 ChatTBM V9.8 Processing:",

        message

    );





    const userId = "guest";



    let memoryContext = "";


    let creatorContext = null;


    let creatorProfile = null;


    let response = null;


    let intent = "unknown";







    // =================================
    // CREATOR PROFILE LEARNING
    // =================================


    try{


        if(

            window.ChatTBMCreatorProfile &&

            window.ChatTBMCreatorProfile.extractCreatorInformation

        ){


            window.ChatTBMCreatorProfile.extractCreatorInformation(

                message

            );


            console.log(

                "🎯 Creator information extracted"

            );


        }


    }


    catch(error){


        console.error(

            "Creator Extraction Error:",

            error

        );


    }







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
    // BUILD CREATOR PROFILE
    // =================================


    try{


        if(

            window.ChatTBMCreatorProfile &&

            window.ChatTBMCreatorProfile.buildCreatorProfile

        ){


            creatorProfile =

            window.ChatTBMCreatorProfile.buildCreatorProfile();



            console.log(

                "🎯 Creator Profile:",

                creatorProfile

            );


        }


    }


    catch(error){


        console.error(

            "Creator Profile Error:",

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

                "🎬 Creator Context:",

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

                creatorContext,

                creatorProfile

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


        creatorProfile,


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

"🧠 ChatTBM V9.8 AI Core Creator Profile Bridge Loaded"

);
