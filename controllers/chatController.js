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

// =====================================
// CHAT HANDLER
// =====================================

async function chatHandler(req, res) {

    try {

        const result = await handleInteraction(
            req?.body || {}
        );

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

// =====================================
// EXPORTS
// =====================================

module.exports = {
    chatHandler
};
