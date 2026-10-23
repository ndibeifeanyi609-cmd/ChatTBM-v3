'use strict';

const express = require('express');
const MemoryBoundary = require('../memory/MemoryBoundary');

const router = express.Router();

router.get('/', async (req, res) => {
    const userId = req.authUser && req.authUser.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Sign in is required.' }
        });
    }

    const result = await MemoryBoundary.getPersistentMemoriesByUser(userId);
    if (!result || result.success !== true) {
        return res.status(503).json({
            success: false,
            error: { code: 'MEMORY_UNAVAILABLE', message: 'Saved memories are unavailable.' }
        });
    }

    return res.json({
        success: true,
        memories: result.memories
            .filter(memory => memory && memory.userId === userId)
            .map(memory => ({
                id: memory.id,
                type: memory.type,
                subject: memory.subject,
                value: memory.value,
                lifecycle: memory.lifecycle,
                createdAt: memory.createdAt,
                updatedAt: memory.updatedAt
            }))
    });
});

router.delete('/:memoryId', async (req, res) => {
    const userId = req.authUser && req.authUser.id;
    const memoryId = typeof req.params.memoryId === 'string' ? req.params.memoryId.trim() : '';
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Sign in is required.' }
        });
    }
    if (!memoryId || memoryId.length > 200) {
        return res.status(400).json({
            success: false,
            error: { code: 'INVALID_MEMORY_ID', message: 'A valid memory ID is required.' }
        });
    }

    const result = await MemoryBoundary.deletePersistentMemory(memoryId, userId);
    if (!result || result.success !== true) {
        const ownershipFailure = result?.ownershipFailure === true || result?.error === 'Memory ownership violation.' || result?.error === 'Memory ownership mismatch.';
        const notFound = result?.notFound === true || result?.error === 'Memory not found.';
        return res.status(ownershipFailure || notFound ? 404 : 503).json({
            success: false,
            error: {
                code: ownershipFailure || notFound ? 'MEMORY_NOT_FOUND' : 'MEMORY_DELETE_FAILED',
                message: ownershipFailure || notFound
                    ? 'That saved memory was not found for your account.'
                    : 'The saved memory could not be deleted.'
            }
        });
    }

    return res.json({ success: true, deleted: true });
});

module.exports = { router };
