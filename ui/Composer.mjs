'use strict';

class Composer {
    constructor(options = {}) {
        this.value =
            typeof options.value === 'string'
                ? options.value
                : '';

        this.onSubmit =
            typeof options.onSubmit === 'function'
                ? options.onSubmit
                : null;
    }

    setValue(value) {
        this.value = typeof value === 'string' ? value : '';
        return this.value;
    }

    canSubmit() {
        return Boolean(this.onSubmit) && Boolean(this.value.trim());
    }

    submit() {
        if (!this.canSubmit()) {
            return {
                success: false,
                error: {
                    code: 'SUBMIT_UNAVAILABLE',
                    message: 'Message cannot be submitted.'
                }
            };
        }

        return this.onSubmit(this.value.trim());
    }

    clear() {
        this.value = '';
        return this.value;
    }

    render() {
        return {
            type: 'composer',
            value: this.value,
            submitAvailable: this.canSubmit()
        };
    }
}

export { Composer };
