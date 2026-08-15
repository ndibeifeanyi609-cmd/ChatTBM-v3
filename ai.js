// =====================================
// ChatTBM V7.4
// AI Gateway
//
// Connected:
// - Frontend
// - AI Core
// - Skill Router
// - AI Providers (Future)
// =====================================



const ChatTBM_AI = {


    provider: "demo",


    connected: false,


    model: "ChatTBM AI V7.4",


    apiEndpoint: "",


    apiKey: ""


};







// =====================================
// CHANGE PROVIDER
// =====================================


function setAIProvider(provider){


    ChatTBM_AI.provider = provider;


}







// =====================================
// CONNECT AI
// =====================================


async function connectAI(){


    if(

        ChatTBM_AI.provider === "demo"

    ){


        ChatTBM_AI.connected = true;


        return true;


    }



    ChatTBM_AI.connected = false;


    return false;


}







// =====================================
// MAIN CHAT FUNCTION
// =====================================


async function askChatTBM(message){



    // Send message to AI Core


    if(

        window.ChatTBMCore &&

        window.ChatTBMCore.processMessage

    ){



        const result =

        await window.ChatTBMCore.processMessage(

            message

        );





        console.log(

            "🧠 Core Result:",

            result

        );





        // Return skill response if available


        if(

            result.response

        ){


            return result.response;


        }



    }






    return defaultResponse(message);


}







// =====================================
// FALLBACK RESPONSE
// =====================================


function defaultResponse(message){


    return `🤖 ChatTBM ${ChatTBM_AI.model}


I received:

"${message}"


I am ready to help you.`;

}







// =====================================
// STATUS
// =====================================


function getAIStatus(){


    return {


        provider:

        ChatTBM_AI.provider,


        connected:

        ChatTBM_AI.connected,


        model:

        ChatTBM_AI.model


    };


}







// =====================================
// FUTURE FEATURES
// =====================================


async function generateImage(prompt){


    return {


        success:false,


        message:"Image generation coming soon."


    };


}







async function generateVideo(prompt){


    return {


        success:false,


        message:"Video generation coming soon."


    };


}







// =====================================
// RESET
// =====================================


function resetAI(){


    ChatTBM_AI.provider = "demo";


    ChatTBM_AI.connected = false;


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBM_AI = {


    askChatTBM,


    connectAI,


    setAIProvider,


    getAIStatus,


    generateImage,


    generateVideo


};







connectAI();



console.log(

"✅ ChatTBM V7.4 AI Gateway Loaded"

);
