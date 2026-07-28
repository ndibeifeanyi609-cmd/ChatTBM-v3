// =====================================
// ChatTBM V5.0
// Memory Engine
// Handles user preferences and saved memory
// =====================================


const memoryStore = {};


// Save information about a user
function saveMemory(userId, key, value) {

    if (!memoryStore[userId]) {
        memoryStore[userId] = {};
    }

    memoryStore[userId][key] = value;

    return {
        success: true,
        message: "Memory saved"
    };
}



// Get stored information
function getMemory(userId, key) {

    if (
        memoryStore[userId] &&
        memoryStore[userId][key]
    ) {
        return memoryStore[userId][key];
    }

    return null;
}



// Get all user memories
function getAllMemory(userId) {

    if (memoryStore[userId]) {
        return memoryStore[userId];
    }

    return {};
}



// Delete memory
function clearMemory(userId) {

    if (memoryStore[userId]) {
        delete memoryStore[userId];
    }

    return {
        success: true,
        message: "Memory cleared"
    };
}



module.exports = {
    saveMemory,
    getMemory,
    getAllMemory,
    clearMemory
};
