// =====================================
// ChatTBM V6.4
// Performance Learning Engine
//
// Purpose:
// - Analyze creator feedback
// - Detect winning patterns
// - Learn why content works
// - Build creator strategy memory
// =====================================



const {

    saveContentPerformance,

    saveViralPattern,

    getBestPerformingContent,

    getViralPatterns

} = require("./contentPerformanceEngine");








// =====================================
// ANALYZE CREATOR PERFORMANCE FEEDBACK
// =====================================


function analyzePerformanceFeedback(

    userId,

    feedback

){


    const text =

    String(feedback)

    .toLowerCase();





    const learning = {


        category:"general",


        result:"unknown",


        successReason:"",


        hook:"",


        audienceReaction:"",


        strategy:""



    };







    // ===============================
    // CONTENT TYPE
    // ===============================


    if(

        text.includes("video") ||

        text.includes("reel") ||

        text.includes("short")

    ){


        learning.category =

        "short video";


    }





    if(

        text.includes("fight") ||

        text.includes("action")

    ){


        learning.category =

        "action content";


    }





    if(

        text.includes("comedy") ||

        text.includes("funny")

    ){


        learning.category =

        "comedy content";


    }









    // ===============================
    // PERFORMANCE RESULT
    // ===============================


    if(

        text.includes("viral") ||

        text.includes("many views") ||

        text.includes("blew up")

    ){


        learning.result =

        "viral";


    }




    else if(

        text.includes("good") ||

        text.includes("worked") ||

        text.includes("success")

    ){


        learning.result =

        "high";


    }







    else if(

        text.includes("failed") ||

        text.includes("low views")

    ){


        learning.result =

        "low";


    }








    // ===============================
    // SUCCESS REASON
    // ===============================


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

        "Comedy and entertainment";


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







    // ===============================
    // AUDIENCE REACTION
    // ===============================


    if(

        text.includes("comments") ||

        text.includes("shares") ||

        text.includes("engagement")

    ){


        learning.audienceReaction =

        "Strong audience interaction";


    }








    // ===============================
    // SAVE LEARNING
    // ===============================


    const saved =

    saveContentPerformance(

        userId,

        learning

    );






    // Save viral pattern separately

    if(

        learning.result === "viral"

    ){


        saveViralPattern(

            userId,

            {


                category:

                learning.category,


                reason:

                learning.successReason,


                hook:

                learning.hook



            }


        );


    }







    return saved;


}









// =====================================
// GET CREATOR WINNING PATTERNS
// =====================================


function getWinningPatterns(

    userId

){


    return {


        successfulContent:

        getBestPerformingContent(

            userId

        ),



        viralPatterns:

        getViralPatterns(

            userId

        )


    };


}








// =====================================
// EXPORT
// =====================================


module.exports = {


    analyzePerformanceFeedback,


    getWinningPatterns


};
