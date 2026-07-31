// =====================================
// ChatTBM V6.3
// Creator Learning Engine
//
// Learns:
// - Brand Voice
// - Content Style
// - Audience Behaviour
// - Viral Patterns
// - Creator Strategy
// =====================================



const {

    updateCreatorMemory,

    getCreatorMemory

} = require("./creatorMemoryEngine");




// =====================================
// LEARN BRAND VOICE
// =====================================

function learnBrandVoice(

    userId,

    voice

){

    return updateCreatorMemory(

        userId,

        {

            brandVoice: voice

        }

    );

}





// =====================================
// LEARN CONTENT STYLE
// =====================================

function learnContentStyle(

    userId,

    style

){

    return updateCreatorMemory(

        userId,

        {

            contentStyle: style

        }

    );

}





// =====================================
// LEARN AUDIENCE
// =====================================

function learnAudience(

    userId,

    audience

){

    return updateCreatorMemory(

        userId,

        {

            audience

        }

    );

}





// =====================================
// ADD VIRAL PATTERN
// =====================================

function addViralPattern(

    userId,

    pattern

){


    const memory =

    getCreatorMemory(

        userId

    );



    memory.viralPatterns.push(

        {

            pattern,


            created:

            new Date().toISOString()

        }

    );



    return memory;


}





// =====================================
// ADD SUCCESSFUL CONTENT
// =====================================

function addSuccessfulContent(

    userId,

    content

){


    const memory =

    getCreatorMemory(

        userId

    );



    memory.successfulContent.push(

        {

            content,


            created:

            new Date().toISOString()

        }

    );



    return memory;


}





// =====================================
// ADD STRATEGY MEMORY
// =====================================

function addStrategy(

    userId,

    strategy

){


    const memory =

    getCreatorMemory(

        userId

    );



    memory.strategies.push(

        {

            strategy,


            created:

            new Date().toISOString()

        }

    );



    return memory;


}





// =====================================
// AUTOMATIC CREATOR ANALYSIS
// =====================================

function analyzeCreatorInput(

    userId,

    text

){


    const message =

    text.toLowerCase();





    // Brand voice detection

    if(

        message.includes("cinematic") ||

        message.includes("motivational") ||

        message.includes("powerful")

    ){


        learnBrandVoice(

            userId,

            text

        );


    }





    // Content style detection

    if(

        message.includes("reels") ||

        message.includes("short video") ||

        message.includes("action")

    ){


        learnContentStyle(

            userId,

            text

        );


    }





    // Audience learning

    if(

        message.includes("audience") ||

        message.includes("fans")

    ){


        learnAudience(

            userId,

            text

        );


    }





    return getCreatorMemory(

        userId

    );


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    learnBrandVoice,


    learnContentStyle,


    learnAudience,


    addViralPattern,


    addSuccessfulContent,


    addStrategy,


    analyzeCreatorInput


};
