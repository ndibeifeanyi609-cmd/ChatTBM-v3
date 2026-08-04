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
