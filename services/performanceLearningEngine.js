// =====================================
// ChatTBM V7.0
// Performance Learning Engine
//
// Connected:
// - Content Performance Memory
// - Growth Intelligence
// - Creator Strategy
// - Feedback Learning
//
// Purpose:
// - Analyze content results
// - Detect winning patterns
// - Learn why content performs
// =====================================



const {

    saveContentPerformance,

    saveWinningPattern,

    getSuccessfulContent,

    getWinningPatterns

} = require("./contentPerformanceEngine");








// =====================================
// ANALYZE CREATOR PERFORMANCE FEEDBACK
// =====================================


function analyzePerformanceFeedback(

    userId,

    feedback

){


    const text =

    String(feedback || "")

    .toLowerCase();





    const learning = {


        category:"general",

        result:"unknown",

        successReason:"",

        hook:"",

        audienceReaction:"",

        strategy:""



    };









// =====================================
// CONTENT CATEGORY DETECTION
// =====================================


if(

    text.includes("video") ||

    text.includes("reel") ||

    text.includes("short")

){

    learning.category = "short video";

}



if(

    text.includes("action") ||

    text.includes("fight") ||

    text.includes("battle")

){

    learning.category = "action content";

}



if(

    text.includes("funny") ||

    text.includes("comedy") ||

    text.includes("laugh")

){

    learning.category = "comedy content";

}









// =====================================
// PERFORMANCE DETECTION
// =====================================


if(

    text.includes("viral") ||

    text.includes("blew up") ||

    text.includes("many views")

){

    learning.result = "viral";


}


else if(

    text.includes("worked") ||

    text.includes("success") ||

    text.includes("good")

){

    learning.result = "high";


}


else if(

    text.includes("failed") ||

    text.includes("low views")

){

    learning.result = "low";


}









// =====================================
// WHY CONTENT WORKED
// =====================================


if(

    text.includes("hook")

){

    learning.successReason =

    "Strong opening hook";


    learning.hook =

    "High impact opening";


}



if(

    text.includes("funny")

){

    learning.successReason =

    "Comedy entertainment";


}



if(

    text.includes("emotional")

){

    learning.successReason =

    "Emotional connection";


}



if(

    text.includes("surprise")

){

    learning.successReason =

    "Unexpected moment";


    learning.strategy =

    "Use surprise elements";


}









// =====================================
// AUDIENCE RESPONSE
// =====================================


if(

    text.includes("comment") ||

    text.includes("share") ||

    text.includes("engagement")

){

    learning.audienceReaction =

    "Strong audience interaction";


}









// =====================================
// SAVE PERFORMANCE MEMORY
// =====================================


const saved =

saveContentPerformance(

    userId,

    learning

);









// =====================================
// SAVE WINNING PATTERN
// =====================================


if(

    learning.result === "viral" ||

    learning.result === "high"

){


    saveWinningPattern(

        userId,

        {


            category:

            learning.category,


            reason:

            learning.successReason,


            hook:

            learning.hook,


            strategy:

            learning.strategy



        }

    );


}








return saved;


}









// =====================================
// GET CREATOR WINNING PATTERNS
// =====================================


function getCreatorWinningPatterns(

    userId

){


    return {


        successfulContent:

        getSuccessfulContent(

            userId

        ),



        winningPatterns:

        getWinningPatterns(

            userId

        )


    };


}









// =====================================
// EXPORT
// =====================================


module.exports = {


    analyzePerformanceFeedback,


    getCreatorWinningPatterns


};
