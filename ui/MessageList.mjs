'use strict';

import { Message } from './Message.mjs';

class MessageList {
    constructor(options = {}) {
        this.conversation = options.conversation || null;
    }

    getMessages() {
        if (
            !this.conversation ||
            typeof this.conversation.getMessages !== 'function'
        ) {
            return [];
        }

        return this.conversation.getMessages();
    }

    render() {
        return {
            type: 'message-list',
            messages: this.getMessages().map(
                (message) => new Message(message).render()
            )
        };
    }
}

export { MessageList };
