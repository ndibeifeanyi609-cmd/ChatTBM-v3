/* =====================================
   ChatTBM V6.0.2
   User Profile Memory Engine

   Purpose:
   - Store creator identity
   - Learn user preferences
   - Build personalized responses
   - Prepare for account memory
===================================== */


const USER_PROFILE_KEY =
"ChatTBM_User_Profile";




// =====================================
// DEFAULT PROFILE
// =====================================

function defaultUserProfile(){


    return {

        name:"",

        niche:"",

        tone:"motivational",

        style:"",

        interests:[],

        goals:[]


    };


}








// =====================================
// LOAD PROFILE
// =====================================

function loadUserProfile(){


    const saved =

    localStorage.getItem(
        USER_PROFILE_KEY
    );



    if(!saved){

        return defaultUserProfile();

    }




    try{


        return {

            ...defaultUserProfile(),

            ...JSON.parse(saved)

        };


    }

    catch(error){


        return defaultUserProfile();


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
// LEARN USER PROFILE
// =====================================

function learnUserProfile(message){


    let profile =
    loadUserProfile();



    const text =
    message.toLowerCase();







    // ===============================
    // CONTENT NICHE
    // ===============================


    if(

        text.includes("action") ||

        text.includes("fight") ||

        text.includes("cinematic")

    ){

        profile.niche =
        "action content creator";


    }






    if(

        text.includes("video") ||

        text.includes("reel") ||

        text.includes("content")

    ){

        profile.niche =
        "content creator";


    }








    // ===============================
    // TONE
    // ===============================


    if(

        text.includes("motivation") ||

        text.includes("motivational") ||

        text.includes("journey") ||

        text.includes("success")

    ){

        profile.tone =
        "motivational";


    }








    // ===============================
    // STYLE
    // ===============================


    if(

        text.includes("cinematic")

    ){

        profile.style =
        "cinematic";


    }






    if(

        text.includes("short")

    ){

        profile.style =
        "short";


    }








    // ===============================
    // INTEREST MEMORY
    // ===============================


    const interests = [

        "journey",

        "story",

        "building",

        "legacy",

        "creator"

    ];





    interests.forEach(item=>{


        if(

            text.includes(item) &&

            !profile.interests.includes(item)

        ){

            profile.interests.push(item);

        }


    });








    saveUserProfile(profile);


}









// =====================================
// GET PROFILE
// =====================================

function getUserProfile(){


    return loadUserProfile();


}









// =====================================
// CLEAR PROFILE
// =====================================

function clearUserProfile(){


    localStorage.removeItem(

        USER_PROFILE_KEY

    );


}









// =====================================
// EXPORT
// =====================================

window.userProfileMemory = {


    learn:
    learnUserProfile,


    get:
    getUserProfile,


    clear:
    clearUserProfile


};
