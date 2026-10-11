'use strict';

const assert = require('assert');

const {
    VoiceSTTBoundary
} = require('../voice/VoiceSTTBoundary');

async function run() {
    {
        const providerBoundary = {
            async transcribe() {
                return {
                    success: false,
                    provider: 'test',
                    model: 'fake-stt',
                    metadata: {
                        failed: true
                    },
                    error: {
                        code: 'TRANSCRIPTION_FAILED',
                        message: 'Fake transcription failure'
                    }
                };
            }
        };

        const boundary =
            new VoiceSTTBoundary({
                providerBoundary
            });

        const result =
            await boundary.transcribe({
                audio: Buffer.from('test'),
                mimeType: 'audio/webm',
                language: 'en-US'
            });

        assert.strictEqual(
            result.success,
            false
        );

        assert.strictEqual(
            result.error.code,
            'TRANSCRIPTION_FAILED'
        );

        assert.strictEqual(
            result.provider,
            'test'
        );

        assert.strictEqual(
            result.model,
            'fake-stt'
        );
    }

    {
        const providerBoundary = {
            async transcribe() {
                return {
                    success: true,
                    transcript: '   '
                };
            }
        };

        const boundary =
            new VoiceSTTBoundary({
                providerBoundary
            });

        const result =
            await boundary.transcribe({
                audio: Buffer.from('test')
            });

        assert.strictEqual(
            result.success,
            false
        );

        assert.strictEqual(
            result.error.code,
            'INVALID_PROVIDER_RESPONSE'
        );
    }

    {
        const providerBoundary = {
            async transcribe() {
                throw new Error(
                    'Fake provider exception'
                );
            }
        };

        const boundary =
            new VoiceSTTBoundary({
                providerBoundary
            });

        const result =
            await boundary.transcribe({
                audio: Buffer.from('test')
            });

        assert.strictEqual(
            result.success,
            false
        );

        assert.strictEqual(
            result.error.code,
            'PROVIDER_ERROR'
        );

        assert.strictEqual(
            result.error.message,
            'Fake provider exception'
        );
    }

    console.log(
        'VoiceSTTBoundary failure tests passed'
    );
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
