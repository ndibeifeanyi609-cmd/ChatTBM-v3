// =====================================
// ChatTBM V6.2
// Response Intelligence Engine
// Personal Brain Edition
//
// Features:
// - Context Understanding
// - Creator Profile Awareness
// - Memory Support
// - Personality Adaptation
// =====================================



const {

    handleContextRequest

} = require("./contextEngine");



const {

    createProfilePrompt

} = require("./profileContextEngine");




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
    // PROFILE CONTEXT
    // =====================================

    let profilePrompt = "";



    if(

        brainContext &&

        brainContext.userId

    ){


        profilePrompt =

        createProfilePrompt(

            brainContext.userId

        );


    }




    // =====================================
    // FOLLOW UP CONTEXT
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
// GREETING SYSTEM
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

`Let's create your video script 🎬


Tell me:

1️⃣ Topic

2️⃣ Duration

3️⃣ Platform

4️⃣ Style


I'll structure a complete script for you.`;

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

• What is the content about?
• Which platform?
• What tone do you want?


I'll create a caption that matches your audience.`;

}





// =====================================
// CONTENT IDEA GENERATION
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
// ADVERT CREATION
// =====================================


else if(

    text.includes("advert") ||

    text.includes("promotion") ||

    text.includes("marketing")

){


    response =

`Let's create your advert 📢


Tell me:

• Product/service
• Target audience
• Platform
• Style


I'll help create a strong marketing message.`;

}





// =====================================
// DEFAULT INTELLIGENT RESPONSE
// =====================================


else {


    response =

`I understand your request.

I'll help you create something valuable.

Tell me more details so I can give you the best result.`;

}

// =====================================
// ADD CREATOR PROFILE PERSONALIZATION
// =====================================


if(profilePrompt){


    response +=


    `\n\n🧠 Creator Profile Applied:\n${profilePrompt}`;


}





// =====================================
// MEMORY CONTEXT
// =====================================


if(

    brainContext &&

    brainContext.memoryContext

){


    response +=


    `\n\n🗂️ Memory Context:\n${brainContext.memoryContext}`;


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


    `\n\n🔗 Connected with your previous work.`;


}





// =====================================
// AI PREFERENCE ADAPTATION
// =====================================


if(

    aiContext &&

    aiContext.enhancedPrompt

){


    response +=


    `\n\n🤖 Response adjusted to your preferences.`;


}





// =====================================
// PREVIOUS DISCUSSION CONTEXT
// =====================================


if(

    facts &&

    facts.lastMessage

){


    response +=


    `\n\n📚 Previous discussion:\n"${facts.lastMessage}"`;


}





// =====================================
// FINAL RESPONSE
// =====================================


return response;


}





// =====================================
// EXPORT
// =====================================


module.exports = {


    generateResponse


};
