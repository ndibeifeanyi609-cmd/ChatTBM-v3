'use strict';

const assert = require('assert');

const {
    VoiceSTTBoundary
} = require('../voice/VoiceSTTBoundary');

async function run() {
    {
        const boundary =
            new VoiceSTTBoundary();

        const result =
            await boundary.transcribe();

        assert.strictEqual(
            result.success,
            false
        );

        assert.strictEqual(
            result.error.code,
            'INVALID_REQUEST'
        );
    }

    {
        const boundary =
            new VoiceSTTBoundary();

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
            'PROVIDER_UNAVAILABLE'
        );
    }

    {
        const calls = [];

        const providerBoundary = {
            async transcribe(request) {
                calls.push(request);

                return {
                    success: true,
                    transcript:
                        '  Hello from voice  ',
                    provider: 'test',
                    model: 'fake-stt',
                    metadata: {
                        test: true
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
                mimeType:
                    ' audio/webm ',
                language:
                    ' en-US '
            });

        assert.strictEqual(
            result.success,
            true
        );

        assert.strictEqual(
            result.transcript,
            'Hello from voice'
        );

        assert.strictEqual(
            result.provider,
            'test'
        );

        assert.strictEqual(
            result.model,
            'fake-stt'
        );

        assert.deepStrictEqual(
            result.metadata,
            {
                test: true
            }
        );

        assert.strictEqual(
            calls.length,
            1
        );

        assert.strictEqual(
            calls[0].audio.toString(),
            'test'
        );

        assert.strictEqual(
            calls[0].mimeType,
            'audio/webm'
        );

        assert.strictEqual(
            calls[0].language,
            'en-US'
        );
    }

    console.log(
        'VoiceSTTBoundary tests passed'
    );
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
