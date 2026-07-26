// =====================================
// ChatTBM V4.5
// Part 5 - User Account System
// =====================================


// =============================
// USER STORAGE
// =============================

const ChatTBM_User = {


    name:"",


    email:"",


    loggedIn:false,


};







// =============================
// CREATE USER
// =============================

function createUser(name,email){


    ChatTBM_User.name = name;


    ChatTBM_User.email = email;


    ChatTBM_User.loggedIn = true;



    localStorage.setItem(

        "ChatTBM_User",

        JSON.stringify(ChatTBM_User)

    );



    return ChatTBM_User;


}







// =============================
// LOAD USER
// =============================

function loadUser(){


    const saved =

    localStorage.getItem(

        "ChatTBM_User"

    );



    if(saved){


        Object.assign(

            ChatTBM_User,

            JSON.parse(saved)

        );


    }


}







// =============================
// LOGOUT
// =============================

function logoutUser(){


    ChatTBM_User.loggedIn = false;


    localStorage.removeItem(

        "ChatTBM_User"

    );


}







// =============================
// GET USER
// =============================

function getCurrentUser(){


    return ChatTBM_User;


}







// =============================
// ACCOUNT STATUS
// =============================

function checkUser(){


    console.log(

        "👤 ChatTBM User:",

        ChatTBM_User

    );


}






// Start User System

loadUser();


checkUser();





console.log(
"✅ ChatTBM V4.5 User System Ready"
);
