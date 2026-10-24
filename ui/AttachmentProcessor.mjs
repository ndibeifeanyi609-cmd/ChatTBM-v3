'use strict';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function fileExtension(name = '') {
    const index = name.lastIndexOf('.');
    return index >= 0 ? name.slice(index).toLowerCase() : '';
}

function encodeBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(
            ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length))
        );
    }

    return btoa(binary);
}

async function createAttachment(file) {
    if (!file) return null;

    if (Number(file.size) > MAX_ATTACHMENT_SIZE) {
        throw new Error('Attachments must be 10 MB or smaller.');
    }

    const extension = fileExtension(file.name);
    const declaredType = typeof file.type === 'string' ? file.type : '';
    const mimeType = extension === '.pdf'
        ? 'application/pdf'
        : ['.txt', '.md'].includes(extension)
            ? 'text/plain'
            : declaredType;

    if (mimeType.startsWith('image/')) {
        const buffer = await file.arrayBuffer();
        return {
            type: 'image',
            name: file.name || 'image',
            mimeType,
            data: encodeBase64(buffer)
        };
    }

    if (mimeType === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        return {
            type: 'document',
            name: file.name || 'document.pdf',
            mimeType: 'application/pdf',
            data: encodeBase64(buffer)
        };
    }

    if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
        const buffer = await file.arrayBuffer();
        const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        return {
            type: 'text',
            name: file.name || 'document.txt',
            mimeType: 'text/plain',
            text
        };
    }

    throw new Error(
        'Supported attachments are images, PDF, TXT, and Markdown files.'
    );
}

export { createAttachment, MAX_ATTACHMENT_SIZE };
