/* =====================================
   ChatTBM V5.9.4.4
   Context Engine V5

   Upgrade:
   - Reads previous assistant output
   - Better follow-up understanding
   - Creator content editing support
   - Editor Brain connection
   - Cleaner context handling
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
    // CONTEXT EDITING CHECK
    // ===============================


    if(

        !previous

    ){

        return {

            matched:false,

            response:null

        };

    }






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

            runEditor(message, previous)

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

            runEditor(message, previous)

        };


    }







    // ===============================
    // SHORTEN
    // ===============================


    if(hasWords(text,[

        "shorter",
        "shorten",
        "make it short",
        "make it brief",
        "summarize",
        "short"

    ])){


        return {

            matched:true,

            response:

            runEditor(message, previous)

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

            runEditor(message, previous)

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

            previous

        };


    }







    return {

        matched:false,

        response:null

    };


}









// =====================================
// EDITOR CONNECTION
// =====================================


function runEditor(

    command,

    content

){


    if(

        typeof window.editorBrain === "function"

    ){


        return window.editorBrain(

            command,

            content

        );


    }



    return content;


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

            item.role === "assistant" &&

            item.message

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






function hasWords(text, words){


    return words.some(word =>

        text.includes(word)

    );


}







// =====================================
// EXPORT
// =====================================


window.contextEngine = contextEngine;
