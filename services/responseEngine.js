// =====================================
// ChatTBM V5.4
// Smart Response Engine
// Part 3
// Context Integration
// =====================================


const {
    handleContextRequest
} = require("./contextEngine");



// =====================================
// MAIN RESPONSE GENERATOR
// =====================================

function generateResponse(

    intent,

    message,

    memory = {},

    history = [],

    facts = {},

    timeline = []

){


    let response = "";



    // =====================================
    // CHECK CONTEXT FIRST
    // =====================================

    const contextResult =
    handleContextRequest(

        message,

        history

    );



    if(
        contextResult.matched
    ){

        return contextResult.response;

    }



    const text =
    message.trim().toLowerCase();



    // =====================================
    // GREETING
    // =====================================

    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ){

        return `
Hello 👋

Welcome to ChatTBM.

I'm your AI Content Assistant.

I can help you with:

✍️ Captions
🎬 Video Scripts
💡 Content Ideas
📢 Marketing
📅 Content Planning

What would you like to create today?
`;

    }




    // =====================================
    // INTENT RESPONSE
    // =====================================

    switch(intent){


        case "content_creation":

            response =
            "I can help you create content. Tell me your platform and topic.";

            break;



        case "script_generation":

            response =
            "I can create a video script. Tell me the topic, style and length.";

            break;



        case "marketing":

            response =
            "I can help create adverts, promotions and marketing strategies.";

            break;



        case "idea_generation":

            response =
            "I can generate creative ideas. Tell me what you want ideas for.";

            break;



        case "general_question":

            response =
            "I'm ChatTBM, your AI Content Assistant. How can I help you?";

            break;



        default:

            response =
            "I understand. Tell me more details and I'll help you.";

    }




    // =====================================
    // MEMORY PERSONALIZATION
    // =====================================


    if(memory.contentStyle){

        response +=

        "\n\n🎨 Style preference: " +
        memory.contentStyle;

    }



    if(memory.platform){

        response +=

        "\n📱 Platform: " +
        memory.platform;

    }



    if(memory.tone){

        response +=

        "\n🎯 Tone: " +
        memory.tone;

    }




    // =====================================
    // FACT AWARENESS
    // =====================================


    if(facts.lastMessage){

        response +=

        "\n\n🧠 I remember our previous discussion.";

    }



    return response;


}




module.exports = {

    generateResponse

};
