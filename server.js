// =====================================
// ChatTBM REG-086.41
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
// - Forecast Controller
// =====================================
require("dotenv").config();
const MemoryRuntime = require("./memory/MemoryRuntime");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth/authRoutes");
const { requireAuth } = require("./auth/requireAuth");
const { isAllowedRequestOrigin } = require("./auth/requestOrigin");
const app = express();
const PORT =
    process.env.PORT || 3000;
// =====================================
// MIDDLEWARE
// =====================================
const allowedOrigins = new Set(
    (process.env.FRONTEND_ORIGINS || "https://ndibeifeanyi609-cmd.github.io,https://chattbm.com,https://www.chattbm.com")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed."));
    },
    credentials: true
}));

app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.path.startsWith("/api/auth/")) {
        const origin = req.get("origin");
        if (origin && !isAllowedRequestOrigin(origin, allowedOrigins)) {
            return res.status(403).json({ success: false, error: "Origin is not allowed." });
        }
    }
    next();
});
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
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
const softwareBuildingRoutes =
    require("./routes/softwareBuildingRoutes");
const { createVoiceRoutes } = require("./routes/voiceRoutes");
const { STTProviderBoundary } = require("./voice/STTProviderBoundary");
const { VoiceSTTBoundary } = require("./voice/VoiceSTTBoundary");
const { GeminiSTTProvider } = require("./voice/GeminiSTTProvider");
const { createVoiceTranscribeHandler } = require("./controllers/voiceController");

const sttProviderBoundary = new STTProviderBoundary();
const geminiSTTProvider = new GeminiSTTProvider();
sttProviderBoundary.registerProvider("gemini", geminiSTTProvider);
sttProviderBoundary.setProvider("gemini");

const voiceSTTBoundary = new VoiceSTTBoundary({
    providerBoundary: sttProviderBoundary
});

const voiceTranscribeHandler =
    createVoiceTranscribeHandler({
        voiceSTTBoundary
    });

const voiceRoutes =
    createVoiceRoutes(voiceTranscribeHandler);
// =====================================
// REGISTER AUTH ROUTES
// =====================================
app.use("/api/auth", authRoutes);

// REGISTER CHAT ROUTES
// =====================================
app.use(
    "/api/chat",
    requireAuth,
    chatRoutes
);
// =====================================
// REGISTER VOICE ROUTES
// =====================================
app.use(
    "/api/voice",
    voiceRoutes
);

// REGISTER FORECAST ROUTES
// =====================================
app.use(
    "/api/forecast",
    forecastRoutes
);
// =====================================
// REGISTER SOFTWARE-BUILDING ROUTES
// =====================================
app.use(
    "/api/software-builder",
    softwareBuildingRoutes
);
// =====================================
// HEALTH CHECK
// =====================================
const { initializeDatabase, checkDatabase } = require("./database/Postgres");

app.get(
    "/api/health",
    async (req, res) => {
        const database = await checkDatabase();
        res.json({
            success: true,
            name: "ChatTBM",
            status: "Online",
            ai: "Connected",
            forecasting: "Ready",
            database: database.status,
            timestamp: new Date().toISOString()
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
            endpoints: [
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/me",
                "/api/auth/logout",
                "/api/chat",
                "/api/forecast",
                "/api/software-builder",
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
app.use(
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
// =====================================
// INITIALIZE MEMORY RUNTIME
// =====================================
try {
    const memoryRuntime =
        MemoryRuntime.initializeMemoryRuntime();

    console.log(
        `Memory runtime initialized: ${memoryRuntime.count} persisted memories`
    );
} catch (error) {
    console.error(
        "Memory runtime initialization failed."
    );
    console.error(error.message);
    process.exit(1);
}
// =====================================

// START SERVER
// =====================================
async function startServer() {
    try {
        const database = await initializeDatabase();
        console.log("PostgreSQL status: " + database.status);
    } catch (error) {
        console.error("PostgreSQL initialization failed: " + error.message);
    }

    app.listen(PORT, () => {
        console.log("ChatTBM server running on port " + PORT);
        console.log("Health: /api/health");
        console.log("Chat API: /api/chat");
    });
}

startServer();
