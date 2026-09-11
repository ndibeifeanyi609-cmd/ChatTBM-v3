'use strict';

class Message {
    constructor(message = {}) {
        this.message = {
            id: message.id || null,
            role: message.role || null,
            content:
                typeof message.content === 'string'
                    ? message.content
                    : ''
        };
    }

    isUser() {
        return this.message.role === 'user';
    }

    isAssistant() {
        return this.message.role === 'assistant';
    }

    render() {
        return {
            type: 'message',
            id: this.message.id,
            role: this.message.role,
            content: this.message.content
        };
    }
}

export { Message };
