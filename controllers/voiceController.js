'use strict';

// =====================================
// ChatTBM
// Voice/STT HTTP Controller
//
// HTTP/application-surface adapter.
//
// Responsibility:
// - Receive HTTP voice transcription requests
// - Pass canonical audio input to VoiceSTTBoundary
// - Translate controlled results to HTTP
//
// MUST NOT:
// - Own microphone state
// - Access Memory, Profile, Context, Learning,
//   Conversations, or Intelligence
// - Access concrete STT providers directly
// =====================================

function createVoiceTranscribeHandler(
    options = {}
) {

    const voiceSTTBoundary =
        options.voiceSTTBoundary || null;

    return async function voiceTranscribeHandler(
        req,
        res
    ) {

        try {

            if (
                !voiceSTTBoundary ||
                typeof voiceSTTBoundary.transcribe !==
                    'function'
            ) {

                return res.status(503).json({

                    success: false,

                    version: '7.0.0',

                    transcript: null,

                    provider: null,

                    model: null,

                    metadata: {},

                    error: {
                        code:
                            'PROVIDER_UNAVAILABLE',
                        message:
                            'Voice STT capability is unavailable.'
                    }

                });

            }

            const body =
                req?.body || {};

            const result =
                await voiceSTTBoundary.transcribe({

                    audio:
                        body.audio,

                    mimeType:
                        body.mimeType,

                    language:
                        body.language

                });

            if (
                !result ||
                result.success === false
            ) {

                const errorCode =
                    result?.error?.code;

                const status =
                    errorCode === 'PROVIDER_UNAVAILABLE'
                        ? 503
                        : errorCode === 'PROVIDER_ERROR'
                            ? 503
                            : 400;

                return res.status(status).json({

                    success: false,

                    version: '7.0.0',

                    transcript: null,

                    provider:
                        result?.provider || null,

                    model:
                        result?.model || null,

                    metadata:
                        result?.metadata || {},

                    error:
                        result?.error || {
                            code:
                                'VOICE_TRANSCRIPTION_ERROR',
                            message:
                                'Voice transcription failed.'
                        }

                });

            }

            return res.json({

                success: true,

                version: '7.0.0',

                transcript:
                    result.transcript,

                provider:
                    result.provider,

                model:
                    result.model,

                metadata:
                    result.metadata || {}

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                version: '7.0.0',

                transcript: null,

                error: {
                    code:
                        'VOICE_TRANSCRIPTION_ERROR',
                    message:
                        process.env.NODE_ENV === 'development'
                            ? error.message
                            : 'Unable to process voice transcription.'
                }

            });

        }

    };

}

module.exports = {
    createVoiceTranscribeHandler
};
