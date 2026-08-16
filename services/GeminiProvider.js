class GeminiProvider {

    constructor(options = {}) {

        this.name = "gemini";

        this.model =
            options.model ||
            "gemini-2.5-flash";

        this.apiKey =
            options.apiKey ||
            process.env.AI_API_KEY ||
            null;

        this.client = null;

        if (this.apiKey) {

            try {

                const {
                    GoogleGenAI
                } = require("@google/genai");

                this.client =
                    new GoogleGenAI({
                        apiKey:
                            this.apiKey
                    });

            }
            catch (error) {

                this.client = null;

            }

        }

    }

    async generateResponse(request = {}) {

        if (
            !request ||
            typeof request.message !== "string" ||
            !request.message.trim()
        ) {

            return {
                success: false,
                response: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code:
                        "INVALID_REQUEST",
                    message:
                        "A non-empty message is required."
                }
            };

        }

        if (!this.apiKey || !this.client) {

            return {
                success: false,
                response: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code:
                        "PROVIDER_UNAVAILABLE",
                    message:
                        this.apiKey
                            ? "Gemini SDK is not available."
                            : "Gemini API key is not configured."
                }
            };

        }

        const systemPrompt =
            request.systemPrompt || "";

        const userId =
            request.userId || "guest";

        const prompt =
`${systemPrompt}

User ID:
${userId}

User:
${request.message}`;

        try {

            const result =
                await this.client.models.generateContent({
                    model: this.model,
                    contents: prompt
                });

            const responseText =
                result && result.text;

            if (
                typeof responseText !== "string" ||
                !responseText.trim()
            ) {

                return {
                    success: false,
                    response: null,
                    provider: this.name,
                    model: this.model,
                    metadata: {},
                    error: {
                        code:
                            "INVALID_PROVIDER_RESPONSE",
                        message:
                            "Gemini returned an invalid response."
                    }
                };

            }

            return {
                success: true,
                response: responseText,
                provider: this.name,
                model: this.model,
                metadata: {
                    provider: this.name
                }
            };

        }
        catch (error) {

            return {
                success: false,
                response: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code:
                        "PROVIDER_ERROR",
                    message:
                        error.message ||
                        "Gemini provider failed."
                }
            };

        }

    }

}

module.exports = {
    GeminiProvider
};
