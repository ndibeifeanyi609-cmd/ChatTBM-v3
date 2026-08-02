// =====================================
// ChatTBM V6.7.2
// Response Intelligence Engine
//
// Systems:
// - Adaptive Response Engine
// - Creator Personalization
// - Memory Awareness
// - Context Intelligence
// - Smart Creator Responses
// =====================================


const {

    handleContextRequest

} = require("./contextEngine");



const AdaptiveResponseEngine =

require("./adaptiveResponseEngine");





let adaptiveEngine = null;





// =====================================
// CONNECT ADAPTIVE ENGINE
// =====================================


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
    // ADAPTIVE CONTEXT
    // =====================================


    let creatorContext = null;



    if(

        adaptiveEngine &&

        brainContext.userId

    ){


        creatorContext =

        adaptiveEngine.personalize(

            brainContext.userId,

            message

        );


    }







    // =====================================
    // RESPONSE TYPES
    // =====================================


    switch(intent){


        case "greeting":


            response =

`Hello 👋

I'm ChatTBM, your AI Content Assistant.

I can help you create:

🎬 Video Scripts
✍️ Captions
🔥 Viral Content Ideas
📢 Marketing Content

What are we creating today?`;

            break;






        case "script_generation":


            response =

`🎬 Video Script


🔥 Hook:

Nobody sees the struggle behind the success.


🎭 Story:

Show the journey, challenges, failures and lessons that created the transformation.


🚀 Ending:

The story is still being written.

Keep building. Keep improving.`;

            break;






        case "caption_generation":


            response =

`🔥 Caption:

They see the result.

They don't see the battles behind it.

Every failure created strength.
Every setback created growth.

The journey is the story. 🚀`;

            break;






        case "idea_generation":


            response =

`🔥 Viral Content Ideas:


1. The struggle nobody saw

2. My biggest lesson

3. Behind the scenes

4. Transformation story

5. The journey nobody knows


Choose one and I'll build it.`;

            break;






        case "marketing":


            response =

`📢 Marketing Framework:


Problem:

Identify the audience pain.


Solution:

Show how your product helps.


Action:

Give people the next step.`;

            break;






        case "creator_strategy":


            response =

`🚀 Creator Strategy:


1. Build a unique identity.

2. Create consistently.

3. Understand your audience.

4. Improve through feedback.

5. Turn content into a brand.`;

            break;






        default:


            response =

`I understand.

I can help you create:

🎬 Scripts
✍️ Captions
🔥 Viral Ideas
📢 Marketing Content

Tell me what you want to build.`;



    }







    // =====================================
    // INTERNAL ADAPTIVE BOOST
    // =====================================


    if(creatorContext){


        response +=

`\n\n✨ Personalized for your creator style.`;

    }






    return response;


}







module.exports = {


    generateResponse,

    connectAdaptiveEngine


};
