/* =====================================
   ChatTBM V5.9.6
   Smart Editor Brain

   Upgrade:
   - Natural shortening
   - Rewrite
   - Expand
   - Tone changing
===================================== */


// =====================================
// MAIN EDITOR
// =====================================

function editorBrain(command, text){


    if(!text){

        return "I need content to edit.";

    }


    const cmd =
    command.toLowerCase();



    // SHORTEN

    if(
        cmd.includes("short") ||
        cmd.includes("summarize") ||
        cmd.includes("brief")
    ){

        return shortenText(text);

    }





    // EXPAND

    if(
        cmd.includes("expand") ||
        cmd.includes("longer") ||
        cmd.includes("more details")
    ){

        return expandText(text);

    }






    // REWRITE

    if(
        cmd.includes("rewrite") ||
        cmd.includes("improve") ||
        cmd.includes("better")
    ){

        return rewriteText(text);

    }







    // TONE CHANGE


    if(
        cmd.includes("motivational") ||
        cmd.includes("motivation")
    ){

        return motivationalText(text);

    }





    if(
        cmd.includes("viral")
    ){

        return viralText(text);

    }





    if(
        cmd.includes("cinematic")
    ){

        return cinematicText(text);

    }





    return text;


}






// =====================================
// SHORTEN
// =====================================


function shortenText(text){


    const words =
    text.split(" ");



    if(words.length <= 4){

        return text;

    }



    return words
    .slice(0,5)
    .join(" ")
    + "...";


}







// =====================================
// EXPAND
// =====================================


function expandText(text){


    return (

        text +

        "\n\nEvery step tells a story. " +

        "Keep pushing forward and trust the journey."

    );


}







// =====================================
// REWRITE
// =====================================


function rewriteText(text){


    return (

        "✨ " +

        text +

        "\n\nTurning every challenge into progress."

    );


}







// =====================================
// TONES
// =====================================


function motivationalText(text){


    return (

        "🔥 " +

        text +

        "\n\nNo matter the obstacles, keep moving forward."

    );


}




function viralText(text){


    return (

        "🚀 " +

        text +

        " Follow the journey. The best is yet to come."

    );


}




function cinematicText(text){


    return (

        "🎬 " +

        text +

        "\n\nA story built through struggle, growth, and determination."

    );


}







// =====================================
// EXPORT
// =====================================

window.editorBrain = editorBrain;
