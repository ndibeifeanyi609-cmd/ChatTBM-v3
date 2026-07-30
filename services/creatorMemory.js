/* =====================================
   ChatTBM V5.9.7
   Creator Style Memory

   Purpose:
   - Store creator preferences
   - Remember writing style
   - Learn from interactions
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

            emoji:true,

            topics:[]

        };

    }



    try{

        return JSON.parse(saved);

    }

    catch(error){

        return {};

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


    const memory =
    loadCreatorMemory();



    const text =
    message.toLowerCase();




    if(

        text.includes("journey") ||

        text.includes("story") ||

        text.includes("building")

    ){

        memory.topics.push(
            "journey"
        );

    }






    if(

        text.includes("motivational") ||

        text.includes("inspire")

    ){

        memory.tone =
        "motivational";

    }






    if(

        text.includes("short")

    ){

        memory.style =
        "short";

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
// EXPORT
// =====================================

window.creatorMemory = {

    learn:
    learnCreatorStyle,

    get:
    getCreatorStyle

};
