// =====================================
// ChatTBM V6.6
// Hook Scoring Engine
//
// Purpose:
// - Score content hooks
// - Detect hook style
// - Explain score
// - Recommend improvements
// =====================================



// =====================================
// SCORE HOOK
// =====================================

function scoreHook(hook){

    const text =
    String(hook)
    .toLowerCase();

    let score = 0;

    const strengths = [];

    const improvements = [];

    let type = "General";



    // ===============================
    // CURIOSITY
    // ===============================

    if(

        text.includes("nobody") ||

        text.includes("no one") ||

        text.includes("secret") ||

        text.includes("never")

    ){

        score += 25;

        type = "Curiosity";

        strengths.push(

            "Creates curiosity"

        );

    }



    // ===============================
    // ACTION
    // ===============================

    if(

        text.includes("fight") ||

        text.includes("battle") ||

        text.includes("challenge")

    ){

        score += 20;

        type = "Action";

        strengths.push(

            "Creates excitement"

        );

    }



    // ===============================
    // EMOTION
    // ===============================

    if(

        text.includes("dream") ||

        text.includes("struggle") ||

        text.includes("family") ||

        text.includes("journey")

    ){

        score += 20;

        strengths.push(

            "Builds emotional connection"

        );

    }



    // ===============================
    // SURPRISE
    // ===============================

    if(

        text.includes("unexpected") ||

        text.includes("surprise") ||

        text.includes("suddenly")

    ){

        score += 20;

        strengths.push(

            "Adds surprise"

        );

    }



    // ===============================
    // CALL TO ACTION
    // ===============================

    if(

        text.includes("watch") ||

        text.includes("wait") ||

        text.includes("follow")

    ){

        score += 15;

        strengths.push(

            "Encourages viewer retention"

        );

    }



    // ===============================
    // LIMIT SCORE
    // ===============================

    if(score > 100){

        score = 100;

    }



    if(score < 40){

        improvements.push(

            "Increase curiosity."

        );

    }



    if(score < 60){

        improvements.push(

            "Add stronger emotion."

        );

    }



    if(score < 80){

        improvements.push(

            "Make the opening more memorable."

        );

    }



    return {

        score,

        type,

        strengths,

        improvements

    };

}






// =====================================
// COMPARE HOOKS
// =====================================

function compareHooks(hooks=[]){

    return hooks

    .map(hook=>{

        return{

            hook,

            analysis:

            scoreHook(hook)

        };

    })

    .sort(

        (a,b)=>

        b.analysis.score -

        a.analysis.score

    );

}






// =====================================
// EXPORT
// =====================================

module.exports={

    scoreHook,

    compareHooks

};
