'use strict';

class Welcome {
    constructor(options = {}) {
        this.title =
            typeof options.title === 'string' &&
            options.title.trim()
                ? options.title.trim()
                : 'Welcome to ChatTBM';

        this.subtitle =
            typeof options.subtitle === 'string' &&
            options.subtitle.trim()
                ? options.subtitle.trim()
                : 'Ask anything. Build ideas. Solve real-world problems.';

        this.prompts = [
            {
                id: 'create',
                icon: '✦',
                title: 'Create',
                description: 'Create something',
                message: 'Help me create something useful.'
            },
            {
                id: 'solve',
                icon: '⚡',
                title: 'Solve',
                description: 'Solve a problem',
                message: 'Help me solve a problem.'
            },
            {
                id: 'write',
                icon: '✎',
                title: 'Write',
                description: 'Write & refine',
                message: 'Help me write and refine something.'
            },
            {
                id: 'explore',
                icon: '◉',
                title: 'Explore',
                description: 'Explore ideas',
                message: 'Help me explore an idea.'
            }
        ];
    }

    render() {
        return {
            type: 'welcome',
            title: this.title,
            subtitle: this.subtitle,
            prompts: this.prompts.map(prompt => ({ ...prompt }))
        };
    }
}

export { Welcome };
