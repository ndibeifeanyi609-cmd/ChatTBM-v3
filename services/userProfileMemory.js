/* =====================================
   ChatTBM V5.9.8
   User Profile Memory

   Purpose:
   - Store creator identity
   - Remember preferences
   - Build personalized AI responses
===================================== */


const USER_PROFILE_KEY =
"ChatTBM_User_Profile";




// =====================================
// LOAD PROFILE
// =====================================

function loadUserProfile(){


    const saved =

    localStorage.getItem(
        USER_PROFILE_KEY
    );


    if(!saved){

        return {

            name:"",
            niche:"",
            tone:"motivational",
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
// SAVE PROFILE
// =====================================

function saveUserProfile(profile){


    localStorage.setItem(

        USER_PROFILE_KEY,

        JSON.stringify(profile)

    );


}







// =====================================
// LEARN USER INFORMATION
// =====================================

function learnUserProfile(message){


    const profile =
    loadUserProfile();


    const text =
    message.toLowerCase();





    // Detect niche

    if(

        text.includes("action") ||

        text.includes("fight") ||

        text.includes("cinematic")

    ){

        profile.niche =
        "action content";

    }





    // Detect motivational style

    if(

        text.includes("motivational") ||

        text.includes("journey") ||

        text.includes("success")

    ){

        profile.tone =
        "motivational";

    }





    // Save topics

    if(
        text.includes("journey")
    ){

        profile.topics.push(
            "journey"
        );

    }





    saveUserProfile(profile);


}







// =====================================
// GET PROFILE
// =====================================

function getUserProfile(){


    return loadUserProfile();


}







// =====================================
// EXPORT
// =====================================

window.userProfileMemory = {


    learn:
    learnUserProfile,


    get:
    getUserProfile


};
