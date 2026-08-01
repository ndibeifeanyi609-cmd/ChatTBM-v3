// =====================================
// ChatTBM V6.7
// Creator Strategy Engine
//
// Connected:
// - Creator Identity
// - Brand Voice
// - Creator Memory
// =====================================


const {

    getCreatorIdentity

} = require("./creatorIdentityEngine");


const {

    getBrandVoice

} = require("./brandVoiceEngine");


const {

    getCreatorMemory

} = require("./creatorMemoryEngine");






// =====================================
// STRATEGY GENERATOR
// =====================================

function generateCreatorStrategy(userId){


    const identity =

    getCreatorIdentity(userId);



    const voice =

    getBrandVoice(userId);



    const memory =

    getCreatorMemory(userId);





    return {


        creatorProfile:{


            niche:

            identity.niche || "General Creator",


            style:

            identity.contentStyle || "Natural",


            personality:

            identity.personality || "Balanced",


            audience:

            identity.audience || "General Audience"


        },



        brandVoice:{


            tone:

            voice.tone || "Natural",


            style:

            voice.style || "Clear",


            energy:

            voice.energy || "Medium"


        },



        memory:{


            preferences:

            memory.preferences,


            topics:

            memory.favoriteTopics,


            lessons:

            memory.contentLessons


        }


    };


}






// =====================================
// CONTENT IDEAS
// =====================================

function generateContentIdeas(userId){


    const strategy =

    generateCreatorStrategy(userId);



    const ideas=[];





    if(

        strategy.creatorProfile.niche

        ===

        "Action Content"

    ){

        ideas.push(

            "Create a cinematic action story with a powerful ending."

        );


    }





    if(

        strategy.brandVoice.tone

        ===

        "Motivational"

    ){

        ideas.push(

            "Create a struggle-to-success journey."

        );


    }





    if(

        strategy.brandVoice.tone

        ===

        "Funny"

    ){

        ideas.push(

            "Create a realistic comedy challenge."

        );


    }





    if(ideas.length===0){


        ideas.push(

            "Create a story based on your creator journey."

        );


    }





    return ideas;


}






// =====================================
// SCRIPT OUTLINE
// =====================================

function generateScriptOutline(userId){


    const strategy =

    generateCreatorStrategy(userId);



    return {


        hook:

        `Nobody expected this ${strategy.creatorProfile.niche} story.`,


        body:

        "Show the struggle, process and transformation.",


        ending:

        "Invite viewers to follow the journey."


    };


}






module.exports={


    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline


};
