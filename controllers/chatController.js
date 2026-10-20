'use strict';

// =====================================
// ChatTBM
// REG-091 Chat Interaction Boundary
//
// HTTP/application-surface adapter.
//
// Responsibility:
// - Receive HTTP requests
// - Pass canonical interaction input to
//   Chat Interaction Boundary
// - Translate controlled results to HTTP
//
// MUST NOT:
// - Own interaction state
// - Coordinate Context
// - Call Assistant Engine directly
// - Access AI Provider boundaries
// =====================================

const {
    handleInteraction
} = require('../chatInteraction/ChatInteractionBoundary');
const { authenticatedUserId } = require('../auth/chatIdentity');

// =====================================
// CHAT HANDLER
// =====================================

async function chatHandler(req, res) {

    try {

        const body = req?.body || {};
        const userId = authenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_REQUIRED",
                    message: "Sign in to continue."
                }
            });
        }

        const result = await handleInteraction({
            ...body,
            userId
        });

        if (
            !result ||
            result.success === false
        ) {

            const errorCode =
                result?.error?.code;

            const status =
                errorCode === 'CHAT_INTERACTION_ERROR' &&
                !result?.userId
                    ? 400
                    : errorCode === 'CONTEXT_UNAVAILABLE'
                        ? 503
                        : errorCode === 'ASSISTANT_ERROR' ||
                          errorCode === 'PROVIDER_UNAVAILABLE'
                            ? 503
                            : 400;

            return res.status(status).json({

                success: false,

                version: '7.0.0',

                userId:
                    result?.userId,

                interactionId:
                    result?.interactionId,

                error:
                    result?.error || {
                        code: 'CHAT_INTERACTION_ERROR',
                        message: 'Chat interaction failed.'
                    }

            });

        }

        return res.json({

            success: true,

            version: '7.0.0',

            userId:
                result.userId,

            interactionId:
                result.interactionId,

            response:
                result.response

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: 'Unable to process request.',

            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined

        });

    }

}


async function chatStreamHandler(req, res) {
    const body = req?.body || {};
    const userId = authenticatedUserId(req);
    if (!userId) {
        return res.status(401).json({
            success: false,
            error: {
                code: "AUTHENTICATION_REQUIRED",
                message: "Sign in to continue."
            }
        });
    }

    const { handleStreamingInteraction } = require('../chatInteraction/ChatInteractionBoundary');
    const controller = new AbortController();
    let closed = false;

    res.on('close', () => {
        if (!res.writableEnded) {
            closed = true;
            controller.abort();
        }
    });

    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (event) => {
        if (closed || res.destroyed || res.writableEnded) return;
        res.write(JSON.stringify(event) + '\n');
    };

    send({ type: 'start' });

    try {
        const result = await handleStreamingInteraction(
            { ...body, userId },
            async (delta) => send({ type: 'delta', text: delta }),
            controller.signal
        );

        if (closed || res.destroyed || res.writableEnded) return;

        if (!result || result.success !== true) {
            send({
                type: 'error',
                error: result?.error || {
                    code: 'CHAT_STREAM_FAILED',
                    message: 'Chat streaming failed.'
                }
            });
            return res.end();
        }

        send({
            type: 'complete',
            userId: result.userId,
            interactionId: result.interactionId,
            response: result.response
        });
        return res.end();
    } catch (error) {
        send({
            type: 'error',
            error: {
                code: error?.code || 'CHAT_STREAM_FAILED',
                message: error?.message || 'Chat streaming failed.'
            }
        });
        return res.end();
    }
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
    chatHandler,
    chatStreamHandler
};
