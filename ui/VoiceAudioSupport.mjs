'use strict';

/**
 * Select the first recording format supported by the current browser.
 * Keep MP4 ahead of WebM for Safari compatibility.
 */
function selectSupportedAudioMimeType(MediaRecorderConstructor) {
    if (
        !MediaRecorderConstructor ||
        typeof MediaRecorderConstructor.isTypeSupported !== 'function'
    ) {
        return '';
    }

    const supportedTypes = [
        'audio/mp4',
        'audio/aac',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus'
    ];

    return supportedTypes.find(type =>
        MediaRecorderConstructor.isTypeSupported(type)
    ) || '';
}

/**
 * Copy the current chunk list before recorder cleanup can clear its state.
 */
function snapshotAudioChunks(chunks) {
    return Array.isArray(chunks) ? chunks.slice() : [];
}

export {
    selectSupportedAudioMimeType,
    snapshotAudioChunks
};
