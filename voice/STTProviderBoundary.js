'use strict';

class STTProviderBoundary {

    constructor() {
        this.providers = new Map();
        this.activeProvider = null;
    }

    registerProvider(name, provider) {
        if (
            typeof name !== 'string' ||
            !name.trim()
        ) {
            throw new Error(
                'Provider name is required.'
            );
        }

        if (
            !provider ||
            typeof provider.transcribe !== 'function'
        ) {
            throw new Error(
                'Provider must implement transcribe().'
            );
        }

        this.providers.set(name, provider);

        return {
            success: true,
            provider: name
        };
    }

    setProvider(name) {
        if (!this.providers.has(name)) {
            return {
                success: false,
                code: 'PROVIDER_NOT_FOUND',
                provider: name
            };
        }

        this.activeProvider = name;

        return {
            success: true,
            provider: name
        };
    }

    getProvider() {
        return this.activeProvider;
    }

    hasProvider(name) {
        return this.providers.has(name);
    }

    async transcribe(request = {}) {
        if (
            !request ||
            !request.audio
        ) {
            return {
                success: false,
                transcript: null,
                provider: this.activeProvider,
                model: null,
                metadata: {},
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Audio input is required.'
                }
            };
        }

        if (!this.activeProvider) {
            return {
                success: false,
                transcript: null,
                provider: null,
                model: null,
                metadata: {},
                error: {
                    code: 'PROVIDER_UNAVAILABLE',
                    message:
                        'No STT provider is configured.'
                }
            };
        }

        const provider =
            this.providers.get(this.activeProvider);

        if (!provider) {
            return {
                success: false,
                transcript: null,
                provider: this.activeProvider,
                model: null,
                metadata: {},
                error: {
                    code: 'PROVIDER_UNAVAILABLE',
                    message:
                        'Active STT provider is unavailable.'
                }
            };
        }

        try {
            const result =
                await provider.transcribe(request);

            if (
                result &&
                result.success === false
            ) {
                return {
                    success: false,
                    transcript: null,
                    provider:
                        result.provider ||
                        this.activeProvider,
                    model:
                        result.model ||
                        null,
                    metadata:
                        result.metadata ||
                        {},
                    error:
                        result.error ||
                        {
                            code: 'PROVIDER_ERROR',
                            message:
                                'STT provider failed.'
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
                    provider: this.activeProvider,
                    model:
                        result?.model ||
                        null,
                    metadata:
                        result?.metadata ||
                        {},
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
                    result.provider ||
                    this.activeProvider,
                model:
                    result.model ||
                    null,
                metadata:
                    result.metadata ||
                    {}
            };
        } catch (error) {
            return {
                success: false,
                transcript: null,
                provider:
                    this.activeProvider,
                model: null,
                metadata: {},
                error: {
                    code:
                        'PROVIDER_ERROR',
                    message:
                        error.message ||
                        'STT provider failed.'
                }
            };
        }
    }
}

module.exports = {
    STTProviderBoundary
};
