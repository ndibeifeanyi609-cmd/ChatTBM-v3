// =====================================
// ChatTBM V9.9
// Creator Profile Auto Learning Engine
//
// Upgrade:
// - Builds creator identity
// - Extracts creator information
// - Converts conversations into profile data
// - Combines creator memories
// - Creates creator profile
// - Uses MemoryEngine data
// - Prepares personalized responses
// =====================================



const CreatorProfileEngine = {


    name: "Creator Profile Intelligence",


    version: "9.9"


};







// =====================================
// EXTRACT CREATOR INFORMATION
// =====================================


function extractCreatorInformation(message){


    try{


        if(

            !window.ChatTBMMemory ||

            !window.ChatTBMMemory.saveMemory

        ){

            return;

        }







        const text =

        message.toLowerCase();







        // Creator identity


        if(

            text.includes("i create") ||

            text.includes("i am a creator") ||

            text.includes("content creator")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_identity",

                "content creator",

                "high"

            );


        }







        // Fitness niche


        if(

            text.includes("fitness") ||

            text.includes("workout") ||

            text.includes("gym")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_niche",

                "fitness",

                "high"

            );


            window.ChatTBMMemory.saveMemory(

                "creator_interest",

                "fitness",

                "high"

            );


        }







        // Platform


        if(

            text.includes("instagram")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_platform",

                "Instagram",

                "medium"

            );


        }


        else if(

            text.includes("youtube")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_platform",

                "YouTube",

                "medium"

            );


        }







        // Growth goal


        if(

            text.includes("grow") ||

            text.includes("followers") ||

            text.includes("reach")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_goal",

                "growth",

                "high"

            );


        }







        // Monetization goal


        if(

            text.includes("sell") ||

            text.includes("customers") ||

            text.includes("money")

        ){


            window.ChatTBMMemory.saveMemory(

                "creator_goal",

                "monetization",

                "high"

            );


        }


    }


    catch(error){


        console.error(

            "Creator Extraction Error:",

            error

        );


    }


}







// =====================================
// BUILD CREATOR PROFILE
// =====================================


function buildCreatorProfile(){



    try{


        if(

            !window.ChatTBMMemory ||

            !window.ChatTBMMemory.getMemories

        ){


            return null;


        }







        const memories =

        window.ChatTBMMemory.getMemories();







        const profile = {


            identity:"",


            niche:"",


            platform:"",


            goal:"",


            interests:[],


            strategy:""


        };







        memories.forEach(memory=>{



            switch(memory.type){





                case "creator_identity":


                    profile.identity = memory.value;


                    break;





                case "creator_niche":


                    profile.niche = memory.value;


                    break;





                case "creator_platform":


                    profile.platform = memory.value;


                    break;





                case "creator_goal":


                    profile.goal = memory.value;


                    break;





                case "creator_interest":


                    profile.interests.push(memory.value);


                    break;





                case "creator_strategy":


                    profile.strategy = memory.value;


                    break;



            }



        });







        return profile;



    }


    catch(error){


        console.error(

            "Creator Profile Error:",

            error

        );


        return null;


    }


}







// =====================================
// CREATE PROFILE SUMMARY
// =====================================


function getCreatorSummary(){



    const profile =

    buildCreatorProfile();





    if(!profile){

        return "";

    }







    let summary =

    "Creator Profile:\n";







    if(profile.identity)

        summary +=

        "- Identity: " +

        profile.identity +

        "\n";







    if(profile.niche)

        summary +=

        "- Niche: " +

        profile.niche +

        "\n";







    if(profile.platform)

        summary +=

        "- Platform: " +

        profile.platform +

        "\n";







    if(profile.goal)

        summary +=

        "- Goal: " +

        profile.goal +

        "\n";







    if(profile.interests.length)

        summary +=

        "- Interests: " +

        profile.interests.join(", ") +

        "\n";







    return summary;


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorProfile = {


    extractCreatorInformation,

    buildCreatorProfile,

    getCreatorSummary


};







console.log(

"🎯 ChatTBM V9.9 Creator Profile Auto Learning Engine Loaded"

);
