// =====================================
// ChatTBM V6.7
// Brand Voice Engine
//
// Purpose:
// - Learn creator writing style
// - Maintain consistent tone
// - Generate voice profile
// =====================================



// Temporary memory storage
// Later connects to database

const brandVoices = {};




// =====================================
// CREATE DEFAULT VOICE
// =====================================

function createBrandVoice(userId){


    if(!brandVoices[userId]){


        brandVoices[userId] = {


            tone:"",

            style:"",

            energy:"",

            emotions:[],


            commonWords:[],


            writingPattern:"",


            audienceConnection:""



        };


    }



    return brandVoices[userId];


}






// =====================================
// LEARN BRAND VOICE
// =====================================

function learnBrandVoice(

    userId,

    content

){


    const text =

    String(content)

    .toLowerCase();



    const voice =

    createBrandVoice(userId);





    // ===============================
    // TONE
    // ===============================


    if(

        text.includes("never give up") ||

        text.includes("keep pushing") ||

        text.includes("journey")

    ){

        voice.tone =

        "Motivational";


    }




    if(

        text.includes("funny") ||

        text.includes("crazy") ||

        text.includes("laugh")

    ){

        voice.tone =

        "Funny";


    }





    // ===============================
    // STYLE
    // ===============================


    if(

        text.includes("cinematic") ||

        text.includes("story")

    ){

        voice.style =

        "Storytelling";


    }





    if(

        text.includes("fast") ||

        text.includes("action")

    ){

        voice.style =

        "High Energy";


    }






    // ===============================
    // ENERGY
    // ===============================


    if(

        text.includes("🔥") ||

        text.includes("!") ||

        text.includes("epic")

    ){

        voice.energy =

        "High";


    }





    // ===============================
    // EMOTION MEMORY
    // ===============================


    if(

        text.includes("struggle")

    ){

        voice.emotions.push(

            "Determination"

        );

    }



    if(

        text.includes("success")

    ){

        voice.emotions.push(

            "Achievement"

        );

    }





    // Remove duplicates

    voice.emotions =

    [...new Set(

        voice.emotions

    )];





    return voice;


}







// =====================================
// APPLY BRAND VOICE
// =====================================

function applyBrandVoice(

    userId,

    text

){


    const voice =

    createBrandVoice(userId);



    return {


        original:text,


        voice,


        instruction:

        `Write using a ${voice.tone || "natural"} tone with ${voice.style || "clear"} style.`


    };


}







// =====================================
// GET VOICE
// =====================================

function getBrandVoice(userId){


    return createBrandVoice(userId);


}






// =====================================
// EXPORT
// =====================================

module.exports = {


    createBrandVoice,


    learnBrandVoice,


    applyBrandVoice,


    getBrandVoice


};
