// =====================================
// ChatTBM V5.0
// Response Engine
// Generates AI responses
// =====================================


function generateResponse(intent, message, memory = {}) {

    let response = "";


    switch(intent) {


        case "content_creation":

            response =
            "I can help you create viral content. " +
            "Tell me your platform (Instagram, Facebook, TikTok, YouTube) " +
            "and your topic.";

            break;



        case "script_generation":

            response =
            "I can create a video script for you. " +
            "Tell me the video topic, style, and length.";

            break;



        case "marketing":

            response =
            "I can help you create adverts, sales ideas, " +
            "target audiences, and marketing strategies.";

            break;



        case "idea_generation":

            response =
            "I can generate creative ideas. " +
            "Tell me what type of content or project you need ideas for.";

            break;



        case "general_question":

            response =
            "I am ChatTBM, your AI content assistant. " +
            "Ask me anything and I will help you.";

            break;



        default:

            response =
            "I understand. How can I help you create better content today?";

    }


    // Add memory personalization

    if (memory.contentStyle) {

        response += 
        "\n\nI will also consider your preferred style: " 
        + memory.contentStyle;

    }


    return response;

}



module.exports = {
    generateResponse
};
