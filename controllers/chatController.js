// =====================================
// ChatTBM V7.0
// Chat Controller
//
// Responsibility:
// - Receive requests
// - Validate input
// - Call Assistant Engine
// - Return response
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
        // AI RESPONSE
        // ===============================

        const reply = await generateReply({

            userId,

            message

        });

        // ===============================
        // RESPONSE
        // ===============================

        return res.json({

            success: true,

            version: "7.0.0",

            response: reply

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
