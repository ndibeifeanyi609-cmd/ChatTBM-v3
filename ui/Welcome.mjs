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
    }

    render() {
        return {
            type: 'welcome',
            title: this.title,
            subtitle: this.subtitle,
            prompts: []
        };
    }
}

export { Welcome };
