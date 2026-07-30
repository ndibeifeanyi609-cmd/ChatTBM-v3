/* =====================================
   ChatTBM V5.9.4.2
   Context Engine V3

   Upgrade:
   - Reads previous assistant output
   - Better follow-up understanding
   - Creator content editing support
===================================== */



function contextEngine(

    message,

    history = []

){


    const text =
    normalize(message);



    const previous =
    getPreviousContext(history);





    if(hasWords(text,[

        "continue",
        "keep going",
        "go on"

    ])){


        return {

            matched:true,

            response:

            "I'll continue from the previous content:\n\n" +

            (previous || "our last conversation")

        };


    }






    if(hasWords(text,[

        "rewrite",
        "improve",
        "make it better",
        "fix this"

    ])){


        return {

            matched:true,

            response:

            "I'll improve this content:\n\n" +

            (previous || "No previous content found.")

        };


    }






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

            (previous || "your previous content")

        };


    }






    if(hasWords(text,[

        "expand",
        "more details",
        "make it longer",
        "explain more"

    ])){


        return {

            matched:true,

            response:

            "I'll expand this content:\n\n" +

            (previous || "your previous content")

        };


    }





    if(hasWords(text,[

        "what were we talking about",
        "last topic"

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
// FIND PREVIOUS USEFUL CONTENT
// =====================================


function getPreviousContext(history){


    if(!Array.isArray(history)){

        return "";

    }




    let skippedCurrent = false;



    for(

        let i = history.length - 1;

        i >= 0;

        i--

    ){


        const item =
        history[i];



        // Skip current user command

        if(

            item.role === "user" &&

            !skippedCurrent

        ){

            skippedCurrent = true;

            continue;

        }





        // Prefer assistant output

        if(

            item.role === "assistant"

        ){

            return item.message;

        }



    }



    return "";

}








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







window.contextEngine = contextEngine;
