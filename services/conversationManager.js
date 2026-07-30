/* =====================================
   ChatTBM V6.0.1
   Conversation Manager

   Upgrade:
   - Better conversation storage
   - Context Engine ready
   - Memory Engine ready
   - Cleaner history handling
   - Future User Profile support
===================================== */


const CHAT_HISTORY_KEY =
"ChatTBM_Conversation_History";




// =====================================
// LOAD HISTORY
// =====================================

function loadConversationHistory(){


    const saved =

    localStorage.getItem(
        CHAT_HISTORY_KEY
    );



    if(!saved){

        return [];

    }



    try{

        return JSON.parse(saved);

    }

    catch(error){

        console.log(
            "History load error:",
            error
        );

        return [];

    }


}







// =====================================
// SAVE HISTORY
// =====================================

function saveConversationHistory(history){


    localStorage.setItem(

        CHAT_HISTORY_KEY,

        JSON.stringify(history)

    );


}







// =====================================
// ADD MESSAGE
// =====================================

function addConversationMessage(

    role,

    message

){


    let history =

    loadConversationHistory();





    history.push({

        role: role,

        message: message,

        timestamp:
        new Date().toISOString()


    });






    // Keep memory clean

    if(history.length > 50){

        history =
        history.slice(-50);

    }





    saveConversationHistory(
        history
    );


}







// =====================================
// GET HISTORY
// =====================================

function getConversationHistory(){


    return loadConversationHistory();


}







// =====================================
// GET LAST MESSAGE
// =====================================

function getLastMessage(){


    const history =
    loadConversationHistory();



    if(history.length === 0){

        return null;

    }



    return history[
        history.length - 1
    ];


}







// =====================================
// CLEAR HISTORY
// =====================================

function clearConversationHistory(){


    localStorage.removeItem(

        CHAT_HISTORY_KEY

    );


}







// =====================================
// EXPORT
// =====================================


window.conversationManager = {


    addMessage:

    addConversationMessage,


    getHistory:

    getConversationHistory,


    getLast:

    getLastMessage,


    clear:

    clearConversationHistory


};



// Global clear shortcut

window.clearChatTBM =
clearConversationHistory;
