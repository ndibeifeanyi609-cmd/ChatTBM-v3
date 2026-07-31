// =====================================
// ChatTBM V6.2
// Profile Learning Bridge
// Connects:
// User Profile
// Memory Brain
// Learning Engine
// =====================================



const {

    updateProfile,

    addInterest

} = require("./userProfileEngine");



const {

    saveMemory

} = require("./memoryEngine");




// =====================================
// PROCESS LEARNED USER INFORMATION
// =====================================

function processLearning(

    userId,

    learning

){


    if(!learning){

        return null;

    }



    const profileUpdates = {};





    // ===============================
    // CREATOR NICHE
    // ===============================

    if(

        learning.niche

    ){


        profileUpdates.niche =

        learning.niche;



        saveMemory(

            userId,

            "creator_niche",

            learning.niche,

            {

                score:30,

                level:"LONG_TERM"

            }

        );


    }





    // ===============================
    // WRITING STYLE
    // ===============================

    if(

        learning.style

    ){


        profileUpdates.writingStyle =

        learning.style;



        saveMemory(

            userId,

            "writing_style",

            learning.style,

            {

                score:40,

                level:"LONG_TERM"

            }

        );


    }





    // ===============================
    // RESPONSE PREFERENCE
    // ===============================

    if(

        learning.preference

    ){


        profileUpdates.responsePreference =

        learning.preference;



        saveMemory(

            userId,

            "response_preference",

            learning.preference,

            {

                score:25,

                level:"LONG_TERM"

            }

        );


    }





    // ===============================
    // INTERESTS
    // ===============================

    if(

        learning.interest

    ){


        addInterest(

            userId,

            learning.interest

        );


    }





    return updateProfile(

        userId,

        profileUpdates

    );


}





// =====================================
// ANALYZE FEEDBACK TEXT
// =====================================

function analyzeUserFeedback(

    userId,

    feedback

){


    const text =

    feedback.toLowerCase();



    const learning = {};





    if(

        text.includes("cinematic")

    ){

        learning.style =

        "cinematic";

    }





    if(

        text.includes("short")

    ){

        learning.preference =

        "short responses";

    }





    if(

        text.includes("long") ||

        text.includes("detailed")

    ){

        learning.preference =

        "detailed responses";

    }





    if(

        text.includes("action")

    ){

        learning.niche =

        "action content";


        learning.interest =

        "action videos";

    }





    return processLearning(

        userId,

        learning

    );


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    processLearning,

    analyzeUserFeedback


};
