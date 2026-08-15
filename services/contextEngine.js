/* =====================================
   ChatTBM V6.0.1
   Context Engine V5.1

   Upgrade:
   - Better follow-up understanding
   - Previous response memory
   - Creator editing support
   - Editor Brain connection
   - Style modification support
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





    if(!previous){


        return {

            matched:false,

            response:null

        };


    }







    // ===============================
    // EDIT COMMANDS
    // ===============================


    if(hasWords(text,[

        "shorter",
        "shorten",
        "make it short",
        "brief",
        "summarize"

    ])){


        return {

            matched:true,

            response:
            runEditor(
                message,
                previous
            )

        };


    }







    if(hasWords(text,[

        "rewrite",
        "rewrite it",
        "improve",
        "make it better",
        "fix this"

    ])){


        return {

            matched:true,

            response:
            runEditor(
                message,
                previous
            )

        };


    }







    if(hasWords(text,[

        "expand",
        "longer",
        "more details",
        "explain more"

    ])){


        return {

            matched:true,

            response:
            runEditor(
                message,
                previous
            )

        };


    }







    // ===============================
    // STYLE CHANGES
    // ===============================


    if(hasWords(text,[

        "cinematic",
        "movie style",
        "dramatic"

    ])){


        return {

            matched:true,

            response:

            runEditor(

                "cinematic",

                previous

            )

        };


    }







    if(hasWords(text,[

        "motivational",
        "inspiring",
        "powerful"

    ])){


        return {

            matched:true,

            response:

            runEditor(

                "motivational",

                previous

            )

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

            runEditor(

                message,

                previous

            )

        };


    }







    // ===============================
    // LAST TOPIC
    // ===============================


    if(hasWords(text,[

        "last topic",
        "previous topic",
        "what were we talking about"

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

        window.editorBrain &&

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
// GET LAST ASSISTANT MESSAGE
// =====================================


function getPreviousContext(history){



    if(

        !Array.isArray(history)

    ){

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


    return String(text)

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


if (typeof window !== "undefined") { window.contextEngine = contextEngine; }
