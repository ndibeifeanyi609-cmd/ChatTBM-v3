// =====================================
// ChatTBM V5.0
// controllers/chatController.js
// =====================================

const intentEngine = require("../services/intentEngine");

// Placeholder modules (we'll build these next)
const memoryEngine = {
    loadConversation(id) {
        return [];
    },
    saveConversation(id, userMessage, reply) {
        return true;
    }
};

const responseEngine = {
    generate(intent, message, history) {
        return "Response Engine is not connected yet.";
    }
};

const formatter = {
    format(reply) {
        return reply;
    }
};

// =====================================
// CHAT CONTROLLER
// =====================================

async function chat(req, res) {

    try {

        const message = req.body.message;
        const conversationId =
            req.body.conversationId || "default-user";

        if (!message || message.trim() === "") {

            return res.status(400).json({

                success: false,
                reply: "Please enter a message."

            });

        }

        // Detect user intent
        const intent =
            intentEngine.detectIntent(message);

        // Load previous conversation
        const history =
            memoryEngine.loadConversation(conversationId);

        // Generate reply
        let reply =
            responseEngine.generate(
                intent,
                message,
                history
            );

        // Format reply
        reply =
            formatter.format(reply);

        // Save conversation
        memoryEngine.saveConversation(
            conversationId,
            message,
            reply
        );

        return res.json({

            success: true,
            conversationId,
            intent,
            reply

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            reply: "Internal Server Error"

        });

    }

}

module.exports = {

    chat

};
