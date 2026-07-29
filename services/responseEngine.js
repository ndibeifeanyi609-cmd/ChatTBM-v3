// =====================================
// ChatTBM V5.9.2
// Response Intelligence Engine
// Personal Brain Connected
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

    longTermMemory = [],

    brainContext = {}

){


    const text =

    message.toLowerCase().trim();





    // =====================================
    // CONTEXT FOLLOW UP
    // =====================================

    const context =

    handleContextRequest(

        message,

        history

    );



    if(

        context &&

        context.matched

    ){

        return context.response;

    }





    let response = "";





    // =====================================
    // GREETING
    // =====================================

    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ){

        response =

`Hello 👋

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
    // SCRIPT GENERATION
    // =====================================

    else if(

        intent === "script_generation" ||

        text.includes("script") ||

        text.includes("video")

    ){

        response =

`Let's create your script 🎬


Tell me:

1️⃣ Video topic

2️⃣ Duration

3️⃣ Platform

4️⃣ Style


I'll structure the complete script for you.`;

    }





    // =====================================
    // CAPTION GENERATION
    // =====================================

    else if(

        intent === "caption_generation" ||

        text.includes("caption")

    ){

        response =

`Let's create your caption ✍️


Tell me:

• What is the post about?
• Platform
• Tone


I'll create captions that match your audience.`;

    }





    // =====================================
    // IDEA GENERATION
    // =====================================

    else if(

        intent === "idea_generation" ||

        text.includes("idea")

    ){

        response =

`Let's generate content ideas 💡


Tell me:

• Your niche
• Your audience
• Your platform


I'll create ideas designed for growth.`;

    }





    // =====================================
    // DEFAULT RESPONSE
    // =====================================

    else {


        response =

`I understand your request.

I'll help you with that.`;

    }





    // =====================================
    // PERSONAL BRAIN MEMORY
    // =====================================


    if(

        brainContext &&

        brainContext.memoryContext

    ){

        response +=

`\n\n🧠 Personal Brain:

${brainContext.memoryContext}`;

    }





    // =====================================
    // RELATIONSHIP MEMORY
    // =====================================

    if(

        brainContext &&

        brainContext.relationships &&

        brainContext.relationships.length > 0

    ){

        response +=

`\n\n🔗 I understand this connects with your previous work.`;

    }





    // =====================================
    // AI PROFILE PERSONALIZATION
    // =====================================

    if(

        aiContext &&

        aiContext.enhancedPrompt

    ){

        response +=

`\n\n🤖 Response adapted to your preferences.`;

    }





    // =====================================
    // PREVIOUS FACTS
    // =====================================

    if(

        facts &&

        facts.lastMessage

    ){

        response +=

`\n\n📚 Previous discussion:

"${facts.lastMessage}"`;

    }





    return response;


}





module.exports = {


    generateResponse

};
