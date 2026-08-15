// =====================================
// ChatTBM V7.0
// Assistant Engine
//
// Central Intelligence Layer
//
// Responsibilities
// - Receive requests
// - Prepare AI prompt
// - Call AI Engine
// - Return final response
//
// Future Modules
// - Creator Brain
// - Memory
// - Strategy
// - Research
// - Coding
// - Video
// =====================================

const {

    generateAIResponse

} = require("./aiEngine");

// =====================================
// GENERATE REPLY
// =====================================

async function generateReply({

    userId,

    message

}) {

    try {

        // =================================
        // SYSTEM PROMPT
        // =================================

        const systemPrompt =

`You are ChatTBM.

You are an intelligent AI assistant.

Your goal is to help users with any legitimate task including:

• General questions
• Writing
• Programming
• Business
• Learning
• Research
• Content creation

Be accurate.

Be helpful.

Be friendly.

If you don't know something, say so instead of inventing information.`;

        // =================================
        // AI ENGINE
        // =================================

        const response =

        await generateAIResponse({

            systemPrompt,

            message,

            userId

        });

        return response;

    }

    catch (error) {

        console.error(error);

        return "Sorry, something went wrong while generating a response.";

    }

}

// =====================================
// EXPORTS
// =====================================

module.exports = {

    generateReply

};
