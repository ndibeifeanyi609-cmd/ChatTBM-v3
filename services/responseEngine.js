// =====================================
// ChatTBM V6.7.2
// Response Intelligence Engine
//
// Upgrade:
// - Adaptive Response Engine Connected
// - Creator Personalization
// - Memory Awareness
// - Profile Adaptation
// - Smart Responses
// =====================================


const {

    handleContextRequest

} = require("./contextEngine");



const {

    createProfilePrompt

} = require("./profileContextEngine");





const AdaptiveResponseEngine =

require("./adaptiveResponseEngine");







// =====================================
// ADAPTIVE ENGINE SETUP
// =====================================


let adaptiveEngine = null;



function connectAdaptiveEngine(identityEngine){

    adaptiveEngine =

    new AdaptiveResponseEngine(

        identityEngine

    );

}







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


    let response = "";



    const text =

    String(message || "")

    .toLowerCase();







    // =====================================
    // ADAPTIVE PERSONALIZATION
    // =====================================


    let adaptiveContext = null;



    if(

        adaptiveEngine &&

        brainContext.userId

    ){


        adaptiveContext =

        adaptiveEngine.personalize(

            brainContext.userId,

            message

        );


    }









    // =====================================
    // PROFILE CONTEXT
    // =====================================


    let profilePrompt = "";



    if(

        brainContext.userId

    ){


        profilePrompt =

        createProfilePrompt(

            brainContext.userId

        );


    }









    // =====================================
    // MEMORY CONTEXT
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









    // =====================================
    // GREETING
    // =====================================


    if(intent === "greeting"){


response =

`Hello 👋

I'm ChatTBM, your AI Content Assistant.

I help creators build:

🎬 Scripts
✍️ Captions
🔥 Viral ideas
📢 Marketing content

What are we creating today?`;



    }









    // =====================================
    // SCRIPT GENERATION
    // =====================================


    else if(intent === "script_generation"){


response =

`🎬 Video Script


🔥 Hook:

Everyone sees the result.

Nobody sees the struggle behind it.


🎭 Story:

Show the challenges, failures, lessons and moments that built your journey.


🚀 Ending:

Your story is still being created.

Keep building. Keep improving.`;



    }









    // =====================================
    // CAPTION GENERATION
    // =====================================


    else if(intent === "caption_generation"){


response =

`🔥 Caption:

They see the achievement.

They don't see the sacrifice.

Every failure was training.
Every setback was preparation.

The journey created the person. 🚀`;



    }









    // =====================================
    // IDEA GENERATION
    // =====================================


    else if(intent === "idea_generation"){


response =

`🔥 Viral Content Ideas:


1. The struggle nobody saw

2. My biggest mistake

3. Behind the scenes reality

4. Transformation journey

5. Lessons from failure


Choose one and I'll create the full content.`;



    }









    // =====================================
    // MARKETING
    // =====================================


    else if(intent === "marketing"){


response =

`📢 Marketing Structure:


Problem:

Show the audience their challenge.


Solution:

Explain how your product helps.


Action:

Give them a reason to respond now.`;



    }









    // =====================================
    // CREATOR STRATEGY
    // =====================================


    else if(intent === "creator_strategy"){


response =

`🚀 Creator Strategy:


1. Create a recognizable identity.

2. Build a consistent content style.

3. Understand your audience.

4. Improve using feedback.

5. Turn content into a brand.`;



    }









    // =====================================
    // DEFAULT
    // =====================================


    else {


response =

`I understand.

I can help transform your idea into:

🎬 Video Script
✍️ Caption
🔥 Viral Idea
📢 Marketing Content

Tell me what you want to create.`;



    }









    // =====================================
    // ADD ADAPTIVE CONTEXT
    // =====================================


    if(adaptiveContext){


        response +=


`\n\n🧠 Adaptive Creator Context:\n\n${adaptiveContext.enhancedPrompt}`;

    }









    // =====================================
    // ADD PROFILE MEMORY
    // =====================================


    if(profilePrompt){


        response +=


`\n\n👤 Creator Profile:\n${profilePrompt}`;

    }





    return response;


}







module.exports = {


    generateResponse,

    connectAdaptiveEngine


};
