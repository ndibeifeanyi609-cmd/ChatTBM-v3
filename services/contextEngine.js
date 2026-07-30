/* =====================================
   ChatTBM V5.9.4.3
   Context Engine V4

   Upgrade:
   - Reads previous assistant output
   - Better follow-up understanding
   - Creator content editing support
   - Editor Brain connection
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
    getPreviousContext(history);





    // ===============================
    // CONTINUE
    // ===============================

    if(hasWords(text,[

        "continue",
        "keep going",
        "go on"

    ])){


        return {

            matched:true,

            response:

            typeof window.editorBrain === "function"

            ? window.editorBrain(message, previous)

            : previous

        };


    }





    // ===============================
    // REWRITE
    // ===============================

    if(hasWords(text,[

        "rewrite",
        "improve",
        "make it better",
        "fix this"

    ])){


        return {

            matched:true,

            response:

            typeof window.editorBrain === "function"

            ? window.editorBrain(message, previous)

            : previous

        };


    }





    // ===============================
    // SHORTEN
    // ===============================

    if(hasWords(text,[

        "shorter",
        "shorten",
        "make it brief",
        "summarize"

    ])){


        return {

            matched:true,

            response:

            typeof window.editorBrain === "function"

            ? window.editorBrain(message, previous)

            : previous

        };


    }





    // ===============================
    // EXPAND
    // ===============================

    if(hasWords(text,[

        "expand",
        "more details",
        "make it longer",
        "explain more"

    ])){


        return {

            matched:true,

            response:

            typeof window.editorBrain === "function"

            ? window.editorBrain(message, previous)

            : previous

        };


    }





    // ===============================
    // LAST TOPIC
    // ===============================

    if(hasWords(text,[

        "what were we talking about",
        "last topic",
        "previous topic"

    ])){


        return {

            matched:true,

            response:

            "Your previous content was:\n\n" +

            (previous || "No previous content found.")

        };


    }





    return {

        matched:false,

        response:null

    };


}









// =====================================
// FIND PREVIOUS ASSISTANT RESPONSE
// =====================================

function getPreviousContext(history){


    if(!Array.isArray(history)){

        return "";

    }



    for(

        let i = history.length - 1;

        i >= 0;

        i--

    ){


        const item =
        history[i];



        if(

            item.role === "assistant"

        ){

            return item.message;

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
