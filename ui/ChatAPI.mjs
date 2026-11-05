'use strict';

const API_BASE_URL = (() => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
    if (host === 'chattbm-password-reset-staging.onrender.com') return '';
    return 'https://chattbm-backend.onrender.com';
})();


function readSessionToken() {
    try {
        return window.sessionStorage.getItem('chattbm_session_token') || '';
    } catch (_) {
        return '';
    }
}

function writeSessionToken(token) {
    try {
        if (token) window.sessionStorage.setItem('chattbm_session_token', token);
    } catch (_) {}
}

function clearSessionToken() {
    try {
        window.sessionStorage.removeItem('chattbm_session_token');
    } catch (_) {}
}

function requestHeaders(json = false) {
    const headers = json ? { 'Content-Type': 'application/json' } : {};
    const token = readSessionToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
}

async function authRequest(path, body) {
    try {
        const response = await fetch(API_BASE_URL + '/api/auth/' + path, {
            method: body ? 'POST' : 'GET',
            credentials: 'include',
            headers: requestHeaders(Boolean(body)),
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        const data = await response.json();
        if (!response.ok || !data || data.success !== true) {
            return {
                success: false,
                error: {
                    code: data?.error?.code || 'AUTH_API_ERROR',
                    message: (typeof data?.error === 'string' ? data.error : data?.error?.message) || 'Authentication request failed.'
                }
            };
        }
        if (path === 'login' && data.token) writeSessionToken(data.token);
        if (path === 'logout') clearSessionToken();
        return data;
    } catch (error) {
        return {
            success: false,
            error: {
                code: error?.code || 'AUTH_API_UNAVAILABLE',
                message: 'Unable to connect to the ChatTBM authentication service.'
            }
        };
    }
}

function registerAccount(email, password) {
    return authRequest('register', { email, password });
}

function loginAccount(email, password) {
    return authRequest('login', { email, password });
}

function getCurrentUser() {
    return authRequest('me');
}

function logoutAccount() {
    return authRequest('logout', {});
}

function requestPasswordReset(email) {
    return authRequest('password-reset/request', { email });
}

function confirmPasswordReset(token, password) {
    return authRequest('password-reset/confirm', { token, password });
}

function confirmEmailVerification(token) {
    return authRequest('email-verification/confirm', { token });
}

function requestEmailVerification(email) {
    return authRequest('email-verification/request', { email });
}

async function conversationHistoryRequest(path, method = 'GET', body) {
    try {
        const response = await fetch(API_BASE_URL + '/api/conversations' + path, {
            method,
            credentials: 'include',
            headers: requestHeaders(Boolean(body)),
            ...(body ? { body: JSON.stringify(body) } : {})
        });
        const data = await response.json();
        if (!response.ok || !data || data.success !== true) {
            return {
                success: false,
                error: {
                    code: data?.error?.code || 'CONVERSATION_HISTORY_ERROR',
                    message: data?.error?.message || 'Conversation history request failed.'
                }
            };
        }
        return data;
    } catch (error) {
        return {
            success: false,
            error: {
                code: error?.code || 'CONVERSATION_HISTORY_UNAVAILABLE',
                message: 'Unable to sync conversation history with the server.'
            }
        };
    }
}

function getConversationHistory() {
    return conversationHistoryRequest('');
}

function saveConversationHistory(conversation) {
    if (!conversation || typeof conversation.interactionId !== 'string') {
        return Promise.resolve({
            success: false,
            error: { code: 'INVALID_CONVERSATION', message: 'Conversation id is required.' }
        });
    }
    return conversationHistoryRequest(
        '/' + encodeURIComponent(conversation.interactionId),
        'PUT',
        { messages: conversation.messages }
    );
}

async function generateReply({
    message,
    userId = 'guest',
    context,
    attachment = null
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
            credentials: 'include',
            headers: requestHeaders(true),
            body: JSON.stringify({
                message: message.trim(),
                interactionId: context?.interactionId,
                userId,
                attachment
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


async function generateReplyStream({
    message,
    userId = 'guest',
    context,
    attachment = null,
    onDelta,
    signal
} = {}) {
    if (typeof message !== 'string' || !message.trim()) {
        return { success: false, error: { code: 'INVALID_MESSAGE', message: 'A non-empty message is required.' } };
    }
    if (typeof onDelta !== 'function') {
        return { success: false, error: { code: 'INVALID_STREAM_CALLBACK', message: 'A streaming callback is required.' } };
    }

    try {
        const response = await fetch(API_BASE_URL + '/api/chat/stream', {
            method: 'POST',
            credentials: 'include',
            headers: requestHeaders(true),
            signal,
            body: JSON.stringify({
                message: message.trim(),
                interactionId: context?.interactionId,
                userId,
                attachment
            })
        });

        if (!response.ok || !response.body) {
            let data = {};
            try { data = await response.json(); } catch (_) {}
            return { success: false, error: {
                code: data?.error?.code || 'CHAT_STREAM_HTTP_ERROR',
                message: data?.error?.message || 'The streaming request could not start.'
            } };
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let complete = null;

        const processLine = async line => {
            if (!line.trim()) return;
            let event;
            try { event = JSON.parse(line); } catch (_) {
                throw new Error('The server returned an invalid streaming event.');
            }
            if (event.type === 'delta' && typeof event.text === 'string') {
                await onDelta(event.text);
            } else if (event.type === 'complete') {
                complete = event;
            } else if (event.type === 'error') {
                const error = new Error(event.error?.message || 'Chat streaming failed.');
                error.code = event.error?.code || 'CHAT_STREAM_FAILED';
                throw error;
            }
        };

        while (true) {
            const { value, done } = await reader.read();
            buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) await processLine(line);
            if (done) break;
        }
        if (buffer.trim()) await processLine(buffer);

        if (!complete || typeof complete.response !== 'string') {
            return { success: false, error: {
                code: 'STREAM_INTERRUPTED',
                message: 'The response stream ended before completion.'
            } };
        }
        return { success: true, response: complete.response };
    } catch (error) {
        return { success: false, error: {
            code: error?.code || 'CHAT_STREAM_ERROR',
            message: error?.message || 'The streaming request was interrupted.'
        } };
    }
}

async function getSavedMemories() {
    try {
        const response = await fetch(API_BASE_URL + '/api/memories', {
            method: 'GET', credentials: 'include', headers: requestHeaders()
        });
        const data = await response.json();
        if (!response.ok || data?.success !== true) return { success: false, error: data?.error?.message || 'Unable to load saved memories.' };
        return { success: true, memories: Array.isArray(data.memories) ? data.memories : [] };
    } catch (_) { return { success: false, error: 'Unable to connect to saved memories.' }; }
}

async function deleteSavedMemory(memoryId) {
    try {
        const response = await fetch(API_BASE_URL + '/api/memories/' + encodeURIComponent(memoryId), {
            method: 'DELETE', credentials: 'include', headers: requestHeaders()
        });
        const data = await response.json();
        if (!response.ok || data?.success !== true) return { success: false, error: data?.error?.message || 'Unable to delete saved memory.' };
        return { success: true };
    } catch (_) { return { success: false, error: 'Unable to connect to saved memories.' }; }
}

async function transcribeVoice({
    audio,
    mimeType = 'audio/webm',
    language = 'en-US'
} = {}) {
    if (!audio) {
        return {
            success: false,
            error: {
                code: 'INVALID_AUDIO',
                message: 'Audio input is required.'
            }
        };
    }

    try {
        const response = await fetch(
            API_BASE_URL + '/api/voice/transcribe',
            {
                method: 'POST',
                credentials: 'include',
                headers: requestHeaders(true),
                body: JSON.stringify({
                    audio,
                    mimeType,
                    language
                })
            }
        );

        const data = await response.json();

        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {
            return {
                success: false,
                error: {
                    code:
                        data?.error?.code ||
                        'VOICE_API_ERROR',
                    message:
                        data?.error?.message ||
                        data?.message ||
                        'Voice transcription failed.'
                }
            };
        }

        return {
            success: true,
            transcript: data.transcript,
            provider: data.provider,
            model: data.model,
            metadata: data.metadata || {}
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code:
                    error?.code ||
                    'VOICE_API_UNAVAILABLE',
                message:
                    error?.message ||
                    'Unable to connect to the voice transcription service.'
            }
        };
    }
}

export {
    generateReply,
    generateReplyStream,
    transcribeVoice,
    registerAccount,
    loginAccount,
    getCurrentUser,
    logoutAccount,
    requestPasswordReset,
    confirmPasswordReset,
    confirmEmailVerification,
    requestEmailVerification,
    getConversationHistory,
    saveConversationHistory,
    getSavedMemories,
    deleteSavedMemory,
    readSessionToken as getGoogleLinkSessionToken
};
