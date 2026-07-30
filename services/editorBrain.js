/* =====================================
   ChatTBM V5.9.6.1
   Smart Editor Brain

   Upgrade:
   - Natural shortening
   - Better caption editing
   - Rewrite styles
   - Expand ideas
   - Tone changing
===================================== */



// =====================================
// MAIN EDITOR
// =====================================

function editorBrain(command, text){


    if(!text || text.trim() === ""){

        return "I need content to edit.";

    }



    const cmd =
    command.toLowerCase();




    if(

        cmd.includes("short") ||
        cmd.includes("summarize") ||
        cmd.includes("brief")

    ){

        return shortenText(text);

    }






    if(

        cmd.includes("expand") ||
        cmd.includes("longer") ||
        cmd.includes("more details")

    ){

        return expandText(text);

    }






    if(

        cmd.includes("rewrite") ||
        cmd.includes("improve") ||
        cmd.includes("better")

    ){

        return rewriteText(text);

    }






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
// NATURAL SHORTEN
// =====================================


function shortenText(text){


    const lower =
    text.toLowerCase();



    if(
        lower.includes("no shortcuts")
    ){

        return "No shortcuts. Just consistency. 🚀";

    }





    if(
        lower.includes("small actions")
    ){

        return "Small steps. Big results. 🔥";

    }





    if(
        lower.includes("journey")
    ){

        return "The journey continues. 🚀";

    }





    const words =
    text.split(" ");



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

        "\n\nEvery step matters. " +

        "Growth comes from consistency, patience, and dedication."

    );


}







// =====================================
// REWRITE
// =====================================


function rewriteText(text){


    return (

        "✨ " +

        text +

        "\n\nA new chapter, a stronger version of the story."

    );


}







// =====================================
// TONE STYLES
// =====================================


function motivationalText(text){


    return (

        "🔥 " +

        text +

        "\n\nKeep pushing forward. " +

        "Every step is building something bigger."

    );


}





function viralText(text){


    return (

        "🚀 " +

        text +

        "\n\nWatch the journey. The best is coming."

    );


}





function cinematicText(text){


    return (

        "🎬 " +

        text +

        "\n\nA story written through challenges, growth, and determination."

    );


}







// =====================================
// EXPORT
// =====================================

window.editorBrain = editorBrain;
