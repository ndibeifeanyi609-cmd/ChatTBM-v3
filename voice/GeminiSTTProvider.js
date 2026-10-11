'use strict';

function createAudioBlobFromBase64(audio, mimeType) {
    const buffer = Buffer.from(audio, 'base64');

    return {
        size: buffer.length,
        type: mimeType,
        slice(start, end) {
            return buffer.slice(start, end);
        }
    };
}

class GeminiSTTProvider {
    constructor(options = {}) {
        this.name = 'gemini';
        this.model =
            options.model ||
            'gemini-3.5-transcribe';

        this.client =
            options.client ||
            null;

        this.apiKey =
            options.apiKey ||
            process.env.AI_API_KEY ||
            null;
    }

    isAvailable() {
        return Boolean(this.client);
    }

    async transcribe(request = {}) {
        if (!request || !request.audio) {
            return {
                success: false,
                transcript: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Audio input is required.'
                }
            };
        }

        if (!this.client) {
            return {
                success: false,
                transcript: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code: 'PROVIDER_UNAVAILABLE',
                    message: 'Gemini STT provider is unavailable.'
                }
            };
        }

        try {
            const mimeType =
                typeof request.mimeType === 'string' &&
                request.mimeType.trim()
                    ? request.mimeType.trim()
                    : 'audio/webm';

            const audioBlob =
                createAudioBlobFromBase64(
                    request.audio,
                    mimeType
                );

            const audioFile =
                await this.client.files.upload({
                    file: audioBlob,
                    config: {
                        mimeType
                    }
                });

            const input = [{
                type: 'audio',
                uri: audioFile.uri,
                mime_type:
                    audioFile.mimeType || mimeType
            }];

            const generationConfig = {};

            if (
                typeof request.language === 'string' &&
                request.language.trim()
            ) {
                generationConfig.transcription_config = {
                    language_codes: [
                        request.language.trim()
                    ]
                };
            }

            const interaction =
                await this.client.interactions.create({
                    model: this.model,
                    input,
                    ...(Object.keys(generationConfig).length
                        ? {
                            generation_config:
                                generationConfig
                        }
                        : {})
                });

            const transcript =
                interaction &&
                typeof interaction.output_text === 'string'
                    ? interaction.output_text.trim()
                    : '';

            if (!transcript) {
                return {
                    success: false,
                    transcript: null,
                    provider: this.name,
                    model: this.model,
                    metadata: {},
                    error: {
                        code: 'INVALID_PROVIDER_RESPONSE',
                        message:
                            'Gemini STT returned no transcript.'
                    }
                };
            }

            return {
                success: true,
                transcript,
                provider: this.name,
                model: this.model,
                metadata: {}
            };
        } catch (error) {
            return {
                success: false,
                transcript: null,
                provider: this.name,
                model: this.model,
                metadata: {},
                error: {
                    code: 'PROVIDER_ERROR',
                    message:
                        error?.message ||
                        'Gemini STT transcription failed.'
                }
            };
        }
    }
}

module.exports = {
    GeminiSTTProvider
};
