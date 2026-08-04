// =====================================
// ChatTBM V9.3
// Creator Strategy Intelligence Engine
//
// Upgrade:
// - Creator context analysis
// - Brand niche detection
// - Goal understanding
// - Strategy preparation
// - Memory compatible
// =====================================



const CreatorIntelligence = {


    name: "Creator Intelligence",


    version: "9.3"



};







// =====================================
// ANALYZE CREATOR CONTEXT
// =====================================


function analyzeCreatorContext(message, memoryContext = ""){



    const text =

    message.toLowerCase();





    const context = {


        creator: false,


        business: false,


        fitness: false,


        content: false,


        audience: false,


        strategy: false,


        goal: ""



    };







    // Business


    if(

        text.includes("business") ||

        text.includes("brand") ||

        text.includes("marketing") ||

        text.includes("sales")

    ){


        context.business = true;


    }







    // Fitness niche


    if(

        text.includes("fitness") ||

        text.includes("workout") ||

        text.includes("gym") ||

        text.includes("exercise") ||

        text.includes("health")

    ){


        context.fitness = true;


    }







    // Creator content


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







    // Audience


    if(

        text.includes("audience") ||

        text.includes("customer") ||

        text.includes("followers") ||

        text.includes("clients")

    ){


        context.audience = true;


    }







    // Strategy


    if(

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("growth") ||

        text.includes("marketing")

    ){


        context.strategy = true;


    }







    // Goal detection


    if(

        text.includes("ideas")

    ){


        context.goal = "content ideas";


    }


    else if(

        text.includes("grow")

    ){


        context.goal = "growth";


    }


    else if(

        text.includes("sell") ||

        text.includes("sales")

    ){


        context.goal = "sales";


    }







    return context;


}







// =====================================
// CREATE STRATEGY SUMMARY
// =====================================


function buildCreatorStrategy(context){



    let strategy = [];





    if(context.fitness){


        strategy.push(

            "Fitness niche detected"

        );


    }







    if(context.content){


        strategy.push(

            "Content creation focus detected"

        );


    }







    if(context.audience){


        strategy.push(

            "Audience growth focus detected"

        );


    }







    return strategy;


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorIntelligence = {


    analyzeCreatorContext(message, memoryContext)

    buildCreatorStrategy


};







console.log(

"🎯 ChatTBM V9.3 Creator Strategy Intelligence Loaded"

);
