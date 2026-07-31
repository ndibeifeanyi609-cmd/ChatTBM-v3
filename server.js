// =====================================
// ChatTBM V6.5
// Creator Intelligence Backend
//
// Modules
// - Response Intelligence
// - Memory Brain
// - Feedback Learning
// - User Profile Learning
// - Creator Learning
// - Performance Learning
// - Viral Pattern Learning
// - Creator Strategy Engine
// =====================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    generateResponse
} = require("./services/responseEngine");

const {
    saveFeedback,
    analyzeFeedback
} = require("./services/feedbackEngine");

const {
    analyzeUserFeedback
} = require("./services/profileLearningBridge");

const {
    getProfile
} = require("./services/userProfileEngine");

const {
    analyzeCreatorInput
} = require("./services/creatorLearningEngine");

const {
    analyzePerformanceFeedback
} = require("./services/performanceLearningEngine");

const {
    learnViralPattern,
    getCreatorViralMemory
} = require("./services/viralMemoryBridge");

const {
    generateCreatorStrategy,
    generateContentIdeas,
    generateScriptOutline
} = require("./services/creatorStrategyEngine");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

    res.json({

        app: "ChatTBM AI Backend",

        version: "V6.5",

        status: "Online 🚀"

    });

});


// =====================================
// CHAT ENGINE
// =====================================

app.post("/api/chat", (req, res) => {

    try {

        const {

            userId = "guest",

            message

        } = req.body;

        if (!message) {

            return res.json({

                success: false,

                message: "No message received"

            });

        }

        analyzeCreatorInput(
            userId,
            message
        );

        let intent = "general";

        const text =
        message.toLowerCase();

        if (text.includes("script")) {

            intent = "script_generation";

        }

        else if (text.includes("caption")) {

            intent = "caption_generation";

        }

        else if (text.includes("idea")) {

            intent = "idea_generation";

        }

        else if (text.includes("strategy")) {

            intent = "creator_strategy";

        }

        const profile =
        getProfile(userId);

        const strategy =
        generateCreatorStrategy(userId);

        const response =
        generateResponse(

            intent,

            message,

            {},

            [],

            {},

            [],

            {},

            [],

            {

                userId,

                profile,

                strategy

            }

        );

        res.json({

            success: true,

            response,

            strategy

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


// =====================================
// FEEDBACK LEARNING
// =====================================

app.post("/api/feedback", (req, res) => {

    try {

        const {

            userId = "guest",

            correction

        } = req.body;

        if (!correction) {

            return res.json({

                success: false,

                message: "No feedback received"

            });

        }

        const feedback =
        saveFeedback({

            userId,

            correction

        });

        analyzeUserFeedback(
            userId,
            correction
        );

        analyzePerformanceFeedback(
            userId,
            correction
        );

        learnViralPattern(
            userId,
            correction
        );

        res.json({

            success: true,

            feedback

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


// =====================================
// PROFILE
// =====================================

app.get("/api/profile/:userId", (req, res) => {

    res.json({

        success: true,

        profile:

        getProfile(

            req.params.userId

        )

    });

});


// =====================================
// CREATOR STRATEGY
// =====================================

app.get("/api/strategy/:userId", (req, res) => {

    const userId =
    req.params.userId;

    res.json({

        success: true,

        strategy:

        generateCreatorStrategy(userId),

        ideas:

        generateContentIdeas(userId),

        script:

        generateScriptOutline(userId)

    });

});


// =====================================
// VIRAL MEMORY
// =====================================

app.get("/api/viral-memory/:userId", (req, res) => {

    res.json({

        success: true,

        memory:

        getCreatorViralMemory(

            req.params.userId

        )

    });

});


// =====================================
// FEEDBACK ANALYTICS
// =====================================

app.get("/api/feedback", (req, res) => {

    res.json(

        analyzeFeedback()

    );

});


// =====================================
// START SERVER
// =====================================

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(

        `🚀 ChatTBM V6.5 running on port ${PORT}`

    );

});
