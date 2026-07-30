/* ===================================
   ChatTBM V6.0.1
   Offline Smart Response Brain

   Upgrade:
   - Context Engine V4 connection
   - Creator Brain V5.9.7.1 connection
   - Creator Memory support
   - Editor Brain support
   - Better offline conversation flow
=================================== */



// ===================================
// MAIN OFFLINE BRAIN
// ===================================


function offlineBrain(message){


    const text =
    normalizeMessage(message);



    // ===================================
    // CONTEXT ENGINE FIRST
    // ===================================


    if(
        typeof window.contextEngine === "function"
    ){


        const contextResult =

        window.contextEngine(

            message,

            getChatHistory()

        );



        if(
            contextResult &&
            contextResult.matched
        ){

            return contextResult.response;

        }


    }





    // ===================================
    // DETECT INTENT
    // ===================================


    const intent =
    detectIntent(text);





    switch(intent){


        case "greeting":

            return greetingResponse();



        case "identity":

            return identityResponse();



        case "creator":

            return handleCreatorRequest(message);



        case "coding":

            return codingResponse();



        case "math":

            return mathResponse(text);



        case "motivation":

            return motivationResponse();



        case "conversation":

            return conversationResponse(text);



        case "personal":

            return personalResponse();



        case "time":

            return timeResponse();



        case "date":

            return dateResponse();



        default:

            return fallbackResponse();


    }



}








// ===================================
// INTENT DETECTOR
// ===================================


function detectIntent(text){



    if(hasWords(text,[

        "hi",
        "hello",
        "hey",
        "morning",
        "good morning"

    ])){

        return "greeting";

    }






    if(hasWords(text,[

        "who are you",
        "your name",
        "what are you"

    ])){


        return "identity";


    }






    if(hasWords(text,[

        "caption",
        "script",
        "hashtag",
        "video",
        "reel",
        "content",
        "post",
        "advert",
        "hook",
        "idea",
        "calendar",
        "viral"

    ])){


        return "creator";


    }






    if(hasWords(text,[

        "html",
        "css",
        "javascript",
        "code",
        "program"

    ])){


        return "coding";


    }






    if(/[0-9]+[+\-*/][0-9]+/.test(text)){


        return "math";


    }






    if(hasWords(text,[

        "motivation",
        "motivational",
        "success",
        "inspire"

    ])){


        return "motivation";


    }






    if(hasWords(text,[

        "my journey",
        "my story",
        "i am building",
        "my project"

    ])){


        return "personal";


    }






    if(text.includes("time")){


        return "time";


    }




    if(
        text.includes("date") ||
        text.includes("today")
    ){


        return "date";


    }





    if(hasWords(text,[

        "how are you",
        "good",
        "nice",
        "great"

    ])){


        return "conversation";


    }



    return "unknown";


}








// ===================================
// CREATOR BRAIN CONNECTION
// ===================================


function handleCreatorRequest(message){



    if(

        typeof window.creatorBrain === "function"

    ){


        return window.creatorBrain(message);


    }




    return (

        "Creator Brain is loading...\n\n" +

        "Please check services/creatorBrain.js"

    );


}








// ===================================
// PERSONAL RESPONSE
// ===================================


function personalResponse(){


    return (

        "Your journey can become powerful content. 🔥\n\n" +

        "I can turn your story into:\n\n" +

        "• Caption\n" +
        "• Video script\n" +
        "• Viral idea\n" +
        "• Personal brand content"

    );


}








// ===================================
// BASIC RESPONSES
// ===================================


function greetingResponse(){


    return randomReply([

        "Hello 👋 I'm ChatTBM. What are we creating today?",

        "Welcome back! Let's create something powerful.",

        "Hi 👋 Ready to build your next idea?"

    ]);


}





function identityResponse(){


    return (

        "I'm ChatTBM 🤖\n\n" +

        "Your AI Content Assistant for captions, " +

        "scripts, ideas, coding and creative projects."

    );


}






function codingResponse(){


    return (

        "I can help with HTML, CSS, JavaScript " +

        "and ChatTBM development."

    );


}






function motivationResponse(){


    return randomReply([

        "Consistency creates results. Keep building. 🚀",

        "Every big project begins with a small step.",

        "Your future is created by today's actions."

    ]);


}






function conversationResponse(text){


    if(text.includes("how are you")){

        return "I'm running with my offline brain 🤖 Ready to help.";

    }


    return "Great! What would you like to create next?";


}






function mathResponse(text){


    const result =
    solveMath(text);



    if(result !== null){

        return "The answer is " + result;

    }



    return "I couldn't calculate that yet.";

}






function timeResponse(){

    return "Current time: " +
    new Date().toLocaleTimeString();

}






function dateResponse(){

    return "Today is " +
    new Date().toDateString();

}






function fallbackResponse(){


    return randomReply([

        "I'm learning more every day. Tell me what you need.",

        "Let's explore that together.",

        "I can help you create, learn and solve problems."

    ]);


}








// ===================================
// HELPERS
// ===================================


function getChatHistory(){


    if(

        window.conversationManager &&

        typeof window.conversationManager.getHistory === "function"

    ){

        return window.conversationManager.getHistory();

    }



    return [];

}






function normalizeMessage(text){


    return text

    .toLowerCase()

    .trim();


}






function hasWords(text,list){


    return list.some(word =>

        text.includes(word)

    );


}






function randomReply(list){


    return list[

        Math.floor(

            Math.random()*list.length

        )

    ];


}






function solveMath(text){


    const expression =

    text.match(/[0-9+\-*/(). ]+/);



    if(!expression){

        return null;

    }



    try{


        const result =

        Function(

            "return " + expression[0]

        )();



        if(

            typeof result === "number" &&

            !isNaN(result)

        ){

            return result;

        }


    }

    catch(error){


        return null;


    }



    return null;


}







// ===================================
// EXPORT
// ===================================


window.offlineBrain = offlineBrain;
