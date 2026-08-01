// =====================================
// ChatTBM V6.7.1
// Response Intelligence Engine
//
// Features:
// - Creator Content Generation
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

    String(message || "")

    .toLowerCase();





    let response = "";






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
    // CONTEXT MEMORY
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

I can help you create:

🎬 Video scripts
✍️ Captions
🔥 Viral ideas
📢 Marketing content

What are we creating today?`;



    }







    // =====================================
    // SCRIPT GENERATION
    // =====================================


    else if(

        intent === "script_generation"

    ){


        response =


`🎬 Video Script


🔥 HOOK:

Nobody sees the beginning. They only see the results.


🎭 BODY:

Show the struggle, the failures, the lessons, and the process behind the growth.

Let people see the moments when you had to keep going even when nobody was watching.


🚀 ENDING:

The journey is still being written.

Follow the journey and watch the transformation happen.



`;



    }







    // =====================================
    // CAPTION GENERATION
    // =====================================


    else if(

        intent === "caption_generation"

    ){


        response =


`🔥 Caption:

Nobody saw the days I struggled.

They only see the moment I succeed.

Every step, every failure, every lesson built this journey.

The process is the story. 🚀`;



    }








    // =====================================
    // IDEA GENERATION
    // =====================================


    else if(

        intent === "idea_generation"

    ){


        response =


`🔥 Viral Content Ideas:


1. Nobody believed in me story

2. Before vs After transformation

3. Behind the scenes struggle

4. Failed attempt that became success

5. My journey nobody saw



Choose one and I'll build the full script.`;



    }








    // =====================================
    // MARKETING
    // =====================================


    else if(

        intent === "marketing"

    ){


        response =


`📢 Marketing Script:


Problem:

Show the audience a challenge they face.


Solution:

Present your product or service as the answer.


Action:

Tell them the next step to take.`;



    }








    // =====================================
    // CREATOR STRATEGY
    // =====================================


    else if(

        intent === "creator_strategy"

    ){


        response =


`🚀 Creator Growth Strategy:


1. Build a recognizable style.

2. Create consistently.

3. Study audience reactions.

4. Improve every video.

5. Turn your journey into your brand.`;



    }








    // =====================================
    // DEFAULT
    // =====================================


    else {


        response =


`I understand.

I can help you turn this into:

🎬 A video script
✍️ A caption
🔥 Viral content idea
📢 Marketing content

Tell me what you want to create.`;



    }









    // =====================================
    // ADD PROFILE
    // =====================================


    if(profilePrompt){


        response +=

        `\n\n🧠 Creator Profile:\n${profilePrompt}`;


    }





    return response;


}







module.exports = {


    generateResponse


};
