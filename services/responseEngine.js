// =====================================
// ChatTBM V5.9.2
// Response Intelligence Engine
// Memory + Context + Personality
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

    timeline = [],

    aiContext = {},

    longTermMemory = []

){


    const text =

    message.toLowerCase().trim();



    // =====================================
    // CONTEXT MEMORY CHECK
    // =====================================

    const context =

    handleContextRequest(

        message,

        history

    );


    if(context && context.matched){

        return context.response;

    }





    // =====================================
    // GREETING
    // =====================================

    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ){

        return `Hello 👋

I'm ChatTBM, your AI Content Assistant.

I can help you create:

🎬 Video scripts
✍️ Captions
💡 Viral ideas
📢 Advert content
📅 Content plans

What are we creating today?`;

    }





    // =====================================
    // SCRIPT CREATION
    // =====================================

    if(

        intent === "script_generation" ||

        text.includes("script") ||

        text.includes("create a video")

    ){


        return `Let's create your script 🎬


Tell me:

1️⃣ Video topic

2️⃣ Duration

3️⃣ Platform

4️⃣ Style

Example:

"Create a 60 second funny Facebook video about Nigerian village life."


I'll structure the complete script for you.`;

    }





    // =====================================
    // CAPTION CREATION
    // =====================================

    if(

        intent === "caption_generation" ||

        text.includes("caption")

    ){


        return `Let's create your caption ✍️


Tell me:

• What is the post about?
• Platform (Facebook, Instagram, TikTok)
• Tone (funny, serious, motivational)


I'll create captions that match your audience.`;

    }





    // =====================================
    // CONTENT IDEAS
    // =====================================

    if(

        intent === "idea_generation" ||

        text.includes("idea")

    ){


        return `Let's generate content ideas 💡


Tell me:

• Your niche
• Your audience
• Your platform


I'll create ideas designed for growth.`;

    }





    // =====================================
    // MEMORY PERSONALIZATION
    // =====================================

    let response =

    `I understand your request.

I'll help you with that.`;




    if(facts && facts.lastMessage){


        response +=

        `\n\n🧠 I remember we were previously discussing:

"${facts.lastMessage}"`;

    }





    if(longTermMemory.length > 0){


        response +=

        `\n\n📚 I found ${longTermMemory.length} saved memory items that can help personalize this response.`;

    }





    if(aiContext && aiContext.context){


        response +=

        `\n\n🤖 I'm adapting this response to your preferences.`;

    }





    return response;


}





module.exports = {


    generateResponse

};
