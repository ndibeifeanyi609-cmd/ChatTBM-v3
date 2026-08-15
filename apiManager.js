// =====================================
// ChatTBM V7
// API Manager
//
// Purpose:
// Manage every AI provider
// =====================================

class APIManager {

    constructor() {

        this.provider = "gemini";

        this.providers = {

            gemini: null,

            grok: null,

            openai: null

        };

    }

    // ==========================
    // SET ACTIVE PROVIDER
    // ==========================

    setProvider(name) {

        if (this.providers.hasOwnProperty(name)) {

            this.provider = name;

        }

    }

    // ==========================
    // GET ACTIVE PROVIDER
    // ==========================

    getProvider() {

        return this.provider;

    }

    // ==========================
    // SEND MESSAGE
    // ==========================

    async send(message) {

        switch (this.provider) {

            case "gemini":

                return await window.ChatTBM_AI
                    .sendToGemini(message);

            case "grok":

                return await window.ChatTBM_AI
                    .sendToGrok(message);

            case "openai":

                return await window.ChatTBM_AI
                    .sendToOpenAI(message);

            default:

                throw new Error(
                    "Unknown AI Provider"
                );

        }

    }

}

window.APIManager = new APIManager();
