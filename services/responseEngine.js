// =====================================
// ChatTBM V6.7.4
// Response Intelligence Engine
//
// Upgrade:
// - Adaptive Response Engine
// - Adaptive Brain Engine
// - Memory Intelligence
// - Creator Personalization
// - Context Intelligence
// =====================================



const {

    handleContextRequest

} = require("./contextEngine");





const AdaptiveResponseEngine =

require("./adaptiveResponseEngine");





const AdaptiveBrainEngine =

require("./adaptiveBrainEngine");





const {

    getImportantMemories

} = require("./creatorMemoryEngine");








// =====================================
// ENGINE INSTANCES
// =====================================


let adaptiveEngine = null;


let adaptiveBrain = null;








// =====================================
// CONNECT INTELLIGENCE ENGINES
// =====================================


function connectAdaptiveEngine(identityEngine){


    adaptiveEngine =

    new AdaptiveResponseEngine(

        identityEngine

    );




    adaptiveBrain =

    new AdaptiveBrainEngine();



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



    let creatorContext = null;


    let brainDecision = null;


    let importantMemories = [];








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
    // MEMORY INTELLIGENCE RETRIEVAL
    // =====================================


    if(

        brainContext.userId

    ){



        importantMemories =

        getImportantMemories(

            brainContext.userId

        );



    }








    // =====================================
    // ADAPTIVE CREATOR CONTEXT
    // =====================================


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
    // ADAPTIVE BRAIN DECISION
    // =====================================


    if(

        adaptiveBrain &&

        brainContext.profile

    ){



        brainDecision =

        adaptiveBrain.decide(

            brainContext.profile,

            message

        );



    }

// =====================================
// RESPONSE INTELLIGENCE
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

Nobody sees the preparation behind the success.


🎭 Story:

Turn your experience, challenges and lessons into a story people can connect with.


🚀 Ending:

Your journey is still being created.

Keep building.`;

        break;








    case "caption_generation":


        response =

`🔥 Caption:

They see the final moment.

They don't see the discipline behind it.

Every challenge shaped the creator.
Every lesson built the journey.

The story continues. 🚀`;

        break;








    case "idea_generation":


        response =

`🔥 Viral Content Ideas:


1. The moment everything changed

2. The struggle behind the result

3. My creator journey

4. What nobody knows about me

5. Lessons from my experience


Choose one and I'll develop it.`;

        break;








    case "marketing":


        response =

`📢 Marketing Framework:


Problem:

Show the audience the challenge.


Solution:

Explain the value.


Action:

Guide them to the next step.`;

        break;








    case "creator_strategy":


        response =

`🚀 Creator Strategy:


1. Build a recognizable identity.

2. Create content consistently.

3. Understand audience behavior.

4. Learn from results.

5. Improve your brand.`;

        break;








    default:


        response =

`I understand.

I can help transform your idea into:

🎬 Scripts
✍️ Captions
🔥 Viral Ideas
📢 Marketing Content

Tell me what you want to create.`;



}









// =====================================
// MEMORY INTELLIGENCE INFLUENCE
// =====================================


if(

    importantMemories.length > 0

){


    const memory =

    importantMemories[0];



    response +=


`

🧠 Creator Memory Applied:

${memory.content}

`;



}









// =====================================
// ADAPTIVE BRAIN INFLUENCE
// =====================================


if(brainDecision){


    response +=


`

✨ Creator Style:

${brainDecision.creatorStyle}

Tone:

${brainDecision.tone}

`;



}








// =====================================
// ADAPTIVE RESPONSE STATUS
// =====================================


if(creatorContext){


    response +=


`

⚡ Adaptive Creator Personalization Active`;



}

// =====================================
// RETURN RESPONSE
// =====================================


return response;


}









// =====================================
// MODULE EXPORT
// =====================================


module.exports = {


    generateResponse,


    connectAdaptiveEngine


};
