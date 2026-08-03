// =====================================
// ChatTBM V7.0
// AI Engine
//
// Current Provider:
// - Google Gemini
//
// Future:
// - Grok
// - Other AI Providers
// =====================================

const { GoogleGenAI } = require("@google/genai");

// =====================================
// INITIALIZE AI
// =====================================

const ai = new GoogleGenAI({

    apiKey: process.env.AI_API_KEY

});

// =====================================
// GENERATE AI RESPONSE
// =====================================

async function generateAIResponse({

    systemPrompt,

    message,

    userId

}) {

    try {

        const prompt =

`${systemPrompt}

User ID:
${userId}

User:
${message}`;

        const response =

        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt

        });

        return (

            response.text ||

            "Sorry, I couldn't generate a response."

        );

    }

    catch (error) {

        console.error(

            "AI Engine Error:",

            error

        );

        throw error;

    }

}

// =====================================
// EXPORTS
// =====================================

module.exports = {

    generateAIResponse

};
