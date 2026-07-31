// =====================================
// ChatTBM V6.1
// Response Intelligence Engine
// Learning Brain Connected
// Memory + Context + Personality
// =====================================


const {

    handleContextRequest

} = require("./contextEngine");



const {

    buildLearningContext

} = require("./learningEngine");





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

    brainContext = {},

    userId = "guest"

){


    const text =

    message.toLowerCase().trim();





    // =====================================
    // LEARNING BRAIN
    // =====================================

    const learningContext =

    buildLearningContext(

        userId

    );

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


I'll structure it using your preferred style.`;

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


I'll create a caption matching your content style.`;

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


I'll create ideas based on your goals.`;

    }





// =====================================
// DEFAULT RESPONSE
// =====================================

    else {


        response =

`I understand your request.

I'll help you create the best response possible.`;

    }

// =====================================
// APPLY LEARNED PREFERENCES
// =====================================

    if(

        learningContext

    ){

        response +=

`\n\n🧠 Learned Preferences:

${learningContext}`;

    }





// =====================================
// MEMORY BRAIN CONTEXT
// =====================================

    if(

        brainContext &&

        brainContext.memoryContext

    ){

        response +=

`\n\n📚 Memory Context:

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

`\n\n🔗 Connected with your previous conversations.`;

    }





// =====================================
// AI PERSONALITY CONTEXT
// =====================================

    if(

        aiContext &&

        aiContext.enhancedPrompt

    ){

        response +=

`\n\n🤖 Response adapted to your AI profile.`;

    }





    return response;


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    generateResponse


};
