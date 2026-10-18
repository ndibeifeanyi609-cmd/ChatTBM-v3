'use strict';

class Sidebar {
    constructor(options = {}) {
        this.app = options.app || null;
        this.onNewChat =
            typeof options.onNewChat === 'function'
                ? options.onNewChat
                : null;
    }

    newChat(interactionId) {
        if (this.onNewChat) {
            return this.onNewChat(interactionId);
        }

        if (!this.app || typeof this.app.newConversation !== 'function') {
            throw new Error('ChatTBMApp is required.');
        }

        return this.app.newConversation(interactionId);
    }

    close() {
        if (!this.app || typeof this.app.closeSidebar !== 'function') {
            throw new Error('ChatTBMApp is required.');
        }

        return this.app.closeSidebar();
    }

    render() {
        return {
            type: 'sidebar',
            brand: 'ChatTBM',
            navigation: [
                {
                    id: 'chat',
                    label: 'Chat',
                    active: true
                }
            ],
            actions: [
                {
                    id: 'new-chat',
                    label: 'New chat'
                }
            ],
            conversations: this.app && typeof this.app.getConversationList === 'function'
                ? this.app.getConversationList().map(item => ({
                    id: item.interactionId,
                    label: (
                        item.messages.find(message => message.role === 'user')?.content ||
                        'New conversation'
                    ).slice(0, 36),
                    active: item.interactionId === this.app.state.conversation.interactionId
                }))
                : []
        };
    }
}

export { Sidebar };
