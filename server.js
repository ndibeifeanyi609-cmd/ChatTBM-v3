// =====================================
// ChatTBM V6.0.5
// Personal AI Brain Backend
// Memory Brain + Feedback Loop
// =====================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");


// =====================================
// SERVICES
// =====================================

const {
    generateResponse
} = require("./services/responseEngine");


const {
    buildMemoryContext,
    saveMemory
} = require("./services/memoryEngine");


const {
    saveFeedback,
    analyzeFeedback
} = require("./services/feedbackEngine");


// =====================================
// APP SETUP
// =====================================

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

    res.json({

        app: "ChatTBM AI Backend",

        version: "V6.0.5",

        status: "Online 🚀"

    });

});


// =====================================
// SIMPLE INTENT DETECTOR
// =====================================

function detectIntent(message) {

    const text = message.toLowerCase();

    if (text.includes("script")) {

        return "script_generation";

    }

    if (text.includes("caption")) {

        return "caption_generation";

    }

    if (text.includes("idea")) {

        return "idea_generation";

    }

    if (text.includes("advert")) {

        return "advert_generation";

    }

    if (text.includes("calendar")) {

        return "calendar_generation";

    }

    return "general";

}

// =====================================
// CHAT ENGINE
// =====================================

app.post("/api/chat", (req, res) => {

    try {

        const {

            message,

            userId = "guest"

        } = req.body;



        if (!message) {

            return res.status(400).json({

                success: false,

                message: "No message received."

            });

        }



        // ===============================
        // DETECT USER INTENT
        // ===============================

        const intent = detectIntent(message);



        // ===============================
        // BUILD MEMORY CONTEXT
        // ===============================

        const memoryContext = buildMemoryContext(userId);



        const brainContext = {

            memoryContext,

            relationships: []

        };



        // ===============================
        // GENERATE AI RESPONSE
        // ===============================

        const response = generateResponse(

            intent,

            message,

            {},

            [],

            {},

            [],

            {},

            [],

            brainContext

        );



        // ===============================
        // LEARN FROM USER MESSAGE
        // ===============================

        saveMemory(

            userId,

            "last_message",

            message,

            {

                score: 5,

                level: "TEMPORARY"

            }

        );



        // ===============================
        // SEND RESPONSE
        // ===============================

        res.json({

            success: true,

            response

        });

    }

    catch (error) {

        console.error("ChatTBM Error:", error);

        res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

});

// =====================================
// FEEDBACK API
// =====================================

app.post("/api/feedback", (req, res) => {

    try {

        const result = saveFeedback(req.body);

        res.json(result);

    }

    catch (error) {

        console.error("Feedback Error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to save feedback."

        });

    }

});



// =====================================
// FEEDBACK ANALYTICS
// =====================================

app.get("/api/feedback", (req, res) => {

    try {

        const report = analyzeFeedback();

        res.json({

            success: true,

            report

        });

    }

    catch (error) {

        console.error("Analytics Error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to analyze feedback."

        });

    }

});



// =====================================
// UNKNOWN ROUTES
// =====================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Endpoint not found."

    });

});



// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");

    console.log("=====================================");
    console.log("🚀 ChatTBM V6.0.5 Backend Started");
    console.log("=====================================");
    console.log(`🌐 Port: ${PORT}`);
    console.log("🧠 Memory Brain: Connected");
    console.log("💬 Response Engine: Connected");
    console.log("📚 Memory Engine: Connected");
    console.log("📝 Feedback Engine: Connected");
    console.log("✅ Server Ready");
    console.log("=====================================");

});
