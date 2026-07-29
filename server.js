// =====================================
// ChatTBM Backend V5.7
// Part 1
// Core Setup + AI Engine Connections
// =====================================

require("dotenv").config();

// =====================================
// IMPORT PACKAGES
// =====================================

const express = require("express");
const cors = require("cors");

// =====================================
// AI ENGINES
// =====================================

// Intent Engine
const {
    detectIntent
} = require("./services/intentEngine");

// Response Engine
const {
    generateResponse
} = require("./services/respondEngine");

// Memory Engine
const {
    saveMemory,
    getMemory,
    getAllMemory,
    addMemoryNote,
    clearMemory
} = require("./services/memoryEngine");

// Memory Learning Engine
const {
    learnFromMessage
} = require("./services/memoryLearning");

// Conversation Memory Engine
const {
    saveFact,
    getFact,
    getFacts,
    addTimeline,
    getTimeline,
    clearConversationMemory
} = require("./services/conversationMemory");

// Memory Retrieval Engine
const {
    retrieveMemory
} = require("./services/memoryRetrieval");

// =====================================
// PERSONAL AI ENGINES
// =====================================

const AIIdentityEngine =
require("./services/aiIdentityEngine");

const AdaptiveResponseEngine =
require("./services/adaptiveResponseEngine");

const identityEngine =
new AIIdentityEngine();

const adaptiveEngine =
new AdaptiveResponseEngine(identityEngine);

// =====================================
// CREATE SERVER
// =====================================

const app = express();

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

// =====================================
// CONVERSATION HISTORY
// =====================================

const conversations = {};

const MAX_HISTORY = 30;

// =====================================
// CREATE CONVERSATION
// =====================================

function createConversation(conversationId) {

    if (!conversations[conversationId]) {

        conversations[conversationId] = [];

    }

}

// =====================================
// SAVE MESSAGE
// =====================================

function saveMessage(
    conversationId,
    role,
    message
) {

    createConversation(conversationId);

    conversations[conversationId].push({

        role,
        message,
        timestamp: new Date().toISOString()

    });

    if (
        conversations[conversationId].length >
        MAX_HISTORY
    ) {

        conversations[conversationId] =
        conversations[conversationId]
        .slice(-MAX_HISTORY);

    }

}

// =====================================
// GET CONVERSATION
// =====================================

function getConversation(conversationId) {

    createConversation(conversationId);

    return conversations[conversationId];

}

// =====================================
// ChatTBM Backend V5.7
// Part 2
// Health Check + Chat API
// =====================================

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

    res.json({

        app: "ChatTBM Backend",

        version: "5.7",

        status: "Running ✅",

        engines: {

            intent: "Active 🧠",

            response: "Active 💬",

            memory: "Active 💾",

            learning: "Active 📚",

            conversation: "Active 📝",

            identity: "Active 👤",

            adaptiveAI: "Active 🤖"

        },

        uptime: process.uptime(),

        conversations:
        Object.keys(conversations).length

    });

});

// =====================================
// CHAT API
// =====================================

app.post("/api/chat", (req, res) => {

    try {

        const message =
        req.body.message;

        const conversationId =
        req.body.conversationId ||
        "guest-user";

        // =============================
        // VALIDATION
        // =============================

        if (

            !message ||

            typeof message !== "string" ||

            message.trim() === ""

        ) {

            return res.status(400).json({

                success: false,

                reply:
                "Please enter a message."

            });

        }

        // =============================
        // SAVE USER MESSAGE
        // =============================

        saveMessage(

            conversationId,

            "user",

            message

        );

        // =============================
        // MEMORY LEARNING
        // =============================

        learnFromMessage(

            conversationId,

            message

        );

        // =============================
        // PERSONAL AI LEARNING
        // =============================

        identityEngine.learn(

            conversationId,

            message

        );

        // =============================
        // SAVE CONVERSATION FACT
        // =============================

        saveFact(

            conversationId,

            "lastMessage",

            message

        );

        // =============================
        // ADD TIMELINE EVENT
        // =============================

        addTimeline(

            conversationId,

            "User: " + message

        );

        // =============================
        // LOAD CHAT HISTORY
        // =============================

        const history =
        getConversation(
            conversationId
        );

        // =============================
        // DETECT USER INTENT
        // =============================

        const intent =
        detectIntent(
            message
        );

        // =============================
        // LOAD USER MEMORY
        // =============================

        const userMemory =
        getAllMemory(
            conversationId
        );

        // =============================
        // RETRIEVE RELEVANT MEMORY
        // =============================

        const memory =
        retrieveMemory(

            userMemory,

            message

        );

        // =============================
        // LOAD CONVERSATION FACTS
        // =============================

        const facts =
        getFacts(
            conversationId
        );

        // =============================
        // LOAD TIMELINE
        // =============================

        const timeline =
        getTimeline(
            conversationId
        );

        // =============================
        // BUILD PERSONAL AI CONTEXT
        // =============================

        const aiContext =
        adaptiveEngine.personalize(

            conversationId,

            message

        );

        // =============================
        // GENERATE AI RESPONSE
        // =============================

        const reply =
generateResponse(

    intent,

    message,

    memory,

    history,

    facts,

    timeline,

    aiContext

);

        // =============================
        // SAVE AI RESPONSE
        // =============================

        saveMessage(

            conversationId,

            "assistant",

            reply

        );

        // =============================
        // ADD AI RESPONSE TO TIMELINE
        // =============================

        addTimeline(

            conversationId,

            "Assistant replied"

        );

        // =============================
        // SEND RESPONSE
        // =============================

        return res.json({

            success: true,

            reply,

            intent,

            memory,

            facts,

            timeline,

            aiContext,

            conversationId,

            historyLength:
            history.length

        });

    }

    catch (error) {

        console.error(

            "ChatTBM Error:",

            error

        );

        return res.status(500).json({

            success: false,

            reply:
            "Something went wrong. Please try again."

        });

    }

});

// =====================================
// ChatTBM Backend V5.7
// Part 4
// Error Handling + Server Startup
// =====================================

// =====================================
// 404 ROUTE HANDLER
// =====================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "Route not found."

    });

});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {

    console.error(

        "Server Error:",

        err

    );

    res.status(500).json({

        success: false,

        error: "Internal Server Error."

    });

});

// =====================================
// START SERVER
// =====================================

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");

    console.log("====================================");
    console.log("      ChatTBM Backend V5.7");
    console.log("====================================");

    console.log(`🚀 Server running on port ${PORT}`);

    console.log("");

    console.log("🧠 Intent Engine ............. Active");
    console.log("💬 Response Engine ........... Active");
    console.log("💾 Memory Engine ............. Active");
    console.log("📚 Memory Learning ........... Active");
    console.log("📝 Conversation Memory ....... Active");
    console.log("👤 AI Identity Engine ........ Active");
    console.log("🤖 Adaptive AI Engine ........ Active");

    console.log("");

    console.log("✅ ChatTBM Backend Ready");

    console.log("====================================");
    console.log("");

});
