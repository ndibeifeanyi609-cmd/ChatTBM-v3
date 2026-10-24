'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInteractionRequest } = require('../chatInteraction/ChatInteractionBoundary');

const request = attachment => ({
    userId: 'attachment-test-user',
    interactionId: 'attachment-test-interaction',
    message: 'Summarize this file',
    attachment
});

test('interaction boundary accepts PDF document attachments', () => {
    const result = validateInteractionRequest(request({
        type: 'document',
        name: 'sample.pdf',
        mimeType: 'application/pdf',
        data: 'cGRm'
    }));
    assert.equal(result.attachment.type, 'document');
    assert.equal(result.attachment.mimeType, 'application/pdf');
});

test('interaction boundary accepts extracted text attachments', () => {
    const result = validateInteractionRequest(request({
        type: 'text',
        name: 'sample.txt',
        mimeType: 'text/plain',
        text: 'Text to summarize'
    }));
    assert.equal(result.attachment.type, 'text');
    assert.equal(result.attachment.text, 'Text to summarize');
});

test('interaction boundary continues accepting image attachments', () => {
    const result = validateInteractionRequest(request({
        type: 'image',
        name: 'sample.png',
        mimeType: 'image/png',
        data: 'aW1hZ2U='
    }));
    assert.equal(result.attachment.type, 'image');
});

test('interaction boundary rejects malformed document attachments', () => {
    assert.throws(() => validateInteractionRequest(request({
        type: 'document',
        name: 'sample.pdf',
        mimeType: 'text/plain',
        data: 'cGRm'
    })), /Invalid attachment/);
});

test('interaction boundary rejects oversized text attachments', () => {
    assert.throws(() => validateInteractionRequest(request({
        type: 'text',
        name: 'sample.txt',
        mimeType: 'text/plain',
        text: 'x'.repeat(200001)
    })), /Invalid attachment/);
});
