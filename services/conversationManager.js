/* =====================================
   ChatTBM V5.9.4.1
   Conversation Manager

   Purpose:
   - Store conversation history
   - Retrieve history
   - Clear history
   - Prepare for Memory Engine
===================================== */

const CHAT_HISTORY_KEY = "ChatTBM_Conversation_History";



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

    const history =
    loadConversationHistory();



    history.push({

        role: role,

        message: message,

        time: Date.now()

    });



    // Keep last 20 messages

    if(history.length > 20){

        history.shift();

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

    clear:
    clearConversationHistory

};
