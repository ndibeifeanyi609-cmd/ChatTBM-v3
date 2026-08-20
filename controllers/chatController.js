'use strict';

// =====================================
// ChatTBM V7.0
// Chat Controller
//
// Responsibility:
// - Receive requests
// - Validate input
// - Call Assistant Engine
// - Translate Assistant results to HTTP
// =====================================

const {
    generateReply
} = require("../services/assistantEngine");

// =====================================
// CHAT HANDLER
// =====================================

async function chatHandler(req, res) {

    try {

        const {
            message,
            userId = "guest"
        } = req.body;

        // ===============================
        // VALIDATION
        // ===============================

        if (
            !message ||
            typeof message !== "string" ||
            message.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message: "Message is required."

            });

        }

        // ===============================
        // ASSISTANT EXECUTION
        // ===============================

        const reply = await generateReply({

            userId,
            message

        });

        // ===============================
        // CONTROLLED ASSISTANT FAILURE
        // ===============================

        if (
            !reply ||
            reply.success === false
        ) {

            return res.status(503).json({

                success: false,

                version: "7.0.0",

                error:
                    reply?.error || {
                        code: "ASSISTANT_ERROR",
                        message: "Assistant execution failed."
                    }

            });

        }

        // ===============================
        // SUCCESS RESPONSE
        // ===============================

        return res.json({

            success: true,

            version: "7.0.0",

            response: reply.response

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Unable to process request.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    chatHandler
};
