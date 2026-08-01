// =====================================
// ChatTBM V6.7
// Brand Voice Engine
//
// Purpose:
// - Learn creator communication style
// - Maintain creator tone
// =====================================


const brandVoices = {};




// =====================================
// CREATE VOICE
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

            audienceConnection:"",

            updatedAt:new Date()


        };


    }



    return brandVoices[userId];


}






// =====================================
// LEARN VOICE
// =====================================

function learnBrandVoice(

    userId,

    content

){


    const text =

    String(content || "")

    .toLowerCase();



    const voice =

    createBrandVoice(userId);






    if(

        text.includes("journey") ||

        text.includes("growth") ||

        text.includes("never give up")

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






    if(

        text.includes("cinematic") ||

        text.includes("story")

    ){

        voice.style =

        "Storytelling";


    }






    if(

        text.includes("action") ||

        text.includes("epic")

    ){

        voice.energy =

        "High";


    }





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





    voice.emotions =

    [

        ...new Set(

            voice.emotions

        )

    ];





    voice.updatedAt =

    new Date();



    return voice;


}






// =====================================
// APPLY VOICE
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

        `Write using ${voice.tone || "natural"} tone with ${voice.style || "clear"} style.`


    };


}






function getBrandVoice(userId){


    return createBrandVoice(userId);


}






module.exports = {


    createBrandVoice,

    learnBrandVoice,

    applyBrandVoice,

    getBrandVoice


};
