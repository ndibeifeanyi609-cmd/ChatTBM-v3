'use strict';

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    selectSupportedAudioMimeType,
    snapshotAudioChunks
} from '../ui/VoiceAudioSupport.mjs';

test('Safari-supported MP4 is preferred when available', () => {
    const recorder = {
        isTypeSupported: type =>
            type === 'audio/mp4' || type === 'audio/webm;codecs=opus'
    };

    assert.equal(selectSupportedAudioMimeType(recorder), 'audio/mp4');
});

test('WebM is selected when MP4 is unavailable', () => {
    const recorder = {
        isTypeSupported: type => type === 'audio/webm;codecs=opus'
    };

    assert.equal(
        selectSupportedAudioMimeType(recorder),
        'audio/webm;codecs=opus'
    );
});

test('empty MIME type is returned when no candidate is supported', () => {
    assert.equal(
        selectSupportedAudioMimeType({
            isTypeSupported: () => false
        }),
        ''
    );
});

test('audio chunks are snapshotted before recorder state is cleared', () => {
    const original = [{ id: 1 }, { id: 2 }];
    const snapshot = snapshotAudioChunks(original);

    original.length = 0;

    assert.deepEqual(snapshot, [{ id: 1 }, { id: 2 }]);
    assert.notEqual(snapshot, original);
});

test('invalid chunk input produces an empty snapshot', () => {
    assert.deepEqual(snapshotAudioChunks(null), []);
});
