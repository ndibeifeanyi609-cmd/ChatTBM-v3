// =====================================
// ChatTBM V5.4
// Context Engine
// Handles conversation follow-ups
// =====================================



// =====================================
// CONTEXT HANDLER
// =====================================

function handleContextRequest(

    message,

    history = []

){


    const text =
    message.toLowerCase();



    let previousMessage = "";



    // =====================================
    // FIND LAST USER MESSAGE
    // =====================================

    if(history.length > 0){


        for(
            let i = history.length - 1;
            i >= 0;
            i--
        ){

            if(
                history[i].role === "user"
            ){

                previousMessage =
                history[i].message;

                break;

            }

        }


    }




    // =====================================
    // CONTINUE
    // =====================================

    if(

        text.includes("continue") ||

        text.includes("keep going") ||

        text.includes("go on")

    ){

        return {

            matched:true,

            response:

`I'll continue from where we stopped.

Previous topic:
${previousMessage || "our last conversation"}

Let's continue building on it.`

        };

    }




    // =====================================
    // REWRITE
    // =====================================

    if(

        text.includes("rewrite") ||

        text.includes("improve") ||

        text.includes("make it better")

    ){

        return {

            matched:true,

            response:

`I'll improve the previous content.

Previous request:
${previousMessage || "No previous request found."}

I will make it clearer and more engaging.`

        };

    }




    // =====================================
    // SHORTEN
    // =====================================

    if(

        text.includes("shorter") ||

        text.includes("shorten") ||

        text.includes("summarize")

    ){

        return {

            matched:true,

            response:

`I'll create a shorter version based on:

${previousMessage || "your previous request"}

Keeping the main points clear.`

        };

    }




    // =====================================
    // EXPAND
    // =====================================

    if(

        text.includes("expand") ||

        text.includes("more details") ||

        text.includes("make it longer")

    ){

        return {

            matched:true,

            response:

`I'll expand the previous idea:

${previousMessage || "your previous request"}

Adding more details and examples.`

        };

    }




    // =====================================
    // NO CONTEXT MATCH
    // =====================================

    return {

        matched:false,

        response:null

    };


}




module.exports = {

    handleContextRequest

};
