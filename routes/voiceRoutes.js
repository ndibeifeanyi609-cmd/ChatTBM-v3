'use strict';

// =====================================
// ChatTBM
// Voice/STT Routes
// =====================================

const express = require('express');

// =====================================
// CREATE VOICE ROUTER
// =====================================

function createVoiceRoutes(
    voiceTranscribeHandler
) {

    if (
        typeof voiceTranscribeHandler !==
        'function'
    ) {
        throw new Error(
            'Voice transcription handler is required.'
        );
    }

    const router =
        express.Router();

    // =====================================
    // VOICE TRANSCRIPTION
    // =====================================

    router.post(
        '/transcribe',
        voiceTranscribeHandler
    );

    return router;
}

// =====================================
// EXPORT
// =====================================

module.exports = {
    createVoiceRoutes
};
