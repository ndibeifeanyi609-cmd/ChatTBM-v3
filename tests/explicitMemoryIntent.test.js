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

console.log('Explicit memory intent tests passed.');
