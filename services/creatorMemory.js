/* =====================================
   ChatTBM V6.0.2
   Creator Style Memory Engine

   Purpose:
   - Learn creator preferences
   - Remember writing style
   - Store content direction
   - Support Creator Brain
===================================== */


const CREATOR_MEMORY_KEY =
"ChatTBM_Creator_Style";




// =====================================
// DEFAULT MEMORY
// =====================================

function defaultCreatorMemory(){

    return {

        tone:"motivational",

        style:"short",

        niche:"creator",

        emoji:true,

        topics:[],

        keywords:[]

    };

}






// =====================================
// LOAD MEMORY
// =====================================

function loadCreatorMemory(){


    const saved =

    localStorage.getItem(
        CREATOR_MEMORY_KEY
    );



    if(!saved){

        return defaultCreatorMemory();

    }




    try{


        return {

            ...defaultCreatorMemory(),

            ...JSON.parse(saved)

        };


    }


    catch(error){


        return defaultCreatorMemory();


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
// LEARN CREATOR STYLE
// =====================================

function learnCreatorStyle(message){


    let memory =
    loadCreatorMemory();



    const text =
    message.toLowerCase();







    // ===============================
    // TONE DETECTION
    // ===============================


    if(

        text.includes("motivation") ||

        text.includes("motivational") ||

        text.includes("success") ||

        text.includes("inspire") ||

        text.includes("journey")

    ){

        memory.tone =
        "motivational";


    }







    // ===============================
    // CINEMATIC STYLE
    // ===============================


    if(

        text.includes("cinematic") ||

        text.includes("movie") ||

        text.includes("film") ||

        text.includes("realistic")

    ){

        memory.style =
        "cinematic";


    }







    // ===============================
    // SHORT STYLE
    // ===============================


    if(

        text.includes("short") ||

        text.includes("brief") ||

        text.includes("caption")

    ){

        memory.style =
        "short";


    }







    // ===============================
    // CREATOR NICHE
    // ===============================


    if(

        text.includes("video") ||

        text.includes("reel") ||

        text.includes("creator") ||

        text.includes("content")

    ){

        memory.niche =
        "content creator";


    }







    // ===============================
    // TOPIC MEMORY
    // ===============================


    const topics = [

        "journey",

        "story",

        "building",

        "success",

        "action",

        "cinematic"

    ];





    topics.forEach(topic=>{


        if(

            text.includes(topic) &&

            !memory.topics.includes(topic)

        ){

            memory.topics.push(topic);

        }


    });








    // ===============================
    // KEYWORD MEMORY
    // ===============================


    if(

        message.trim() !== ""

    ){


        memory.keywords.push(message);


    }







    // Keep memory clean

    if(memory.keywords.length > 20){


        memory.keywords.shift();


    }







    saveCreatorMemory(memory);


}









// =====================================
// GET MEMORY
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
