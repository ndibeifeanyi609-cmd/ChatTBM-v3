// =====================================
// ChatTBM V7.0
// AI Assistant Platform
//
// Foundation Server
//
// Architecture
// - Express Server
// - API Routes
// - AI Engine
// - Assistant Engine
//
// Future Ready
// - Gemini
// - Grok
// - Multi Provider
// =====================================

require("dotenv").config();

const path = require("path");

const express = require("express");

const cors = require("cors");

const app = express();

const PORT =
process.env.PORT || 3000;

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================
// STATIC FILES
// =====================================

app.use(
    express.static(__dirname)
);

// =====================================
// API ROUTES
// =====================================

const chatRoutes =
require("./routes/chatRoutes");

// =====================================
// REGISTER ROUTES
// =====================================

app.use(
    "/api/chat",
    chatRoutes
);

// =====================================
// HEALTH CHECK
// =====================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            name: "ChatTBM",

            version: "7.0.0",

            status: "Online",

            ai: "Connected",

            timestamp: new Date()

        });

    }
);

// =====================================
// HOME PAGE
// =====================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(

            path.join(
                __dirname,
                "index.html"
            )

        );

    }
);

// =====================================
// API INFORMATION
// =====================================

app.get(
    "/api",
    (req, res) => {

        res.json({

            success: true,

            application: "ChatTBM",

            version: "7.0.0",

            endpoints: [

                "/api/chat",

                "/api/health"

            ]

        });

    }
);

// =====================================
// FRONTEND FALLBACK
// =====================================

app.get(
    "*",
    (req, res, next) => {

        if (req.path.startsWith("/api/")) {
            return next();
        }

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);

// =====================================
// 404 HANDLER
// =====================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message: "Route not found."

        });

    }
);

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use(
    (err, req, res, next) => {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Internal Server Error",

            error:
            process.env.NODE_ENV === "development"
                ? err.message
                : undefined

        });

    }
);

// =====================================
// START SERVER
// =====================================

app.listen(
    PORT,
    () => {

        console.log("====================================");
        console.log("🚀 ChatTBM V7.0");
        console.log("====================================");
        console.log(`Server running on port ${PORT}`);
        console.log(`Health: http://localhost:${PORT}/api/health`);
        console.log("AI Assistant Platform Ready");
        console.log("====================================");

    }
);
