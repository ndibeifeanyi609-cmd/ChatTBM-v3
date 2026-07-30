/* =====================================
   ChatTBM V6.0.1
   Smart Editor Brain

   Upgrade:
   - Natural shortening
   - Caption editing
   - Rewrite styles
   - Expand ideas
   - Cinematic tone
   - Motivational tone
===================================== */



// =====================================
// MAIN EDITOR
// =====================================


function editorBrain(command, text){


    if(
        !text ||
        text.trim() === ""
    ){

        return "I need content to edit.";

    }



    const cmd =
    command.toLowerCase();





    if(hasWords(cmd,[

        "short",
        "shorter",
        "summarize",
        "brief"

    ])){


        return shortenText(text);


    }







    if(hasWords(cmd,[

        "expand",
        "longer",
        "more details",
        "explain"

    ])){


        return expandText(text);


    }







    if(hasWords(cmd,[

        "rewrite",
        "improve",
        "better",
        "fix"

    ])){


        return rewriteText(text);


    }







    if(hasWords(cmd,[

        "motivational",
        "motivation",
        "inspiring"

    ])){


        return motivationalText(text);


    }







    if(hasWords(cmd,[

        "cinematic",
        "movie",
        "dramatic"

    ])){


        return cinematicText(text);


    }







    if(hasWords(cmd,[

        "viral"

    ])){


        return viralText(text);


    }





    return text;


}









// =====================================
// SHORTEN
// =====================================


function shortenText(text){



    const lower =
    text.toLowerCase();





    if(lower.includes(
        "no shortcuts"
    )){


        return "No shortcuts. Just consistency. 🚀";


    }






    if(lower.includes(
        "small actions"
    )){


        return "Small actions. Big results.";

    }






    if(lower.includes(
        "building my dream"
    )){


        return "Building my dream step by step. 🔥";

    }






    const words =
    text.split(" ");




    if(words.length <= 5){

        return text;

    }



    return (

        words
        .slice(0,5)
        .join(" ")

        +

        "..."

    );


}









// =====================================
// EXPAND
// =====================================


function expandText(text){


    return (

        text +

        "\n\nEvery step is part of the journey. " +

        "Consistency, patience, and dedication create lasting results."

    );


}









// =====================================
// REWRITE
// =====================================


function rewriteText(text){


    return (

        "✨ " +

        text +

        "\n\nTurning challenges into growth and dreams into reality."

    );


}









// =====================================
// MOTIVATIONAL
// =====================================


function motivationalText(text){


    return (

        "🔥 " +

        text +

        "\n\nKeep pushing forward. " +

        "Every effort is building your future."

    );


}









// =====================================
// CINEMATIC
// =====================================


function cinematicText(text){


    return (

        "🎬 " +

        text +

        "\n\nA story built through struggle, growth, and determination."

    );


}









// =====================================
// VIRAL
// =====================================


function viralText(text){


    return (

        "🚀 " +

        text +

        "\n\nFollow the journey. The next chapter is coming."

    );


}









// =====================================
// HELPER
// =====================================


function hasWords(text,list){


    return list.some(word =>

        text.includes(word)

    );


}









// =====================================
// EXPORT
// =====================================


window.editorBrain = editorBrain;
