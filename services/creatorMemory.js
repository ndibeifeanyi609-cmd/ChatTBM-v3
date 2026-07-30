/* =====================================
   ChatTBM V6.0
   Creator Style Memory

   Upgrade:
   - Better creator preference learning
   - Cinematic style detection
   - Motivational tone detection
   - Content niche memory
   - Personal writing style
===================================== */


const CREATOR_MEMORY_KEY =
"ChatTBM_Creator_Style";




// =====================================
// LOAD MEMORY
// =====================================

function loadCreatorMemory(){


    const saved =
    localStorage.getItem(
        CREATOR_MEMORY_KEY
    );


    if(!saved){

        return {

            tone:"motivational",

            style:"short",

            niche:"creator",

            emoji:true,

            topics:[]

        };

    }



    try{

        return JSON.parse(saved);

    }

    catch(error){

        return {

            tone:"motivational",

            style:"short",

            niche:"creator",

            emoji:true,

            topics:[]

        };

    }


}








// =====================================
// SAVE MEMORY
// =====================================

function saveCreatorMemory(memory){


    localStorage.setItem(

        CREATOR_MEMORY_KEY,

        JSON.stringify(memory)

    );


}









// =====================================
// LEARN FROM MESSAGE
// =====================================

function learnCreatorStyle(message){


    let memory =
    loadCreatorMemory();



    const text =
    message.toLowerCase();







    // Topic memory

    if(

        text.includes("journey") ||

        text.includes("story") ||

        text.includes("building")

    ){

        if(
            !memory.topics.includes("journey")
        ){

            memory.topics.push(
                "journey"
            );

        }

    }








    // Tone detection

    if(

        text.includes("motivational") ||

        text.includes("motivation") ||

        text.includes("success") ||

        text.includes("inspire")

    ){

        memory.tone =
        "motivational";

    }








    // Cinematic style

    if(

        text.includes("cinematic") ||

        text.includes("movie") ||

        text.includes("film")

    ){

        memory.style =
        "cinematic";

    }








    // Short style

    if(

        text.includes("short") ||

        text.includes("brief")

    ){

        memory.style =
        "short";

    }








    // Action creator niche

    if(

        text.includes("action") ||

        text.includes("video") ||

        text.includes("reel")

    ){

        memory.niche =
        "action content creator";

    }






    saveCreatorMemory(memory);


}









// =====================================
// GET STYLE
// =====================================

function getCreatorStyle(){


    return loadCreatorMemory();


}








// =====================================
// CLEAR MEMORY
// =====================================

function clearCreatorMemory(){


    localStorage.removeItem(

        CREATOR_MEMORY_KEY

    );


}








// =====================================
// EXPORT
// =====================================

window.creatorMemory = {


    learn:
    learnCreatorStyle,


    get:
    getCreatorStyle,


    clear:
    clearCreatorMemory


};
