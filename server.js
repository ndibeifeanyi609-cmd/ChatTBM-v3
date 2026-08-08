// =====================================
// ChatTBM V9.8
// AI Assistant Platform
//
// Foundation Server
//
// Architecture
// - Express Server
// - API Routes
// - Chat API
// - Forecast API
// - AI Engine
// - Assistant Engine
//
// Forecasting
// - Forecast Object
// - Forecast Validator
// - Forecast Lifecycle
// - Forecast Registry
// - Forecast Registry Persistence
// - Forecast Service
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

const forecastRoutes =
    require("./routes/forecastRoutes");


// =====================================
// REGISTER CHAT ROUTES
// =====================================

app.use(
    "/api/chat",
    chatRoutes
);


// =====================================
// REGISTER FORECAST ROUTES
// =====================================

app.use(
    "/api/forecast",
    forecastRoutes
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

            version: "9.8",

            status: "Online",

            ai: "Connected",

            forecasting: "Ready",

            timestamp:
                new Date().toISOString()

        });

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

            version: "9.8",

            endpoints: [

                "/api/chat",

                "/api/forecast",

                "/api/health"

            ]

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
// FRONTEND FALLBACK
// =====================================

app.get(
    "*",
    (req, res, next) => {

        if (
            req.path.startsWith("/api/")
        ) {

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

            message:
                "Route not found."

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

            message:
                "Internal Server Error",

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

        console.log(
            "===================================="
        );

        console.log(
            "🚀 ChatTBM V9.8"
        );

        console.log(
            "===================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            "Chat API: /api/chat"
        );

        console.log(
            "Forecast API: /api/forecast"
        );

        console.log(
            "AI Assistant Platform Ready"
        );

        console.log(
            "===================================="
        );

    }
);
