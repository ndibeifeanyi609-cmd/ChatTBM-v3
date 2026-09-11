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

    toggleSidebar() {
        this.state.navigation.sidebarOpen =
            !this.state.navigation.sidebarOpen;

        return this.state.navigation.sidebarOpen;
    }

    closeSidebar() {
        this.state.navigation.sidebarOpen = false;
    }

    newConversation(interactionId) {
        this.setInteractionId(interactionId);

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

        const appendUserMessage =
            options.appendUserMessage !== false;

        if (appendUserMessage) {
            const userMessage = createMessage({
                id: `user-${Date.now()}`,
                role: 'user',
                content
            });

            this.state.conversation.messages.push(userMessage);
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
