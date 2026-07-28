// =====================================
// ChatTBM V5.4
// Smart Response Engine
// Part 2
// Context Awareness
// =====================================


function handleContextRequest(
    message,
    history = []
){

    const text =
    message.toLowerCase();


    // Get previous user message

    let previousMessage = "";


    if(history.length > 1){

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
    // CONTINUE REQUEST
    // =====================================

    if(
        text.includes("continue") ||
        text.includes("keep going")
    ){

        return {

            matched:true,

            response:
`I'll continue from where we stopped.

Previous topic:
${previousMessage || "our last conversation"}

Let's build on that and improve it further.`

        };

    }



    // =====================================
    // REWRITE REQUEST
    // =====================================

    if(
        text.includes("rewrite") ||
        text.includes("make it better")
    ){

        return {

            matched:true,

            response:
`I'll rewrite and improve the previous content.

Previous content:
${previousMessage || "No previous content found."}

I will make it clearer, stronger, and more engaging.`

        };

    }



    // =====================================
    // SHORTEN REQUEST
    // =====================================

    if(
        text.includes("shorten") ||
        text.includes("make it shorter")
    ){

        return {

            matched:true,

            response:
`I'll create a shorter version based on:

${previousMessage || "your previous request"}

I will keep the main idea while making it concise.`

        };

    }



    // =====================================
    // EXPAND REQUEST
    // =====================================

    if(
        text.includes("expand") ||
        text.includes("make it longer")
    ){

        return {

            matched:true,

            response:
`I'll expand the previous idea with more details:

${previousMessage || "your previous request"}

I will add more explanation and examples.`

        };

    }



    return {

        matched:false,

        response:null

    };

}



module.exports = {

    handleContextRequest

};
