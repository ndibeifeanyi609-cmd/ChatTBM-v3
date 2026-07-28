// =====================================
// ChatTBM V5.3
// Conversation Memory Engine
// Stores important facts from conversations
// =====================================


// =====================================
// CONVERSATION STORE
// =====================================

const conversationStore = {};




// =====================================
// CREATE USER MEMORY
// =====================================

function createConversation(userId){

    if(!conversationStore[userId]){

        conversationStore[userId] = {

            facts:{},

            timeline:[]

        };

    }

}




// =====================================
// SAVE FACT
// =====================================

function saveFact(
    userId,
    key,
    value
){

    createConversation(userId);


    conversationStore[userId]
    .facts[key] = value;


    return{

        success:true,

        message:"Fact saved"

    };

}




// =====================================
// GET FACT
// =====================================

function getFact(
    userId,
    key
){

    createConversation(userId);


    return(

        conversationStore[userId]
        .facts[key]

        ||

        null

    );

}




// =====================================
// GET ALL FACTS
// =====================================

function getFacts(userId){

    createConversation(userId);


    return conversationStore[userId]
    .facts;

}




// =====================================
// ADD TIMELINE EVENT
// =====================================

function addTimeline(
    userId,
    event
){

    createConversation(userId);


    conversationStore[userId]
    .timeline
    .push({

        event,

        created:
        new Date().toISOString()

    });


}




// =====================================
// GET TIMELINE
// =====================================

function getTimeline(userId){

    createConversation(userId);


    return conversationStore[userId]
    .timeline;

}




// =====================================
// CLEAR CONVERSATION MEMORY
// =====================================

function clearConversationMemory(userId){

    delete conversationStore[userId];


    return{

        success:true,

        message:"Conversation memory cleared"

    };

}




// =====================================
// EXPORT SERVICES
// =====================================

module.exports = {

    saveFact,

    getFact,

    getFacts,

    addTimeline,

    getTimeline,

    clearConversationMemory

};
