'use strict';

const API_BASE_URL = (() => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
    return 'https://chattbm-backend.onrender.com';
})();

async function generateReply({
    message,
    userId = 'guest',
    context
} = {}) {
    if (typeof message !== 'string' || !message.trim()) {
        return {
            success: false,
            error: {
                code: 'INVALID_MESSAGE',
                message: 'A non-empty message is required.'
            }
        };
    }

    try {
        const response = await fetch(API_BASE_URL + '/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message.trim(),
                interactionId: context?.interactionId,
                userId
            })
        });

        const data = await response.json();

        if (!response.ok || !data || data.success !== true) {
            return {
                success: false,
                error: {
                    code:
                        data?.error?.code ||
                        'CHAT_API_ERROR',
                    message:
                        data?.error?.message ||
                        data?.message ||
                        'The assistant could not complete the request.'
                }
            };
        }

        return {
            success: true,
            response: data.response
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code: error?.code || 'CHAT_API_UNAVAILABLE',
                message:
                    error?.message ||
                    'Unable to connect to the ChatTBM server.'
            }
        };
    }
}

export { generateReply };
