// =====================================
// ChatTBM Backend V2.0
// Part 1/3
// Core Server + Conversation Memory
// =====================================

require("dotenv").config();

// =====================================
// ChatTBM V5 AI ENGINES
// =====================================

const { 
    detectIntent 
} = require("./services/intentEngine");


const {
    saveMemory,
    getMemory
} = require("./services/memoryEngine");


const {
    generateResponse
} = require("./services/responseEngine");

const app = express();

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

// =====================================
// CONVERSATION MEMORY
// =====================================
// Temporary in-memory storage.
// Future versions can replace this with
// a database (MongoDB, PostgreSQL, etc.)
// =====================================

const conversations = {};

// Maximum messages to keep in memory
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

function saveMessage(conversationId, role, message) {

    createConversation(conversationId);

    conversations[conversationId].push({
        role,
        message,
        timestamp: new Date().toISOString()
    });

    // Keep only the latest messages
    if (conversations[conversationId].length > MAX_HISTORY) {
        conversations[conversationId] =
            conversations[conversationId].slice(-MAX_HISTORY);
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
// CLEAR CONVERSATION
// =====================================

function clearConversation(conversationId) {
    conversations[conversationId] = [];
}

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

    res.json({

        app: "ChatTBM Backend",

        version: "2.0",

        status: "Running ✅",

        memory: "Active 🧠",

        uptime: process.uptime(),

        conversations: Object.keys(conversations).length,

        environment: process.env.NODE_ENV || "development"

    });

});

// =====================================
// ChatTBM Backend V2.0
// Part 2/3
// Smart Response Engine
// =====================================

// -------------------------------------
// Generate AI Response
// -------------------------------------

function generateChatTBMResponse(message, history = []) {

    const text = message.trim().toLowerCase();

    // ---------------------------------
    // Conversation Context
    // ---------------------------------

    const previousMessages = history
        .slice(-6)
        .map(item => item.message)
        .join(" ");

    // ---------------------------------
    // Greetings
    // ---------------------------------

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `
Hello 👋

Welcome to ChatTBM.

I'm your AI Content Assistant.

I can help you with:

✍️ Captions
🎬 Video Scripts
#️⃣ Hashtags
💡 Viral Ideas
📢 Advert Copy
📅 Content Planning

What would you like to create today?
`;

    }

    // ---------------------------------
    // Brand / Business
    // ---------------------------------

    if (
        text.includes("brand") ||
        text.includes("business") ||
        text.includes("company")
    ) {

        return `
Let's build something great.

Tell me:

• What is your business?

• Who is your target audience?

• Which platform are you posting on?

I'll help you create content that fits your brand.
`;

    }

    // ---------------------------------
    // Caption Generator
    // ---------------------------------

    if (
        text.includes("caption") ||
        text.includes("instagram") ||
        text.includes("facebook post")
    ) {

        return `
✍️ Caption

"Your ideas deserve attention.

Keep creating.
Keep improving.
Keep showing the world what makes you different."

Suggested hashtags:

#ChatTBM
#ContentCreator
#CreativeIdeas
#DigitalMarketing
`;

    }

    // ---------------------------------
    // Video Script
    // ---------------------------------

    if (
        text.includes("script") ||
        text.includes("video") ||
        text.includes("reel")
    ) {

        return `
🎬 Video Script

HOOK

"Most creators never realize this..."

BODY

Explain the problem.

Show your solution.

Give viewers valuable information.

ENDING

"Follow for more creator tips."
`;

    }

    // ---------------------------------
    // Hashtags
    // ---------------------------------

    if (
        text.includes("hashtag") ||
        text.includes("hashtags")
    ) {

        return `
#ChatTBM

#AIContent

#ContentCreator

#CreatorLife

#DigitalCreator

#ViralContent
`;

    }

    // ---------------------------------
    // Viral Ideas
    // ---------------------------------

    if (
        text.includes("viral") ||
        text.includes("idea") ||
        text.includes("ideas")
    ) {

        return `
💡 Viral Content Ideas

1. Tell your personal story.

2. Show behind the scenes.

3. Share your biggest lesson.

4. Before vs After.

5. Answer a question your audience asks often.
`;

    }

    // ---------------------------------
    // Advert Generator
    // ---------------------------------

    if (
        text.includes("advert") ||
        text.includes("marketing") ||
        text.includes("promotion")
    ) {

        return `
📢 Advert Formula

Attention

Grab attention immediately.

Problem

Explain the challenge.

Solution

Present your product or service.

Call To Action

Tell viewers exactly what to do next.
`;

    }

    // ---------------------------------
    // Content Calendar
    // ---------------------------------

    if (
        text.includes("calendar") ||
        text.includes("content plan") ||
        text.includes("schedule")
    ) {

        return `
📅 Weekly Content Plan

Monday
Educational

Tuesday
Behind The Scenes

Wednesday
Storytelling

Thursday
Tips

Friday
Promotion

Saturday
Trending Content

Sunday
Community Engagement
`;

    }

    // ---------------------------------
    // Memory Awareness
    // ---------------------------------

    if (
        previousMessages.length > 0 &&
        (
            text.includes("continue") ||
            text.includes("again") ||
            text.includes("improve") ||
            text.includes("rewrite")
        )
    ) {

        return `
I remember what we've been discussing.

Based on our recent conversation, I can continue improving your content instead of starting over.

What specific part would you like me to improve?
`;

    }

    // ---------------------------------
    // Default Response
    // ---------------------------------

    return `
I understand your request.

I'm ready to help with:

✍️ Writing

🎬 Scripts

📢 Marketing

💡 Ideas

📅 Planning

Tell me exactly what you need, and I'll help you create it.
`;

}

// =====================================
// ChatTBM Backend V2.0
// Part 3/3
// Chat API + Server Startup
// =====================================

// -------------------------------------
// Chat Endpoint
// -------------------------------------

app.post("/api/chat", (req, res) => {

    try {

        const message = req.body.message;
        const conversationId =
            req.body.conversationId || "default-user";

        // -----------------------------
        // Validation
        // -----------------------------

        if (
            !message ||
            typeof message !== "string" ||
            message.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                reply: "Please enter a message."

            });

        }

        // -----------------------------
        // Save User Message
        // -----------------------------

        saveMessage(
            conversationId,
            "user",
            message
        );

        // -----------------------------
        // Load Conversation
        // -----------------------------

        const history =
            getConversation(conversationId);

        // -----------------------------
        // Generate Reply
        // -----------------------------

        const reply =
            generateChatTBMResponse(
                message,
                history
            );

        // -----------------------------
        // Save Assistant Reply
        // -----------------------------

        saveMessage(
            conversationId,
            "assistant",
            reply
        );

        // -----------------------------
        // Response
        // -----------------------------

        return res.json({

            success: true,

            reply,

            conversationId,

            historyLength: history.length

        });

    } catch (error) {

        console.error("ChatTBM Error:", error);

        return res.status(500).json({

            success: false,

            reply:
                "Something went wrong. Please try again."

        });

    }

});

// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "Route not found."

    });

});

// =====================================
// Global Error Handler
// =====================================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(500).json({

        success: false,

        error: "Internal Server Error"

    });

});

// =====================================
// Start Server
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");

    console.log("==================================");
    console.log(" ChatTBM Backend V2.0");
    console.log("==================================");
    console.log(` Server running on port ${PORT}`);
    console.log(" Conversation Memory: Active");
    console.log(" Response Engine: Ready");
    console.log(" Status: Online");
    console.log("==================================");
    console.log("");

});
