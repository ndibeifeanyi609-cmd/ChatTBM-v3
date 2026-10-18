'use strict';

import {
    UI_STATUS,
    createInitialAppState,
    createMessage
} from './AppState.mjs';

import {
    generateReply
} from './ChatAPI.mjs';

import { AppShell } from './AppShell.mjs';
import { Sidebar } from './Sidebar.mjs';
import { Header } from './Header.mjs';
import { Conversation } from './Conversation.mjs';
import { MessageList } from './MessageList.mjs';
import { Welcome } from './Welcome.mjs';
import { Composer } from './Composer.mjs';
import { LoadingState } from './LoadingState.mjs';
import { ErrorState } from './ErrorState.mjs';

class ChatTBMApp {
    constructor(options = {}) {
        this.state = createInitialAppState();

        this.userId =
            typeof options.userId === 'string' &&
            options.userId.trim()
                ? options.userId.trim()
                : 'guest';

        this.generateReply =
            typeof options.generateReply === 'function'
                ? options.generateReply
                : generateReply;

        this.components = {
            shell: new AppShell(this),
            sidebar: new Sidebar(this),
            header: new Header(this),
            conversation: new Conversation({ app: this }),
            welcome: new Welcome(),
            composer: new Composer({
                onSubmit: message => this.submitMessage(message)
            }),
            loading: new LoadingState(),
            error: new ErrorState({
                onRetry: () => this.retryLastMessage()
            })
        };

        this.components.messageList =
            new MessageList({
                conversation: this.components.conversation
            });

        if (!this.restoreConversation()) {
            this.newConversation();
        }
    }

    getStorageKey() {
        return `chattbm:conversation:${this.userId}`;
    }

    getConversationsKey() {
        return `chattbm:conversations:${this.userId}`;
    }

    getConversationList() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return [];

            const saved = window.localStorage.getItem(this.getConversationsKey());
            const list = saved ? JSON.parse(saved) : [];
            if (Array.isArray(list) && list.length) return list;

            // Show a conversation saved by the original single-chat version.
            const legacy = window.localStorage.getItem(this.getStorageKey());
            const conversation = legacy ? JSON.parse(legacy) : null;
            if (
                conversation &&
                typeof conversation.interactionId === 'string' &&
                Array.isArray(conversation.messages) &&
                conversation.messages.length
            ) {
                return [conversation];
            }

            // Always expose the active chat, including a new empty chat.
            const active = this.state && this.state.conversation;
            if (
                active &&
                typeof active.interactionId === 'string' &&
                Array.isArray(active.messages)
            ) {
                return [{
                    interactionId: active.interactionId,
                    messages: active.messages,
                    updatedAt: Date.now()
                }];
            }

            return [];
        } catch (error) {
            return [];
        }
    }

    saveConversation() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return false;
            const conversation = {
                interactionId: this.state.conversation.interactionId,
                messages: this.state.conversation.messages,
                updatedAt: Date.now()
            };
            if (!conversation.messages.length) return true;

            const list = this.getConversationList().filter(
                item => item.interactionId !== conversation.interactionId
            );
            list.unshift(conversation);
            window.localStorage.setItem(this.getConversationsKey(), JSON.stringify(list.slice(0, 50)));
            window.localStorage.setItem(this.getStorageKey(), JSON.stringify(conversation));
            window.localStorage.setItem(
                `chattbm:active:${this.userId}`,
                conversation.interactionId
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    restoreConversation(interactionId) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return false;
            const list = this.getConversationList();
            const activeId = interactionId ||
                window.localStorage.getItem(`chattbm:active:${this.userId}`);
            let parsed = list.find(item => item.interactionId === activeId);

            if (!parsed) {
                const legacy = window.localStorage.getItem(this.getStorageKey());
                parsed = legacy ? JSON.parse(legacy) : null;
            }
            if (!parsed || typeof parsed.interactionId !== 'string' || !Array.isArray(parsed.messages)) {
                return false;
            }

            const messages = parsed.messages
                .filter(message =>
                    message &&
                    typeof message.id === 'string' &&
                    (message.role === 'user' || message.role === 'assistant') &&
                    typeof message.content === 'string' &&
                    message.content.trim()
                )
                .map(message => Object.freeze({
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    timestamp: Number(message.timestamp) || Date.now()
                }));

            if (!messages.length) return false;
            this.state.conversation.interactionId = parsed.interactionId;
            this.state.conversation.messages = messages;
            this.state.conversation.status = UI_STATUS.SUCCESS;
            window.localStorage.setItem(`chattbm:active:${this.userId}`, parsed.interactionId);

            // Migrate conversations saved by the earlier single-chat version.
            if (!list.some(item => item.interactionId === parsed.interactionId)) {
                this.saveConversation();
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    openConversation(interactionId) {
        this.saveConversation();
        if (!this.restoreConversation(interactionId)) return false;
        this.state.error.currentError = null;
        this.state.composer.value = '';
        this.components.composer.clear();
        this.closeSidebar();
        return true;
    }

    setInteractionId(interactionId) {
        if (
            typeof interactionId !== 'string' ||
            !interactionId.trim()
        ) {
            throw new Error('Interaction id is required.');
        }

        this.state.conversation.interactionId =
            interactionId.trim();

        return this.state.conversation.interactionId;
    }

    setComposerValue(value) {
        this.state.composer.value =
            typeof value === 'string' ? value : '';

        this.components.composer.setValue(
            this.state.composer.value
        );

        return this.state.composer.value;
    }

    getComposerValue() {
        return this.state.composer.value;
    }


    toggleSidebar() {
        this.state.navigation.sidebarOpen =
            !this.state.navigation.sidebarOpen;

        return this.state.navigation.sidebarOpen;
    }

    closeSidebar() {
        this.state.navigation.sidebarOpen = false;
    }

    createInteractionId() {
        return `interaction-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    newConversation(interactionId) {
        this.saveConversation();
        this.setInteractionId(interactionId || this.createInteractionId());
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(`chattbm:active:${this.userId}`, this.state.conversation.interactionId);
            }
        } catch (error) {}

        this.state.conversation.messages = [];
        this.state.conversation.status = UI_STATUS.IDLE;
        this.state.composer.submitting = false;
        this.state.composer.value = '';
        this.state.error.currentError = null;

        this.components.composer.clear();

        return this.state;
    }

    getLastUserMessage() {
        const messages =
            this.state.conversation.messages;

        for (
            let index = messages.length - 1;
            index >= 0;
            index -= 1
        ) {
            if (messages[index].role === 'user') {
                return messages[index].content;
            }
        }

        return null;
    }

    async retryLastMessage() {
        const message = this.getLastUserMessage();

        if (!message) {
            return {
                success: false,
                error: {
                    code: 'RETRY_UNAVAILABLE',
                    message: 'There is no message to retry.'
                }
            };
        }

        return this.submitMessage(message, {
            appendUserMessage: false
        });
    }

    async submitMessage(message, options = {}) {
        if (
            typeof message !== 'string' ||
            !message.trim()
        ) {
            return {
                success: false,
                error: {
                    code: 'INVALID_MESSAGE',

                    message: 'A non-empty message is required.'
                }
            };
        }

        if (this.state.composer.submitting) {
            return {
                success: false,
                error: {
                    code: 'REQUEST_IN_PROGRESS',
                    message: 'A request is already in progress.'
                }
            };
        }

        const content = message.trim();

        const attachment =
            options.attachment || null;

        const appendUserMessage =
            options.appendUserMessage !== false;

        if (appendUserMessage) {
            const userMessage = createMessage({
                id: `user-${Date.now()}`,
                role: 'user',
                content
            });

            this.state.conversation.messages.push(userMessage);
            this.saveConversation();
        }

        this.state.conversation.status =
            UI_STATUS.SUBMITTING;

        this.state.composer.submitting = true;
        this.state.composer.value = '';
        this.components.composer.clear();
        this.state.error.currentError = null;

        try {
            this.state.conversation.status =
                UI_STATUS.RESPONDING;

            const result = await this.generateReply({
                message: content,
                userId: this.userId,
                attachment,
                context:
                    this.state.conversation.interactionId
                        ? {
                            interactionId:
                                this.state.conversation.interactionId
                        }
                        : undefined
            });

            if (!result || result.success !== true) {
                const error = {
                    code:
                        result?.error?.code ||
                        'ASSISTANT_ERROR',
                    message:
                        result?.error?.message ||
                        'The assistant could not complete the request.'
                };

                this.state.conversation.status =
                    UI_STATUS.ERROR;

                this.state.error.currentError = error;

                return {
                    success: false,
                    error
                };
            }

            const assistantMessage = createMessage({
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: result.response
            });

            this.state.conversation.messages.push(
                assistantMessage
            );

            this.state.conversation.status =
                UI_STATUS.SUCCESS;
            this.saveConversation();

            return {
                success: true,
                response: result.response
            };
        } catch (error) {
            const normalizedError = {
                code:
                    error?.code ||
                    'ASSISTANT_ERROR',
                message:
                    error?.message ||
                    'The assistant could not complete the request.'
            };

            this.state.conversation.status =
                UI_STATUS.ERROR;

            this.state.error.currentError =
                normalizedError;

            return {
                success: false,
                error: normalizedError
            };
        } finally {
            this.state.composer.submitting = false;
        }
    }

    render() {
        return {
            type: 'chat-tbm-app',
            shell: this.components.shell.render(),
            sidebar: this.components.sidebar.render(),
            header: this.components.header.render(),
            conversation:
                this.components.conversation.render(),
            messageList:
                this.components.messageList.render(),
            welcome: this.components.welcome.render(),
            composer: this.components.composer.render(),
            loading:
                this.state.conversation.status ===
                UI_STATUS.RESPONDING
                    ? this.components.loading.render()
                    : null,
            error:
                this.state.error.currentError
                    ? new ErrorState({
                        message:
                            this.state.error.currentError.message,
                        onRetry: () =>
                            this.retryLastMessage()
                    }).render()
                    : null
        };
    }
}



export { ChatTBMApp };
