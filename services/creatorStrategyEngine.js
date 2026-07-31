// =====================================
// ChatTBM V6.5
// Creator Strategy Engine
//
// Purpose:
// - Build creator strategies
// - Recommend better content
// - Suggest stronger hooks
// - Learn from previous success
// =====================================

const {

    getContentHistory,

    getWinningPatterns,

    getSuccessfulContent

} = require("./contentPerformanceEngine");



// =====================================
// BUILD CREATOR STRATEGY
// =====================================

function generateCreatorStrategy(userId){

    const history =
    getContentHistory(userId);

    const winning =
    getWinningPatterns(userId);

    const successful =
    getSuccessfulContent(userId);



    const strategy = {

        totalContent:
        history.length,

        successfulContent:
        successful.length,

        recommendedHook:
        "",

        recommendedStructure:
        "",

        recommendedEmotion:
        "",

        strongestFormula:
        "",

        nextSuggestion:
        "",

        confidence:
        "Learning"

    };



    if(winning.length){

        const latest =
        winning[winning.length - 1];

        strategy.recommendedHook =
        latest.hook || "";

        strategy.recommendedStructure =
        latest.structure || "";

        strategy.recommendedEmotion =
        latest.emotion || "";

        strategy.strongestFormula =
        latest.formula || "";
    }



    if(successful.length >= 10){

        strategy.confidence =
        "High";

    }

    else if(successful.length >= 5){

        strategy.confidence =
        "Medium";

    }



    if(strategy.recommendedHook){

        strategy.nextSuggestion =
        `Create another post using "${strategy.recommendedHook}" with a stronger ending.`;

    }

    else{

        strategy.nextSuggestion =
        "Keep publishing content so I can learn your best-performing style.";

    }



    return strategy;

}



// =====================================
// GENERATE CONTENT IDEAS
// =====================================

function generateContentIdeas(userId){

    const strategy =
    generateCreatorStrategy(userId);

    return [

        `Create a video using ${strategy.recommendedHook || "a strong opening hook"}.`,

        `Follow the structure ${strategy.recommendedStructure || "Hook → Story → Ending"}.`,

        `Focus on ${strategy.recommendedEmotion || "audience emotion"} throughout the content.`

    ];

}



// =====================================
// GENERATE SCRIPT OUTLINE
// =====================================

function generateScriptOutline(userId){

    const strategy =
    generateCreatorStrategy(userId);

    return {

        hook:
        strategy.recommendedHook ||

        "Strong opening",

        body:
        strategy.recommendedStructure ||

        "Build value step by step",

        ending:

        "Finish with a clear call to action"

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
