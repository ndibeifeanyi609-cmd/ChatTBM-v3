// =====================================
// ChatTBM V6.1
// Feedback Engine
// Adaptive Learning System
// =====================================


const {

    learnPreference,

    learnCorrection

} = require("./learningEngine");



// =====================================
// FEEDBACK STORAGE
// =====================================

const feedbackMemory = [];




// =====================================
// ANALYZE USER FEEDBACK
// =====================================

function analyzeUserFeedback(

    userId,

    feedback

){


    const text =

    feedback.toLowerCase();




    // ===============================
    // RESPONSE LENGTH
    // ===============================

    if(

        text.includes("short") ||

        text.includes("brief")

    ){

        learnPreference(

            userId,

            "response_length",

            "short"

        );

    }





    if(

        text.includes("detailed") ||

        text.includes("long")

    ){

        learnPreference(

            userId,

            "response_length",

            "detailed"

        );

    }





    // ===============================
    // STYLE PREFERENCE
    // ===============================

    if(

        text.includes("cinematic")

    ){

        learnPreference(

            userId,

            "writing_style",

            "cinematic"

        );

    }



    if(

        text.includes("professional")

    ){

        learnPreference(

            userId,

            "writing_style",

            "professional"

        );

    }

// =====================================
// EMOJI PREFERENCE LEARNING
// =====================================

    if(

        text.includes("emoji") ||

        text.includes("emojis")

    ){

        learnPreference(

            userId,

            "emoji_usage",

            "enabled"

        );

    }





// =====================================
// CORRECTION LEARNING
// =====================================

    learnCorrection(

        userId,

        "previous_response",

        feedback

    );



    return {

        success:true,

        message:"Feedback analyzed and learned"

    };

}





// =====================================
// SAVE FEEDBACK
// =====================================

function saveFeedback(

    data = {}

){


    const feedback = {


        userId:

        data.userId || "guest",


        message:

        data.message || "",


        response:

        data.response || "",


        rating:

        data.rating || null,


        correction:

        data.correction || null,


        timestamp:

        new Date().toISOString()


    };



    feedbackMemory.push(

        feedback

    );




    if(

        feedback.correction

    ){

        analyzeUserFeedback(

            feedback.userId,

            feedback.correction

        );

    }



    if(

        feedback.message

    ){

        analyzeUserFeedback(

            feedback.userId,

            feedback.message

        );

    }



    return {


        success:true,


        message:

        "Feedback saved and learning updated",


        feedback


    };


}





// =====================================
// FEEDBACK ANALYTICS
// =====================================

function analyzeFeedback(){


    return {


        totalFeedback:

        feedbackMemory.length,


        recent:

        feedbackMemory.slice(-5)


    };


}





// =====================================
// GET ALL FEEDBACK
// =====================================

function getFeedbackMemory(){


    return feedbackMemory;


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    saveFeedback,

    analyzeFeedback,

    getFeedbackMemory,

    analyzeUserFeedback


};
