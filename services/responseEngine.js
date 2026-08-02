// =====================================
// ChatTBM V7.0
// Response Intelligence Engine
//
// Connected:
// - Adaptive Response Engine
// - Adaptive Brain Engine
// - Intelligence Fusion
// - Memory Intelligence
// - Relationship Intelligence
// - Creator Brain
// - Growth Intelligence
// - Strategy Intelligence
// =====================================



const {

    handleContextRequest

} = require("./contextEngine");



const AdaptiveResponseEngine =

require("./adaptiveResponseEngine");



const AdaptiveBrainEngine =

require("./adaptiveBrainEngine");



const MemoryRetrievalEngine =

require("./memoryRetrievalEngine");



const RelationshipIntelligenceEngine =

require("./relationshipIntelligenceEngine");



const IntelligenceFusionEngine =

require("./intelligenceFusionEngine");









let adaptiveEngine = null;

let adaptiveBrain = null;

let memoryRetriever = null;

let relationshipEngine = null;

let intelligenceFusion = null;









function connectAdaptiveEngine(identityEngine){


    adaptiveEngine =

    new AdaptiveResponseEngine(

        identityEngine

    );


    adaptiveBrain =

    new AdaptiveBrainEngine();


    memoryRetriever =

    new MemoryRetrievalEngine();


    relationshipEngine =

    new RelationshipIntelligenceEngine();


    intelligenceFusion =

    new IntelligenceFusionEngine();


}









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



let memoryContext = null;

let audienceContext = null;

let creatorContext = null;

let brainDecision = null;

let fusedContext = null;









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
// MEMORY RETRIEVAL
// =====================================


if(

    memoryRetriever &&

    brainContext.userId

){


    memoryContext =

    memoryRetriever.buildContext(

        brainContext.userId,

        message

    );


}









// =====================================
// AUDIENCE INTELLIGENCE
// =====================================


if(

    relationshipEngine &&

    brainContext.userId

){


    audienceContext =

    relationshipEngine.getRelationship(

        brainContext.userId

    );


}









// =====================================
// ADAPTIVE PERSONALIZATION
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
// CREATOR DECISION
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
// INTELLIGENCE FUSION
// =====================================


if(

    intelligenceFusion &&

    brainContext.userId

){


fusedContext =

intelligenceFusion.fuse(

brainContext.userId,

{


identity:

brainContext.profile?.identity || {},


memory:

memoryContext || {},


audience:

audienceContext || {},


personalization:

creatorContext || {},


decision:

brainDecision || {},


strategy:

brainContext.strategy || {},


growth:

brainContext.growth || {}



}

);



}









// =====================================
// CORE RESPONSE
// =====================================


switch(intent){



case "greeting":


response =

`Hello 👋

I'm ChatTBM, your AI Content Assistant.

I help creators build:

🎬 Scripts
✍️ Captions
🔥 Viral Ideas
📢 Marketing Content

Let's create something powerful today.`;


break;









case "script_generation":


response =

`🎬 Creator Script


🔥 Hook:

Nobody saw this journey coming.


🎭 Story:

Show the struggle, the process and the transformation.


🚀 Ending:

Make the audience remember your story.`;


break;









case "caption_generation":


response =

`🔥 Caption:

They see the result.

They don't see the discipline behind it.

Every challenge created the person you see today. 🚀`;


break;









case "idea_generation":


response =

`🔥 Content Ideas:


1. The story nobody knows

2. Behind the scenes reality

3. My biggest challenge

4. The transformation journey

5. What I learned creating content`;


break;









case "marketing":


response =

`📢 Marketing Strategy:


Problem → Solution → Trust → Action


Show people why your brand matters.`;


break;









case "creator_strategy":


response =

`🚀 Creator Growth Strategy:


1. Build recognizable content.

2. Study what performs.

3. Improve your hooks.

4. Understand your audience.

5. Create consistently.`;


break;









default:


response =

`I can help you create:

🎬 Scripts

✍️ Captions

🔥 Viral Content Ideas

📢 Marketing Strategies

Tell me your idea.`;


}









// =====================================
// INTELLIGENCE OUTPUT
// =====================================


if(memoryContext?.count > 0){


response +=

`

🧠 Memory Applied:

${memoryContext.memoryContext.join(", ")}

`;

}



if(audienceContext){


response +=

`

👥 Audience Intelligence Active

`;

}



if(brainDecision){


response +=

`

✨ Creator Style:

${brainDecision.creatorStyle}


🎙️ Tone:

${brainDecision.tone}

`;

}



if(fusedContext){


response +=

`

🧠 Creator Brain V7.0 Active:

✓ Identity

✓ Memory

✓ Voice

✓ Growth

✓ Strategy

✓ Adaptive Intelligence

`;

}



return response;


}









module.exports = {


generateResponse,


connectAdaptiveEngine


};
