'use strict';

class LoadingState {
    constructor(options = {}) {
        this.label =
            typeof options.label === 'string' &&
            options.label.trim()
                ? options.label.trim()
                : 'ChatTBM is thinking…';
    }

    render() {
        return {
            type: 'loading',
            label: this.label,
            status: 'responding'
        };
    }
}

export { LoadingState };
