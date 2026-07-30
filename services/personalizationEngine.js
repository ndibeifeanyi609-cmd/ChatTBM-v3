/* =====================================
   ChatTBM V6.0.2
   Personalization Engine

   Purpose:
   - Combine User Profile Memory
   - Combine Creator Style Memory
   - Build creator identity
   - Personalize AI responses
===================================== */



// =====================================
// GET PERSONAL PROFILE
// =====================================


function getPersonalization(){


    let profile = {};

    let creator = {};




    // Get user profile memory

    if(

        window.userProfileMemory &&

        typeof window.userProfileMemory.get === "function"

    ){

        profile =
        window.userProfileMemory.get();

    }





    // Get creator memory

    if(

        window.creatorMemory &&

        typeof window.creatorMemory.get === "function"

    ){

        creator =
        window.creatorMemory.get();

    }






    return {


        name:
        profile.name || "",


        niche:
        profile.niche || creator.niche || "content creator",


        tone:
        creator.tone || profile.tone || "motivational",


        style:
        creator.style || "short",


        topics:
        creator.topics || []


    };


}









// =====================================
// APPLY PERSONAL STYLE
// =====================================


function personalizeResponse(response){


    const memory =
    getPersonalization();





    let result =
    response;





    // Cinematic enhancement


    if(

        memory.style === "cinematic"

    ){


        if(
            !result.includes("🎬")
        ){

            result =
            "🎬 " + result;

        }


    }







    // Motivational enhancement


    if(

        memory.tone === "motivational"

    ){


        if(
            !result.includes("🔥")
        ){

            result =
            "🔥 " + result;

        }


    }






    return result;


}









// =====================================
// CREATOR SUMMARY
// =====================================


function getCreatorIdentity(){


    const memory =
    getPersonalization();



    return {


        niche:
        memory.niche,


        writingStyle:
        memory.style,


        tone:
        memory.tone,


        interests:
        memory.topics


    };


}









// =====================================
// EXPORT
// =====================================


window.personalizationEngine = {


    get:
    getPersonalization,


    apply:
    personalizeResponse,


    identity:
    getCreatorIdentity


};
