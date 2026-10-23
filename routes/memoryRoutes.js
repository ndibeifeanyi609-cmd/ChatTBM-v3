'use strict';

const express = require('express');
const MemoryBoundary = require('../memory/MemoryBoundary');

const router = express.Router();

function usesPostgresMemory() {
    return Boolean(process.env.DATABASE_URL);
}

router.get('/', async (req, res) => {
    const userId = req.authUser && req.authUser.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_REQUIRED', message: 'Sign in is required.' }
        });
    }

    // Chat uses the file-backed registry when DATABASE_URL is absent.
    // The Saved Memories API must read from that same store in that mode.
    const result = usesPostgresMemory()
        ? await MemoryBoundary.getPersistentMemoriesByUser(userId)
        : MemoryBoundary.getMemoriesByUser(userId);
    if (!result || result.success !== true || !Array.isArray(result.memories)) {
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

    // Delete from the same store used to create and retrieve this user's memory.
    const result = usesPostgresMemory()
        ? await MemoryBoundary.deletePersistentMemory(memoryId, userId)
        : MemoryBoundary.deleteMemory(memoryId, userId);
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
