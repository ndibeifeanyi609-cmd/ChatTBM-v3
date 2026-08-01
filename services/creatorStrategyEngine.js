// =====================================
// ChatTBM V6.7
// Creator Strategy Engine
//
// Connected Systems:
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
// GENERATE CREATOR STRATEGY
// =====================================

function generateCreatorStrategy(userId){


    const identity =

    getCreatorIdentity(userId);



    const voice =

    getBrandVoice(userId);



    const memory =

    getCreatorMemory(userId);




    return {


        creatorProfile: {


            niche:

            identity.niche || "Unknown",


            style:

            identity.contentStyle || "General",


            personality:

            identity.personality || "Natural",


            audience:

            identity.audience || "General"


        },



        brandVoice:{


            tone:

            voice.tone || "Natural",


            energy:

            voice.energy || "Medium",


            writingStyle:

            voice.style || "Simple"


        },



        learnedMemory:{


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
// GENERATE CONTENT IDEAS
// =====================================

function generateContentIdeas(userId){


    const strategy =

    generateCreatorStrategy(userId);



    const ideas = [];





    if(

        strategy.creatorProfile.niche

        ===

        "Action Content"

    ){


        ideas.push(

            "Create a cinematic action story with a surprising ending."

        );


    }





    if(

        strategy.creatorProfile.personality

        ===

        "Entertainment"

    ){


        ideas.push(

            "Create a funny challenge that feels realistic."

        );


    }





    if(

        strategy.brandVoice.tone

        ===

        "Motivational"

    ){


        ideas.push(

            "Create a struggle-to-success story."

        );


    }





    if(ideas.length === 0){


        ideas.push(

            "Create a unique story based on your personal journey."

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

        `Nobody expected this from a ${strategy.creatorProfile.niche} creator.`,



        body:

        "Show the challenge, process and transformation.",



        ending:

        "Invite the audience to follow the journey."

    };


}








// =====================================
// EXPORT
// =====================================

module.exports = {


    generateCreatorStrategy,


    generateContentIdeas,


    generateScriptOutline


};
