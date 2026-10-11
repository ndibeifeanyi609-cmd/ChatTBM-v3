'use strict';

const assert = require('assert');
const {
    STTProviderBoundary
} = require('../voice/STTProviderBoundary');

async function run() {
    {
        const boundary = new STTProviderBoundary();

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
        const boundary = new STTProviderBoundary();

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
        const boundary = new STTProviderBoundary();

        const provider = {
            async transcribe() {
                return {
                    success: true,
                    transcript:
                        '  Hello ChatTBM  ',
                    provider: 'test',
                    model: 'fake-stt',
                    metadata: {
                        test: true
                    }
                };
            }
        };

        const registration =
            boundary.registerProvider(
                'test',
                provider
            );

        assert.deepStrictEqual(
            registration,
            {
                success: true,
                provider: 'test'
            }
        );

        assert.strictEqual(
            boundary.hasProvider('test'),
            true
        );

        const selection =
            boundary.setProvider('test');

        assert.deepStrictEqual(
            selection,
            {
                success: true,
                provider: 'test'
            }
        );

        assert.strictEqual(
            boundary.getProvider(),
            'test'
        );

        const result =
            await boundary.transcribe({
                audio: Buffer.from('test')
            });

        assert.strictEqual(
            result.success,
            true
        );

        assert.strictEqual(
            result.transcript,
            'Hello ChatTBM'
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
    }

    {
        const boundary = new STTProviderBoundary();

        assert.throws(
            () => boundary.registerProvider(
                '',
                {
                    transcribe() {}
                }
            ),
            /Provider name is required/
        );

        assert.throws(
            () => boundary.registerProvider(
                'invalid',
                {}
            ),
            /Provider must implement transcribe/
        );
    }

    {
        const boundary = new STTProviderBoundary();

        const result =
            boundary.setProvider(
                'missing'
            );

        assert.deepStrictEqual(
            result,
            {
                success: false,
                code: 'PROVIDER_NOT_FOUND',
                provider: 'missing'
            }
        );
    }

    {
        const boundary = new STTProviderBoundary();

        boundary.registerProvider(
            'failing',
            {
                async transcribe() {
                    return {
                        success: false,
                        error: {
                            code: 'TRANSCRIPTION_FAILED',
                            message:
                                'Fake transcription failure'
                        }
                    };
                }
            }
        );

        boundary.setProvider('failing');

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
            'TRANSCRIPTION_FAILED'
        );
    }

    {
        const boundary = new STTProviderBoundary();

        boundary.registerProvider(
            'malformed',
            {
                async transcribe() {
                    return {
                        success: true,
                        transcript: '   '
                    };
                }
            }
        );

        boundary.setProvider('malformed');

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

    console.log(
        'STTProviderBoundary tests passed'
    );
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
