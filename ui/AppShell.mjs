'use strict';

class AppShell {
    constructor(options = {}) {
        this.app = options.app || null;
    }

    toggleSidebar() {
        if (!this.app || typeof this.app.toggleSidebar !== 'function') {
            throw new Error('ChatTBMApp is required.');
        }

        return this.app.toggleSidebar();
    }

    closeSidebar() {
        if (!this.app || typeof this.app.closeSidebar !== 'function') {
            throw new Error('ChatTBMApp is required.');
        }

        return this.app.closeSidebar();
    }

    render() {
        return {
            type: 'app-shell',
            sidebar: {
                visible: true
            },
            main: {
                visible: true
            }
        };
    }
}

export { AppShell };
