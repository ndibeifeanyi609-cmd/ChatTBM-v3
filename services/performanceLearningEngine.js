// =====================================
// ChatTBM V6.4
// Performance Learning Engine
//
// Learns:
// - Winning Content Patterns
// - Strong Hooks
// - Audience Reactions
// - Successful Strategies
// =====================================


const {

    saveContentPerformance,

    getContentPerformance

} = require("./contentPerformanceEngine");





// =====================================
// ANALYZE CONTENT FEEDBACK
// =====================================

function analyzePerformanceFeedback(

    userId,

    feedback

){


    const text =

    feedback.toLowerCase();



    const data = {

        type:"general",

        performance:"",

        reason:"",

        audienceReaction:"",

        hook:""

    };





    // ===============================
    // CONTENT TYPE DETECTION
    // ===============================


    if(

        text.includes("video")

    ){

        data.type = "video";

    }



    if(

        text.includes("reel") ||

        text.includes("short")

    ){

        data.type = "short video";

    }



    if(

        text.includes("fight") ||

        text.includes("action")

    ){

        data.type = "action content";

    }





    // ===============================
    // PERFORMANCE DETECTION
    // ===============================


    if(

        text.includes("viral") ||

        text.includes("views") ||

        text.includes("popular")

    ){


        data.performance =

        "high performance";


    }





    if(

        text.includes("failed") ||

        text.includes("low views")

    ){


        data.performance =

        "low performance";


    }





    // ===============================
    // REASON DETECTION
    // ===============================


    if(

        text.includes("hook")

    ){


        data.reason =

        "Strong opening hook";


        data.hook =

        "High impact hook";


    }





    if(

        text.includes("funny")

    ){


        data.reason =

        "Comedy element";


    }





    if(

        text.includes("emotional")

    ){


        data.reason =

        "Emotional connection";


    }





    // ===============================
    // AUDIENCE REACTION
    // ===============================


    if(

        text.includes("comments") ||

        text.includes("engagement")

    ){


        data.audienceReaction =

        "Strong audience interaction";


    }





    return saveContentPerformance(

        userId,

        data

    );


}





// =====================================
// GET WINNING CONTENT
// =====================================

function getWinningPatterns(

    userId

){


    const contents =

    getContentPerformance(

        userId

    );



    return contents.filter(

        item =>

        item.performance ===

        "high performance"

    );


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    analyzePerformanceFeedback,


    getWinningPatterns


};
