/* =====================================
   ChatTBM V5.9.4
   Context Engine V1

   Upgrade:
   - Conversation follow-ups
   - Topic awareness
   - Previous message handling
   - Browser compatible
===================================== */



// =====================================
// MAIN CONTEXT ENGINE
// =====================================


function contextEngine(

    message,

    history = []

){


    const text =
    normalize(message);



    const previous =
    getPreviousUserMessage(history);




    // CONTINUE CONVERSATION

    if(hasWords(text,[

        "continue",
        "keep going",
        "go on",
        "continue from there"

    ])){


        return {

            matched:true,

            response:

            "I'll continue from where we stopped.\n\n" +

            "Previous topic:\n" +

            (previous || "our last conversation")

        };


    }






    // REWRITE

    if(hasWords(text,[

        "rewrite",
        "improve",
        "make it better",
        "fix this"

    ])){


        return {

            matched:true,

            response:

            "I'll improve this based on your previous request:\n\n" +

            (previous || "No previous message found.")

        };


    }







    // SHORTEN

    if(hasWords(text,[

        "shorter",
        "shorten",
        "make it brief",
        "summarize"

    ])){


        return {

            matched:true,

            response:

            "I'll create a shorter version of:\n\n" +

            (previous || "your previous message")

        };


    }








    // EXPAND

    if(hasWords(text,[

        "expand",
        "more details",
        "make it longer",
        "explain more"

    ])){


        return {

            matched:true,

            response:

            "I'll expand this idea:\n\n" +

            (previous || "your previous request")

        };


    }







    // REMEMBER LAST TOPIC

    if(hasWords(text,[

        "what were we talking about",
        "what was i saying",
        "last topic"

    ])){


        return {

            matched:true,

            response:

            "Your previous topic was:\n\n" +

            (previous || "No previous topic found.")

        };


    }







    return {

        matched:false,

        response:null

    };


}








// =====================================
// GET PREVIOUS USER MESSAGE
// =====================================


function getPreviousUserMessage(history){



    if(!Array.isArray(history)){

        return "";

    }




    for(

        let i = history.length - 1;

        i >= 0;

        i--

    ){


        if(

            history[i].role === "user"

        ){


            return history[i].message;


        }


    }



    return "";


}







// =====================================
// HELPERS
// =====================================


function normalize(text){


    return text

    .toLowerCase()

    .trim();


}






function hasWords(text,words){


    return words.some(word =>

        text.includes(word)

    );


}








// =====================================
// EXPORT
// =====================================


window.contextEngine = contextEngine;
