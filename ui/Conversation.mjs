'use strict';

class Conversation {
    constructor(options = {}) {
        this.app = options.app || null;
    }

    getMessages() {
        if (!this.app || !this.app.state) {
            return [];
        }

        const messages = this.app.state.conversation.messages;

        return Array.isArray(messages)
            ? messages.slice()
            : [];
    }

    getStatus() {
        if (!this.app || !this.app.state) {
            return 'idle';
        }

        return this.app.state.conversation.status;
    }

    render() {
        return {
            type: 'conversation',
            status: this.getStatus(),
            messages: this.getMessages()
        };
    }
}

export { Conversation };
