// =====================================
// ChatTBM V9.0
// Creator Intelligence Engine
//
// Purpose:
// - Understand creator/business context
// - Detect creator needs
// - Prepare personalization
// - Support future strategy engine
// =====================================



const CreatorIntelligence = {


    name: "Creator Intelligence",


    version: "9.0",



};







// =====================================
// ANALYZE MESSAGE
// =====================================


function analyzeCreatorContext(message){



    const text =

    message.toLowerCase();





    let context = {


        creator: false,


        business: false,


        content: false,


        audience: false,


        strategy: false


    };







    // Business detection


    if(

        text.includes("business") ||

        text.includes("brand") ||

        text.includes("marketing") ||

        text.includes("sales")

    ){


        context.business = true;


    }







    // Creator detection


    if(

        text.includes("content") ||

        text.includes("video") ||

        text.includes("creator") ||

        text.includes("instagram") ||

        text.includes("youtube") ||

        text.includes("reels")

    ){


        context.creator = true;


        context.content = true;


    }







    // Audience detection


    if(

        text.includes("audience") ||

        text.includes("customer") ||

        text.includes("followers")

    ){


        context.audience = true;


    }







    // Strategy detection


    if(

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("growth")

    ){


        context.strategy = true;


    }







    return context;


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorIntelligence = {


    analyzeCreatorContext

};







console.log(

"🎯 ChatTBM V9.0 Creator Intelligence Loaded"

);
