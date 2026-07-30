/* =====================================
   ChatTBM V5.9.9
   Creator Memory Engine

   Purpose:
   - Learn creator preferences
   - Store writing style
   - Remember content direction
   - Prepare for long-term memory
===================================== */


const CREATOR_MEMORY_KEY =
"ChatTBM_Creator_Memory";




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

            tone:"",
            niche:"",
            style:"",
            keywords:[]

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


    const text =
    message.toLowerCase();



    let memory =
    loadCreatorMemory();






    // Detect tone

    if(

        text.includes("motivation") ||

        text.includes("journey") ||

        text.includes("success")

    ){

        memory.tone =
        "motivational";

    }







    // Detect content niche

    if(

        text.includes("video") ||

        text.includes("reel") ||

        text.includes("creator")

    ){

        memory.niche =
        "content creator";

    }







    // Detect style

    if(

        text.includes("cinematic")

    ){

        memory.style =
        "cinematic";

    }







    memory.keywords.push(message);




    // Keep memory clean

    if(memory.keywords.length > 20){

        memory.keywords.shift();

    }




    saveCreatorMemory(memory);


}









// =====================================
// GET MEMORY
// =====================================

function getCreatorMemory(){


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
    getCreatorMemory,


    clear:
    clearCreatorMemory


};
