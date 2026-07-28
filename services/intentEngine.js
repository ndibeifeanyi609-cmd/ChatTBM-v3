// =====================================
// ChatTBM V5.0
// services/memoryEngine.js
// Conversation Memory Engine
// =====================================

// Store conversations in memory
const conversations = {};

// =====================================
// CREATE CONVERSATION
// =====================================

function createConversation(conversationId) {

    if (!conversations[conversationId]) {

        conversations[conversationId] = [];

    }

}

// =====================================
// LOAD CONVERSATION
// =====================================

function loadConversation(conversationId) {

    createConversation(conversationId);

    return conversations[conversationId];

}

// =====================================
// SAVE CONVERSATION
// =====================================

function saveConversation(conversationId, userMessage, assistantReply) {

    createConversation(conversationId);

    conversations[conversationId].push({

        user: userMessage,
        assistant: assistantReply,
        timestamp: Date.now()

    });

    // Keep only the latest 20 messages
    if (conversations[conversationId].length > 20) {

        conversations[conversationId].shift();

    }

}

// =====================================
// CLEAR CONVERSATION
// =====================================

function clearConversation(conversationId) {

    conversations[conversationId] = [];

}

// =====================================
// EXPORT
// =====================================

module.exports = {

    loadConversation,
    saveConversation,
    clearConversation

};
