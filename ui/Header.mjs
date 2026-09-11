'use strict';

class Header {
    constructor(options = {}) {
        this.app = options.app || null;
        this.title =
            typeof options.title === 'string' &&
            options.title.trim()
                ? options.title.trim()
                : 'New chat';
    }

    toggleSidebar() {
        if (!this.app || typeof this.app.toggleSidebar !== 'function') {
            throw new Error('ChatTBMApp is required.');
        }

        return this.app.toggleSidebar();
    }

    render() {
        return {
            type: 'header',
            title: this.title,
            actions: [
                {
                    id: 'menu',
                    label: 'Open navigation'
                }
            ]
        };
    }
}

export { Header };
