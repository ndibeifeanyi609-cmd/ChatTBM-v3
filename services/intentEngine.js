// =====================================
// ChatTBM V6.7.1
// Intent Intelligence Engine
//
// Purpose:
// - Understand creator requests
// - Classify user goals
// - Guide response generation
// =====================================



// =====================================
// DETECT INTENT
// =====================================

function detectIntent(message = ""){


    const text =

    String(message)

    .trim()

    .toLowerCase();





    // =====================================
    // GREETING
    // =====================================

    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey" ||

        text.includes("good morning") ||

        text.includes("good evening")

    ){

        return "greeting";

    }






    // =====================================
    // VIDEO SCRIPT CREATION
    // =====================================

    if(

        text.includes("script") ||

        text.includes("video") ||

        text.includes("reel") ||

        text.includes("short") ||

        text.includes("storyboard") ||

        text.includes("hook") ||

        text.includes("body") ||

        text.includes("ending") ||

        text.includes("scene")

    ){

        return "script_generation";

    }






    // =====================================
    // CAPTION CREATION
    // =====================================

    if(

        text.includes("caption") ||

        text.includes("description") ||

        text.includes("write a post") ||

        text.includes("social post") ||

        text.includes("instagram caption") ||

        text.includes("facebook post")

    ){

        return "caption_generation";

    }






    // =====================================
    // VIRAL IDEAS
    // =====================================

    if(

        text.includes("viral") ||

        text.includes("idea") ||

        text.includes("ideas") ||

        text.includes("brainstorm") ||

        text.includes("trend") ||

        text.includes("content plan")

    ){

        return "idea_generation";

    }






    // =====================================
    // MARKETING / ADVERT
    // =====================================

    if(

        text.includes("advert") ||

        text.includes("advertisement") ||

        text.includes("promotion") ||

        text.includes("marketing") ||

        text.includes("sell") ||

        text.includes("brand")

    ){

        return "marketing";

    }






    // =====================================
    // CREATOR STRATEGY
    // =====================================

    if(

        text.includes("strategy") ||

        text.includes("grow") ||

        text.includes("audience") ||

        text.includes("followers") ||

        text.includes("content plan")

    ){

        return "creator_strategy";

    }






    // =====================================
    // GENERAL QUESTION
    // =====================================

    if(

        text.includes("what") ||

        text.includes("why") ||

        text.includes("how") ||

        text.includes("who") ||

        text.includes("where")

    ){

        return "general_question";

    }






    return "general_question";


}






// =====================================
// EXPORT
// =====================================

module.exports = {


    detectIntent


};
