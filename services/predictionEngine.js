// =====================================
// ChatTBM V6.6
// Prediction Engine
//
// Purpose:
// - Predict content performance
// - Estimate viral potential
// - Explain prediction
// - Recommend improvements
// =====================================

const {

    analyzeViralPattern

} = require("./viralMemoryBridge");



// =====================================
// PREDICT CONTENT
// =====================================

function predictContent(content){

    const pattern =
    analyzeViralPattern(content);

    let score = 50;

    const reasons = [];



    // ===============================
    // HOOK SCORE
    // ===============================

    if(pattern.hook){

        score += 15;

        reasons.push(

            "Strong opening hook"

        );

    }



    // ===============================
    // STORY STRUCTURE
    // ===============================

    if(pattern.structure){

        score += 15;

        reasons.push(

            "Clear story structure"

        );

    }



    // ===============================
    // EMOTION
    // ===============================

    if(pattern.emotion){

        score += 10;

        reasons.push(

            "Emotional connection"

        );

    }



    // ===============================
    // ENGAGEMENT
    // ===============================

    if(pattern.trigger){

        score += 10;

        reasons.push(

            "Audience engagement trigger"

        );

    }



    // Limit score

    if(score > 100){

        score = 100;

    }



    let level = "Low";

    if(score >= 80){

        level = "High";

    }

    else if(score >= 60){

        level = "Medium";

    }



    return {

        score,

        level,

        reasons,

        pattern

    };

}



// =====================================
// CONTENT IMPROVEMENT
// =====================================

function recommendImprovements(prediction){

    const tips = [];



    if(!prediction.pattern.hook){

        tips.push(

            "Use a stronger opening hook."

        );

    }



    if(!prediction.pattern.structure){

        tips.push(

            "Create a clearer beginning, middle and ending."

        );

    }



    if(!prediction.pattern.emotion){

        tips.push(

            "Add emotion that viewers can relate to."

        );

    }



    if(!prediction.pattern.trigger){

        tips.push(

            "Finish with a reason to comment, share or follow."

        );

    }



    if(tips.length === 0){

        tips.push(

            "Content already has strong prediction signals."

        );

    }



    return tips;

}



// =====================================
// EXPORT
// =====================================

module.exports = {

    predictContent,

    recommendImprovements

};
