import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatTBMApp } from '../ui/ChatTBMApp.mjs';

function installWindowStub() {
    const store = new Map();
    const originalWindow = globalThis.window;
    globalThis.window = {
        localStorage: {
            getItem: key => store.get(key) ?? null,
            setItem: (key, value) => store.set(key, String(value)),
            removeItem: key => store.delete(key)
        }
    };
    return () => {
        if (originalWindow === undefined) delete globalThis.window;
        else globalThis.window = originalWindow;
    };
}

function waitForAbort(signal) {
    return new Promise(resolve => {
        if (signal.aborted) {
            resolve({ success: false, error: { code: 'ABORTED' } });
            return;
        }
        signal.addEventListener('abort', () => {
            resolve({ success: false, error: { code: 'ABORTED' } });
        }, { once: true });
    });
}

test('stopping a streamed reply preserves partial text and clears submitting state', async () => {
    const restoreWindow = installWindowStub();
    try {
        const app = new ChatTBMApp({
            userId: 'cancel-test-user',
            generateStreamReply: async ({ signal, onDelta }) => {
                await onDelta('Partial answer');
                return waitForAbort(signal);
            }
        });
        const controller = new AbortController();
        const pending = app.submitMessage('Explain streaming cancellation', {
            signal: controller.signal,
            onDelta: async () => {}
        });

        assert.equal(app.state.composer.submitting, true);
        controller.abort();
        const result = await pending;

        assert.equal(result.cancelled, true);
        assert.equal(app.state.composer.submitting, false);
        assert.equal(app.state.conversation.status, 'success');
        const assistant = app.state.conversation.messages.find(message => message.role === 'assistant');
        assert.ok(assistant);
        assert.match(assistant.content, /^Partial answer/);
        assert.match(assistant.content, /Generation stopped\./);
    } finally {
        restoreWindow();
    }
});

test('stopping before the first streamed delta removes the empty assistant placeholder', async () => {
    const restoreWindow = installWindowStub();
    try {
        const app = new ChatTBMApp({
            userId: 'cancel-empty-test-user',
            generateStreamReply: async ({ signal }) => waitForAbort(signal)
        });
        const controller = new AbortController();
        const pending = app.submitMessage('Stop before first token', {
            signal: controller.signal,
            onDelta: async () => {}
        });

        controller.abort();
        const result = await pending;

        assert.equal(result.cancelled, true);
        assert.equal(app.state.composer.submitting, false);
        assert.equal(
            app.state.conversation.messages.some(message => message.role === 'assistant'),
            false
        );
    } finally {
        restoreWindow();
    }
});
