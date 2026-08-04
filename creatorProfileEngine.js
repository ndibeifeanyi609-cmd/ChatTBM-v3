// =====================================
// ChatTBM V9.7
// Creator Profile Intelligence Engine
//
// Upgrade:
// - Builds creator identity
// - Combines creator memories
// - Creates creator profile
// - Uses MemoryEngine data
// - Prepares personalized responses
// =====================================



const CreatorProfileEngine = {


    name: "Creator Profile Intelligence",


    version: "9.7"


};







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


                    profile.identity =

                    memory.value;


                    break;





                case "creator_niche":


                    profile.niche =

                    memory.value;


                    break;





                case "creator_platform":


                    profile.platform =

                    memory.value;


                    break;





                case "creator_goal":


                    profile.goal =

                    memory.value;


                    break;





                case "creator_interest":


                    profile.interests.push(

                        memory.value

                    );


                    break;





                case "creator_strategy":


                    profile.strategy =

                    memory.value;


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







    if(profile.identity){


        summary +=

        "- Identity: " +

        profile.identity +

        "\n";


    }







    if(profile.niche){


        summary +=

        "- Niche: " +

        profile.niche +

        "\n";


    }







    if(profile.platform){


        summary +=

        "- Platform: " +

        profile.platform +

        "\n";


    }







    if(profile.goal){


        summary +=

        "- Goal: " +

        profile.goal +

        "\n";


    }







    if(profile.interests.length){


        summary +=

        "- Interests: " +

        profile.interests.join(", ") +

        "\n";


    }







    if(profile.strategy){


        summary +=

        "- Strategy: " +

        profile.strategy +

        "\n";


    }







    return summary;


}







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorProfile = {


    buildCreatorProfile,


    getCreatorSummary


};







console.log(

"🎯 ChatTBM V9.7 Creator Profile Intelligence Loaded"

);
