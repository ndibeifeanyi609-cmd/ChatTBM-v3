// =====================================
// ChatTBM V9.4
// Creator Intelligence Engine
//
// Upgrade:
// - Memory-aware creator analysis
// - Brand detection
// - Fitness detection
// - Audience detection
// - Goal detection
// - Strategy preparation
// - Fully compatible with V9.x
// =====================================



const CreatorIntelligence = {


    name: "Creator Intelligence",


    version: "9.4"


};





// =====================================
// ANALYZE CREATOR CONTEXT
// =====================================


function analyzeCreatorContext(

    message,

    memoryContext = ""

){



    const text =

    message.toLowerCase();



    const memory =

    memoryContext.toLowerCase();





    const context = {


        creator:false,


        business:false,


        fitness:false,


        content:false,


        audience:false,


        strategy:false,


        goal:"",


        niche:"",


        platform:"",


        remembered:false


    };





    // ================================
    // MEMORY DETECTION
    // ================================


    if(memory.length > 0){

        context.remembered = true;

    }






    // ================================
    // BUSINESS
    // ================================


    if(

        text.includes("business") ||

        text.includes("brand") ||

        text.includes("marketing") ||

        text.includes("sales") ||

        memory.includes("business") ||

        memory.includes("brand")

    ){

        context.business = true;

    }






    // ================================
    // FITNESS NICHE
    // ================================


    if(

        text.includes("fitness") ||

        text.includes("workout") ||

        text.includes("gym") ||

        text.includes("exercise") ||

        text.includes("health") ||

        memory.includes("fitness")

    ){

        context.fitness = true;

        context.niche = "fitness";

    }






    // ================================
    // CREATOR CONTENT
    // ================================


    if(

        text.includes("content") ||

        text.includes("video") ||

        text.includes("instagram") ||

        text.includes("youtube") ||

        text.includes("reels") ||

        text.includes("post")

    ){

        context.creator = true;

        context.content = true;

    }






    // ================================
    // PLATFORM
    // ================================


    if(text.includes("instagram")){

        context.platform = "Instagram";

    }

    else if(text.includes("youtube")){

        context.platform = "YouTube";

    }

    else if(text.includes("facebook")){

        context.platform = "Facebook";

    }

    // ================================
    // AUDIENCE DETECTION
    // ================================


    if(

        text.includes("audience") ||

        text.includes("followers") ||

        text.includes("community") ||

        text.includes("customers") ||

        text.includes("clients")

    ){

        context.audience = true;

    }





    // ================================
    // GOAL DETECTION
    // ================================


    if(

        text.includes("grow") ||

        text.includes("increase followers") ||

        text.includes("viral") ||

        text.includes("reach")

    ){

        context.goal = "growth";

    }


    else if(

        text.includes("sell") ||

        text.includes("sales") ||

        text.includes("money") ||

        text.includes("customers")

    ){

        context.goal = "monetization";

    }


    else if(

        text.includes("learn") ||

        text.includes("improve") ||

        text.includes("better")

    ){

        context.goal = "improvement";

    }





    // ================================
    // STRATEGY PREPARATION
    // ================================


    if(context.creator && context.fitness){

        context.strategy =
        "Fitness content strategy: reels, transformation stories, educational posts, audience engagement";

    }


    else if(context.business){

        context.strategy =
        "Brand growth strategy: positioning, marketing, customer acquisition";

    }


    else if(context.creator){

        context.strategy =
        "Creator growth strategy: consistent content, audience building, platform optimization";

    }





    // ================================
    // NICHE FALLBACK
    // ================================


    if(context.niche === ""){


        if(text.includes("tech")){

            context.niche = "technology";

        }

        else if(text.includes("fashion")){

            context.niche = "fashion";

        }

        else if(text.includes("food")){

            context.niche = "food";

        }

        else if(text.includes("gaming")){

            context.niche = "gaming";

        }

    }





    // ================================
    // CONFIDENCE SCORE
    // ================================


    let score = 0;


    if(context.creator) score += 20;

    if(context.business) score += 20;

    if(context.fitness) score += 20;

    if(context.audience) score += 15;

    if(context.strategy) score += 25;



    context.confidence = score;





    return context;


}





// =====================================
// EXPORT
// =====================================


if(typeof module !== "undefined"){

    module.exports = {

        CreatorIntelligence,

        analyzeCreatorContext

    };

}
