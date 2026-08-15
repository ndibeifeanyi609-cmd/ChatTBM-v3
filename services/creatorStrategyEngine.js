// =====================================
// ChatTBM V7.0
// Creator Strategy Engine
//
// Connected:
// - Creator Identity
// - Brand Voice
// - Creator Memory
// - Growth Intelligence
// - Performance Learning
//
// Purpose:
// - Build creator strategy
// - Generate content direction
// - Improve future decisions
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





const {

    getGrowthProfile,

    buildGrowthStrategy

} = require("./creatorGrowthEngine");









// =====================================
// GENERATE CREATOR STRATEGY
// =====================================


function generateCreatorStrategy(userId){


    const identity =

    getCreatorIdentity(

        userId

    );





    const voice =

    getBrandVoice(

        userId

    );





    const memory =

    getCreatorMemory(

        userId

    );





    const growth =

    getGrowthProfile(

        userId

    );





    const growthStrategy =

    buildGrowthStrategy(

        userId

    );








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



        },







        growth:{


            signals:

            growth.growthSignals,


            successfulContent:

            growth.successfulContent,


            recommendations:

            growth.recommendations



        },







        direction:


        growthStrategy



    };


}









// =====================================
// CONTENT IDEAS
// =====================================


function generateContentIdeas(userId){


    const strategy =

    generateCreatorStrategy(

        userId

    );





    const ideas=[];







    if(

        strategy.creatorProfile.niche ===

        "Action Content"

    ){


        ideas.push(

            "Create a cinematic action story showing your journey and transformation."

        );


    }







    if(

        strategy.brandVoice.tone ===

        "Motivational"

    ){


        ideas.push(

            "Create a struggle-to-success story that inspires your audience."

        );


    }







    if(

        strategy.brandVoice.tone ===

        "Funny"

    ){


        ideas.push(

            "Create a realistic comedy challenge based on your personality."

        );


    }







    if(

        strategy.growth.successfulContent.length > 0

    ){


        ideas.push(

            "Create a new version of your previous successful content pattern."

        );


    }







    if(

        ideas.length === 0

    ){


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

    generateCreatorStrategy(

        userId

    );





    return {


        hook:


        `Nobody expected this ${strategy.creatorProfile.niche} story.`,





        body:


        "Show the struggle, the process, the lesson and the transformation.",





        ending:


        "Turn viewers into followers by inviting them into your journey."



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
