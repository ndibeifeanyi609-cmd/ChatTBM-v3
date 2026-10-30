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
const crypto = require("crypto");
const MemoryRuntime = require("./memory/MemoryRuntime");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./auth/authRoutes");
const googleOAuthRoutes = require("./auth/googleOAuthRoutes");
const conversationHistoryRoutes = require("./routes/conversationHistoryRoutes").router;
const { requireAuth } = require("./auth/requireAuth");
const { isTrustedMutationRequest } = require("./auth/requestOrigin");
const app = express();
// Render runs behind one reverse proxy; preserve client IPs for rate limiting.
app.set("trust proxy", 1);
const PORT =
    process.env.PORT || 3000;
// =====================================
// MIDDLEWARE
// =====================================
app.use((req, res, next) => {
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});
const defaultOrigins = [
    "https://ndibeifeanyi609-cmd.github.io",
    "https://chattbm.com",
    "https://www.chattbm.com",
    "https://chattbm-backend.onrender.com",
];
const configuredOrigins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        console.warn("Rejected CORS origin:", JSON.stringify(origin));
        return callback(new Error("Origin is not allowed."));
    },
    credentials: true
}));

app.use((req, res, next) => {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (isMutation && req.path.startsWith("/api/")) {
        if (!isTrustedMutationRequest(
            req.get("origin"),
            req.get("authorization"),
            allowedOrigins
        )) {
            return res.status(403).json({
                success: false,
                error: "Origin is not allowed."
            });
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
app.use("/api/auth/google", googleOAuthRoutes);
app.use("/api/conversations", requireAuth, conversationHistoryRoutes);
app.use("/api/memories", requireAuth, require("./routes/memoryRoutes").router);

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
    requireAuth,
    voiceRoutes
);

// REGISTER FORECAST ROUTES
// =====================================
app.use(
    "/api/forecast",
    requireAuth,
    forecastRoutes
);
// =====================================
// REGISTER SOFTWARE-BUILDING ROUTES
// =====================================
app.use(
    "/api/software-builder",
    requireAuth,
    softwareBuildingRoutes
);
// =====================================
// HEALTH CHECK
// =====================================
const { initializeDatabase, checkDatabase, getPool } = require("./database/Postgres");

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

// TEMPORARY STAGING-ONLY READ-ONLY SCHEMA DIAGNOSTIC.
// Disabled unless STAGING_SCHEMA_DIAGNOSTIC_TOKEN is configured.
app.get("/api/internal/staging-schema-diagnostic", async (req, res) => {
    const expectedToken = process.env.STAGING_SCHEMA_DIAGNOSTIC_TOKEN || "";
    const authorization = req.get("authorization") || "";
    const suppliedToken = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";

    if (!expectedToken) {
        return res.status(404).json({ success: false, error: "Not found." });
    }

    const expected = Buffer.from(expectedToken);
    const supplied = Buffer.from(suppliedToken);
    if (
        expected.length !== supplied.length ||
        !crypto.timingSafeEqual(expected, supplied)
    ) {
        return res.status(404).json({ success: false, error: "Not found." });
    }

    const db = getPool();
    if (!db) {
        return res.status(503).json({ success: false, error: "Database unavailable." });
    }

    let client;
    try {
        client = await db.connect();
        await client.query("BEGIN READ ONLY");

        const identity = await client.query(
            "SELECT current_database() AS database_name, current_schema() AS schema_name"
        );
        const tables = await client.query(
            "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        const columns = await client.query(
            "SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position"
        );
        const ledger = await client.query(
            "SELECT to_regclass('public.chattbm_schema_migrations') IS NOT NULL AS ledger_exists"
        );

        let migrationRecords = [];
        if (ledger.rows[0].ledger_exists) {
            const records = await client.query(
                "SELECT filename, checksum, applied_at FROM public.chattbm_schema_migrations ORDER BY filename"
            );
            migrationRecords = records.rows;
        }

        await client.query("ROLLBACK");
        return res.json({
            success: true,
            database: identity.rows[0],
            tables: tables.rows.map(row => row.tablename),
            columns: columns.rows,
            migrationLedgerExists: ledger.rows[0].ledger_exists,
            migrationRecords
        });
    } catch (error) {
        if (client) {
            try { await client.query("ROLLBACK"); } catch (_) {}
        }
        console.error("Staging schema diagnostic failed:", error.message);
        return res.status(500).json({ success: false, error: "Diagnostic query failed." });
    } finally {
        if (client) client.release();
    }
});

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
// START SERVER
// =====================================
async function startServer() {
    try {
        const database = await initializeDatabase();
        console.log("PostgreSQL status: " + database.status);

        if (process.env.DATABASE_URL) {
            const PostgresMemoryPersistence = require("./memory/PostgresMemoryPersistence");
            await PostgresMemoryPersistence.initialize();
            console.log("PostgreSQL personal memory persistence initialized.");
        } else {
            const memoryRuntime = MemoryRuntime.initializeMemoryRuntime();
            console.log(`Memory runtime initialized: ${memoryRuntime.count} persisted memories`);
        }
    } catch (error) {
        console.error("Database or memory initialization failed: " + error.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log("ChatTBM server running on port " + PORT);
        console.log("Health: /api/health");
        console.log("Chat API: /api/chat");
    });
}

startServer();
