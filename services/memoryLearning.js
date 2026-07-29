
// =====================================
// ChatTBM V5.6
// Memory Learning Engine
// Part 4
// User Profile Integration
// =====================================



const {

    saveMemory

} = require("./memoryEngine");



const {

    updatePreference,

    addInterest,

    addGoal,

    addProfileHistory

} = require("./userProfile");




// =====================================
// LEARN FROM USER MESSAGE
// =====================================

function learnFromMessage(

    userId,

    message

){


    const text =
    message.toLowerCase();




    // =================================
    // CONTENT PLATFORM DETECTION
    // =================================


    if(text.includes("youtube")){


        saveMemory(

            userId,

            "platform",

            "YouTube"

        );


        updatePreference(

            userId,

            "platform",

            "YouTube"

        );


    }



    if(text.includes("tiktok")){


        saveMemory(

            userId,

            "platform",

            "TikTok"

        );


        updatePreference(

            userId,

            "platform",

            "TikTok"

        );


    }



    if(text.includes("instagram")){


        saveMemory(

            userId,

            "platform",

            "Instagram"

        );


        updatePreference(

            userId,

            "platform",

            "Instagram"

        );


    }





    // =================================
    // STYLE DETECTION
    // =================================


    if(text.includes("cinematic")){


        saveMemory(

            userId,

            "contentStyle",

            "Cinematic"

        );


        updatePreference(

            userId,

            "style",

            "Cinematic"

        );


    }




    if(text.includes("funny")){


        saveMemory(

            userId,

            "contentStyle",

            "Funny"

        );


        addInterest(

            userId,

            "Comedy Content"

        );


    }





    // =================================
    // GOAL DETECTION
    // =================================


    if(

        text.includes("viral")

    ){


        addGoal(

            userId,

            "Create viral content"

        );


    }





    if(

        text.includes("business") ||

        text.includes("marketing")

    ){


        addGoal(

            userId,

            "Grow business with content"

        );


    }






    // =================================
    // SAVE HISTORY
    // =================================


    addProfileHistory(

        userId,

        message

    );





    return {

        success:true,

        message:
        "User profile updated"

    };


}





module.exports = {


    learnFromMessage


};
