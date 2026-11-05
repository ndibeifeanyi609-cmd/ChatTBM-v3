'use strict';

const assert = require('assert');
const { extractExplicitMemory } = require('../chatInteraction/ChatInteractionBoundary');

const extracted = extractExplicitMemory('Please remember this test preference for future conversations: my project nickname is Blue Falcon. If memory is unavailable, tell me honestly.');
assert.deepStrictEqual(extracted, {
    type: 'fact',
    subject: 'project nickname',
    value: 'Blue Falcon'
});

assert.strictEqual(
    extractExplicitMemory('My project nickname is Blue Falcon.'),
    null,
    'Do not save personal information unless the user explicitly asks to remember it.'
);

assert.strictEqual(
    extractExplicitMemory('Please remember that I prefer concise answers.'),
    null,
    'Unsupported remember phrasing must not be guessed.'
);

assert.deepStrictEqual(
    extractExplicitMemory('Remember this test: 12345.'),
    { type: 'fact', subject: 'test', value: '12345' },
    'Explicit key-value memory requests must be recognized.'
);

assert.deepStrictEqual(
    extractExplicitMemory('Please remember this project note: use dark mode.'),
    { type: 'fact', subject: 'project note', value: 'use dark mode' }
);

assert.strictEqual(
    extractExplicitMemory('The word remember appears here, but no fact is provided.'),
    null,
    'Do not infer a memory without a clear fact.'
);


assert.deepStrictEqual(
    extractExplicitMemory('Please save this as a personal memory: I am the creator of ChatTBM.'),
    { type: 'fact', subject: 'role', value: 'creator of ChatTBM' },
    'Explicit first-person identity memory requests must be recognized.'
);

assert.deepStrictEqual(
    extractExplicitMemory('Please save this project note: use dark mode.'),
    { type: 'fact', subject: 'project note', value: 'use dark mode' }
);

console.log('Explicit memory intent tests passed.');

