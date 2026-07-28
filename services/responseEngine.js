// =====================================
// ChatTBM V5.1
// Response Engine
// Memory Powered Responses
// =====================================



function generateResponse(
    intent,
    message,
    memory = {},
    history = []
){


    let response = "";




    switch(intent){



        case "content_creation":

            response =
            "I can help you create viral content. " +
            "Tell me your platform and topic, " +
            "and I will build an idea for you.";

            break;





        case "script_generation":

            response =
            "I can create a video script for you. " +
            "Tell me the topic, style, and video length.";

            break;





        case "marketing":

            response =
            "I can help you create adverts, " +
            "target audiences, and marketing strategies.";

            break;





        case "idea_generation":

            response =
            "I can generate content ideas based on your niche. " +
            "Tell me what you want to create.";

            break;





        case "general_question":

            response =
            "I am ChatTBM, your AI Content Assistant. " +
            "I help creators with ideas, scripts, captions, and marketing.";

            break;





        default:

            response =
            "I understand. Tell me what you want to create and I will help.";

    }






    // =====================================
    // MEMORY PERSONALIZATION
    // =====================================


    if(
        memory.profile
    ){


        if(
            memory.profile.contentStyle
        ){

            response +=

            "\n\nI remember your style preference: " +

            memory.profile.contentStyle;


        }




        if(
            memory.profile.platform
        ){

            response +=

            "\nI will tailor this for " +

            memory.profile.platform;


        }


    }





    return response;


}





module.exports = {

    generateResponse

};
