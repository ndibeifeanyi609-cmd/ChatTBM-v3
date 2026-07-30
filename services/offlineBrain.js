/* ===================================
   ChatTBM V5.9.3
   Offline Smart Response Brain
   Part 3

   Upgrade:
   - Connected Creator Brain
   - Better modular AI routing
   - Offline content assistant
=================================== */


// ===================================
// MAIN OFFLINE BRAIN
// ===================================

function offlineBrain(message) {


    const text = normalizeMessage(message);


    const intent = detectIntent(text);



    switch(intent){


        case "greeting":

            return greetingResponse();



        case "identity":

            return identityResponse();



        case "creator":

            return handleCreatorRequest(text);



        case "coding":

            return codingResponse();



        case "math":

            return mathResponse(text);



        case "motivation":

            return motivationResponse();



        case "conversation":

            return conversationResponse(text);



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
        "afternoon",
        "evening"

    ])){

        return "greeting";

    }



    if(

        text.includes("who are you") ||

        text.includes("your name") ||

        text.includes("what are you")

    ){

        return "identity";

    }




    if(hasWords(text,[

        "caption",
        "hashtag",
        "script",
        "content",
        "video",
        "reel",
        "post",
        "advert",
        "hook",
        "calendar",
        "idea"

    ])){


        return "creator";


    }




    if(hasWords(text,[

        "javascript",
        "html",
        "css",
        "code",
        "program"

    ])){


        return "coding";


    }





    if(/[0-9]+[+\-*/][0-9]+/.test(text)){


        return "math";


    }





    if(hasWords(text,[

        "motivate",
        "motivation",
        "success",
        "inspire"

    ])){


        return "motivation";


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


function handleCreatorRequest(text){


    if(

        typeof window.creatorBrain === "function"

    ){


        return window.creatorBrain(text);


    }



    return (

        "Creator Brain is not loaded yet.\n\n" +

        "Please make sure services/creatorBrain.js " +

        "is connected."

    );


}







// ===================================
// NORMAL RESPONSES
// ===================================


function greetingResponse(){


    return randomReply([

        "Hello 👋 I'm ChatTBM. What can we create today?",

        "Welcome back! I'm ready to help you.",

        "Hi! Let's build something amazing."

    ]);


}







function identityResponse(){


    return (

        "I'm ChatTBM 🤖\n\n" +

        "Your AI Content Assistant designed " +

        "to help with ideas, captions, scripts, " +

        "coding and creative projects."

    );


}







function codingResponse(){


    return (

        "I can help with coding.\n\n" +

        "Tell me the language or problem:\n\n" +

        "HTML, CSS, JavaScript, or ChatTBM development."

    );


}







function mathResponse(text){


    const result = solveMath(text);



    if(result !== null){


        return "The answer is " + result;


    }



    return "I couldn't calculate that yet.";


}







function motivationResponse(){


    return randomReply([

        "Consistency creates results. Keep building.",

        "Every big project begins with a small step.",

        "Your future is built by what you do today."

    ]);


}







function conversationResponse(text){



    if(text.includes("how are you")){


        return (

            "I'm working perfectly offline 🤖 " +

            "Ready to help."

        );


    }



    return (

        "That's great! What would you " +

        "like to work on next?"

    );


}







function timeResponse(){


    return (

        "Current time: " +

        new Date().toLocaleTimeString()

    );


}







function dateResponse(){


    return (

        "Today is " +

        new Date().toDateString()

    );


}







function fallbackResponse(){


    return randomReply([

        "I'm learning more every day. Can you explain what you need?",

        "Interesting question. Let's explore it together.",

        "I can help you create, learn and solve problems."

    ]);


}







// ===================================
// HELPERS
// ===================================


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
