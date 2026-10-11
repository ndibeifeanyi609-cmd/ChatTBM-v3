'use strict';

class VoiceSTTBoundary {
    constructor(options = {}) {
        this.providerBoundary =
            options.providerBoundary || null;
    }

    setProviderBoundary(providerBoundary) {
        this.providerBoundary =
            providerBoundary || null;
    }

    async transcribe(request = {}) {
        if (
            !request ||
            !request.audio
        ) {
            return {
                success: false,
                transcript: null,
                provider: null,
                model: null,
                metadata: {},
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Audio input is required.'
                }
            };
        }

        if (
            this.providerBoundary === null ||
            typeof this.providerBoundary.transcribe !==
                'function'
        ) {
            return {
                success: false,
                transcript: null,
                provider: null,
                model: null,
                metadata: {},
                error: {
                    code: 'PROVIDER_UNAVAILABLE',
                    message:
                        'STT provider boundary is unavailable.'
                }
            };
        }

        const normalizedRequest = {
            audio: request.audio,
            mimeType:
                typeof request.mimeType === 'string'
                    ? request.mimeType.trim()
                    : '',
            language:
                typeof request.language === 'string'
                    ? request.language.trim()
                    : ''
        };

        try {
            const result =
                await this.providerBoundary.transcribe(
                    normalizedRequest
                );

            if (
                result &&
                result.success === false
            ) {
                return {
                    success: false,
                    transcript: null,
                    provider:
                        result.provider || null,
                    model:
                        result.model || null,
                    metadata:
                        result.metadata || {},
                    error:
                        result.error || {
                            code: 'PROVIDER_ERROR',
                            message:
                                'Speech transcription failed.'
                        }
                };
            }

            if (
                !result ||
                typeof result.transcript !== 'string' ||
                !result.transcript.trim()
            ) {
                return {
                    success: false,
                    transcript: null,
                    provider:
                        result?.provider || null,
                    model:
                        result?.model || null,
                    metadata:
                        result?.metadata || {},
                    error: {
                        code:
                            'INVALID_PROVIDER_RESPONSE',
                        message:
                            'STT provider returned an invalid transcript.'
                    }
                };
            }

            return {
                success: true,
                transcript:
                    result.transcript.trim(),
                provider:
                    result.provider || null,
                model:
                    result.model || null,
                metadata:
                    result.metadata || {}
            };
        } catch (error) {
            return {
                success: false,
                transcript: null,
                provider: null,
                model: null,
                metadata: {},
                error: {
                    code: 'PROVIDER_ERROR',
                    message:
                        error?.message ||
                        'Speech transcription failed.'
                }

            };
        }
    }
}

module.exports = {
    VoiceSTTBoundary
};
