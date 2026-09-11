'use strict';

class ErrorState {
    constructor(options = {}) {
        this.message =
            typeof options.message === 'string' &&
            options.message.trim()
                ? options.message.trim()
                : 'Something went wrong. Please try again.';

        this.onRetry =
            typeof options.onRetry === 'function'
                ? options.onRetry
                : null;
    }

    retry() {
        if (!this.onRetry) {
            return {
                success: false,
                error: {
                    code: 'RETRY_UNAVAILABLE',
                    message: 'Retry is not available.'
                }
            };
        }

        return this.onRetry();
    }

    render() {
        return {
            type: 'error',
            message: this.message,
            retryAvailable: Boolean(this.onRetry)
        };
    }
}

export { ErrorState };
