'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAttachment, MAX_ATTACHMENT_SIZE } = require('../ui/AttachmentProcessor.mjs');

function file(name, type, value) {
    const bytes = new TextEncoder().encode(value);
    return {
        name,
        type,
        size: bytes.byteLength,
        async arrayBuffer() {
            return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        }
    };
}

test('creates a text attachment with readable document content', async () => {
    const result = await createAttachment(file('notes.md', 'text/markdown', '# Main purpose'));
    assert.equal(result.type, 'text');
    assert.equal(result.mimeType, 'text/plain');
    assert.equal(result.text, '# Main purpose');
    assert.equal(result.name, 'notes.md');
});

test('creates a PDF attachment as base64 inline data', async () => {
    const result = await createAttachment(file('architecture.pdf', 'application/pdf', 'PDF'));
    assert.equal(result.type, 'document');
    assert.equal(result.mimeType, 'application/pdf');
    assert.equal(result.data, btoa('PDF'));
});

test('preserves image attachment behavior', async () => {
    const result = await createAttachment(file('picture.png', 'image/png', 'image-bytes'));
    assert.equal(result.type, 'image');
    assert.equal(result.mimeType, 'image/png');
    assert.equal(result.data, btoa('image-bytes'));
});

test('rejects unsupported document types clearly', async () => {
    await assert.rejects(
        createAttachment(file('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')),
        /Supported attachments are images, PDF, TXT, and Markdown/
    );
});

test('rejects attachments larger than 10 MB', async () => {
    await assert.rejects(
        createAttachment({ name: 'large.pdf', type: 'application/pdf', size: MAX_ATTACHMENT_SIZE + 1 }),
        /10 MB or smaller/
    );
});
