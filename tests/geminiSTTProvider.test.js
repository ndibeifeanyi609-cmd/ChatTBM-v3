'use strict';

const assert = require('assert');

const {
    GeminiSTTProvider
} = require('../voice/GeminiSTTProvider');

async function run() {
    let uploadedFile = null;
    let uploadedConfig = null;
    let interactionRequest = null;

    const client = {
        files: {
            async upload({ file, config }) {
                uploadedFile = file;
                uploadedConfig = config;

                return {
                    uri: 'mock://audio',
                    mimeType: config.mimeType
                };
            }
        },

        interactions: {
            async create(request) {
                interactionRequest = request;

                return {
                    output_text: 'mock transcript'
                };
            }
        }
    };

    const provider =
        new GeminiSTTProvider({
            client
        });

    const sourceAudio = 'test audio';

    const result =
        await provider.transcribe({
            audio: Buffer
                .from(sourceAudio)
                .toString('base64'),
            mimeType: 'audio/webm',
            language: 'en-US'
        });

    assert.strictEqual(
        result.success,
        true
    );

    assert.strictEqual(
        result.transcript,
        'mock transcript'
    );

    assert.ok(uploadedFile);
    assert.strictEqual(
        uploadedFile.size,
        Buffer.byteLength(sourceAudio)
    );

    assert.strictEqual(
        uploadedFile.type,
        'audio/webm'
    );

    assert.strictEqual(
        typeof uploadedFile.slice,
        'function'
    );

    assert.strictEqual(
        uploadedFile
            .slice(0, uploadedFile.size)
            .toString('utf8'),
        sourceAudio
    );

    assert.deepStrictEqual(
        uploadedConfig,
        {
            mimeType: 'audio/webm'
        }
    );

    assert.deepStrictEqual(
        interactionRequest.input,
        [{
            type: 'audio',
            uri: 'mock://audio',
            mime_type: 'audio/webm'
        }]
    );

    assert.deepStrictEqual(
        interactionRequest.generation_config,
        {
            transcription_config: {
                language_codes: ['en-US']
            }
        }
    );

    console.log(
        'GeminiSTTProvider tests passed'
    );
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
