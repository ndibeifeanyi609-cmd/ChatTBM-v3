'use strict';

import { ChatTBMApp } from './ChatTBMApp.mjs';

class ChatTBMBrowser {
    constructor(options = {}) {
        this.root = options.root || document.body;
        this.app = options.app || new ChatTBMApp({
            userId: options.userId
        });

        this.voiceRecognition = null;
        this.voiceListening = false;
        this.selectedFile = null;
    }

    render() {
        const model = this.app.render();
        this.root.innerHTML = '';

        const app = document.createElement('div');
        app.className = 'ui-app';

        const shell = document.createElement('div');
        shell.className = 'ui-app-shell';

        shell.appendChild(this.renderSidebar(model.sidebar));

        const backdrop = document.createElement('button');
        backdrop.type = 'button';
        backdrop.className = 'ui-sidebar-backdrop';
        backdrop.setAttribute('aria-label', 'Close navigation');
        backdrop.dataset.action = 'close-sidebar';
        shell.appendChild(backdrop);

        const main = document.createElement('main');
        main.className = 'ui-main';
        main.appendChild(this.renderHeader(model.header));

        const conversation = document.createElement('section');
        conversation.className = 'ui-conversation';

        if (model.messageList.messages.length) {
            conversation.appendChild(
                this.renderMessages(model.messageList.messages)
            );
        } else {
            conversation.appendChild(
                this.renderWelcome(model.welcome)
            );
        }

        if (model.loading) {
            conversation.appendChild(
                this.renderLoading(model.loading)
            );
        }

        if (model.error) {
            conversation.appendChild(
                this.renderError(model.error)
            );
        }

        main.appendChild(conversation);
        main.appendChild(this.renderComposer(model.composer));

        shell.appendChild(main);
        app.appendChild(shell);
        this.root.appendChild(app);

        this.bind(app);

        return app;
    }

    renderSidebar(model) {
        const aside = document.createElement('aside');
        aside.className = 'ui-sidebar';

        if (this.app.state.navigation.sidebarOpen) {
            aside.classList.add('is-open');
        }

        const brand = document.createElement('div');
        brand.className = 'ui-sidebar-brand';
        const logo = document.createElement('img');
        logo.className = 'ui-sidebar-logo';
        logo.src = '4AEBEE18-6FA9-470F-9C0F-29930C59BCB7.png';
        logo.alt = 'ChatTBM';
        brand.appendChild(logo);

        const brandText = document.createElement('span');
        brandText.textContent = model.brand || 'ChatTBM';
        brand.appendChild(brandText);
        aside.appendChild(brand);

        const nav = document.createElement('nav');
        nav.className = 'ui-sidebar-nav';

        (model.navigation || []).forEach(item => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-sidebar-item';
            if (item.active) {
                button.classList.add('is-active');
            }
            button.textContent = item.label;
            button.dataset.action = item.id;
            nav.appendChild(button);
        });

        const actions = document.createElement('div');
        actions.className = 'ui-sidebar-actions';

        (model.actions || []).forEach(item => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-sidebar-action';
            button.textContent = item.label;
            button.dataset.action = item.id;
            actions.appendChild(button);
        });

        aside.appendChild(nav);
        aside.appendChild(actions);

        return aside;
    }

    renderHeader(model) {
        const header = document.createElement('header');
        header.className = 'ui-header';

        const menu = document.createElement('button');
        menu.type = 'button';
        menu.className = 'ui-icon-button';
        menu.textContent = '☰';
        menu.setAttribute('aria-label', 'Open navigation');
        menu.dataset.action = 'menu';

        const title = document.createElement('div');
        title.className = 'ui-header-title';
        title.textContent = model.title;

        header.appendChild(menu);
        header.appendChild(title);

        return header;
    }

    renderWelcome(model) {
        const element = document.createElement('div');
        element.className = 'ui-welcome';

        const identity = document.createElement('div');
        identity.className = 'ui-welcome-identity';

        const logo = document.createElement('div');
        logo.className = 'ui-welcome-logo';
        logo.setAttribute('aria-hidden', 'true');

        const welcomeLogo = document.createElement('img');
        welcomeLogo.src = '4AEBEE18-6FA9-470F-9C0F-29930C59BCB7.png';
        welcomeLogo.alt = '';
        logo.appendChild(welcomeLogo);

        const brand = document.createElement('div');
        brand.className = 'ui-welcome-brand';
        brand.textContent = 'ChatTBM';

        identity.appendChild(logo);
        identity.appendChild(brand);

        const title = document.createElement('h1');
        title.className = 'ui-welcome-title';
        title.textContent = model.title;

        const subtitle = document.createElement('p');
        subtitle.className = 'ui-welcome-subtitle';
        subtitle.textContent = model.subtitle;

        element.appendChild(identity);
        element.appendChild(title);
        element.appendChild(subtitle);

        return element;
    }

    renderMessages(messages) {
        const list = document.createElement('div');
        list.className = 'ui-message-list';

        messages.forEach(message => {
            const item = document.createElement('article');
            item.className = 'ui-message';

            item.classList.add(
                message.role === 'user'
                    ? 'ui-message--user'
                    : 'ui-message--assistant'
            );

            const content = document.createElement('div');
            content.className = 'ui-message-content';
            content.textContent = message.content;

            item.appendChild(content);

            if (message.role === 'assistant') {
                const actions = document.createElement('div');
                actions.className = 'ui-message-actions';

                const copy = document.createElement('button');
                copy.type = 'button';
                copy.className = 'ui-message-copy';
                copy.textContent = 'Copy';
                copy.setAttribute('aria-label', 'Copy assistant response');
                copy.dataset.action = 'copy-message';
                copy.dataset.messageId = message.id || '';

                actions.appendChild(copy);
                item.appendChild(actions);
            }

            list.appendChild(item);
        });

        return list;
    }

    renderLoading(model) {
        const element = document.createElement('div');
        element.className = 'ui-loading';
        element.textContent = model.label;
        element.setAttribute('aria-live', 'polite');

        return element;
    }

    renderError(model) {
        const element = document.createElement('div');
        element.className = 'ui-error';
        element.setAttribute('role', 'alert');

        const message = document.createElement('span');
        message.textContent = model.message;
        element.appendChild(message);

        if (model.retryAvailable) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ui-retry-button';
            button.textContent = 'Retry';
            button.dataset.action = 'retry';
            element.appendChild(button);
        }

        return element;
    }

    renderComposer(model) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ui-composer-wrap';

        const form = document.createElement('form');
        form.className = 'ui-composer';

        const textarea = document.createElement('textarea');
        textarea.value = model.value || '';
        textarea.placeholder = 'Ask ChatTBM';
        textarea.rows = 1;
        textarea.dataset.role = 'composer';
        textarea.setAttribute(
            'aria-label',
            'Message ChatTBM'
        );

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.className = 'ui-file-input';
        fileInput.accept = 'image/*,.pdf,.txt,.md,.doc,.docx';
        fileInput.setAttribute('aria-label', 'Choose a file');
        fileInput.dataset.role = 'file-input';

        const fileButton = document.createElement('button');
        fileButton.type = 'button';
        fileButton.className = 'ui-file-button';
        fileButton.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48"/>
            </svg>
        `;
        fileButton.setAttribute('aria-label', 'Attach a file');
        fileButton.dataset.action = 'file-attachment';

        const attachmentPreview = document.createElement('div');
        attachmentPreview.className = 'ui-attachment-preview';
        attachmentPreview.dataset.role = 'attachment-preview';
        attachmentPreview.hidden = true;

        const voice = document.createElement('button');
        voice.type = 'button';
        voice.className = 'ui-voice-button';
        this.setVoiceButtonIcon(voice);
        voice.setAttribute('aria-label', 'Use voice input');
        voice.dataset.action = 'voice-input';

        const button = document.createElement('button');
        button.type = 'submit';
        button.className = 'ui-send-button';
        button.textContent = '↑';
        button.setAttribute(
            'aria-label',
            'Send message'
        );
        button.disabled = !model.submitAvailable;

        const controls = document.createElement('div');
        controls.className = 'ui-composer-controls';

        controls.appendChild(fileInput);
        controls.appendChild(fileButton);
        controls.appendChild(textarea);
        controls.appendChild(voice);
        controls.appendChild(button);

        form.appendChild(attachmentPreview);
        form.appendChild(controls);
        wrapper.appendChild(form);

        this.renderAttachmentPreview(wrapper);

        return wrapper;
    }

    bind(root) {
        const input =
            root.querySelector('[data-role="composer"]');

        if (input) {
            input.addEventListener('input', () => {
                this.app.setComposerValue(input.value);
                const sendButton = input.form.querySelector('.ui-send-button');
                if (sendButton) {
                    sendButton.disabled = !this.app.components.composer.canSubmit();
                }
            });

            input.form.addEventListener('submit', event => {
                event.preventDefault();
                this.submit();
            });

            input.addEventListener('keydown', event => {
                if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                ) {
                    event.preventDefault();
                    this.submit();
                }
            });
        }

        const fileButton =
            root.querySelector('[data-action="file-attachment"]');
        const fileInput =
            root.querySelector('[data-role="file-input"]');

        if (fileButton && fileInput) {
            fileButton.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', () => {
                this.selectedFile =
                    fileInput.files && fileInput.files[0]
                        ? fileInput.files[0]
                        : null;

                this.renderAttachmentPreview(root);
            });
        }

        root.querySelectorAll(
            '[data-action="close-sidebar"]'
        ).forEach(button => {
            button.addEventListener('click', () => {
                this.app.closeSidebar();
                this.render();
            });
        });

        root.querySelectorAll(
            '[data-action="menu"]'
        ).forEach(button => {
            button.addEventListener('click', () => {
                this.app.toggleSidebar();
                this.render();
            });
        });

        root.querySelectorAll(
            '[data-action="new-chat"]'
        ).forEach(button => {
            button.addEventListener('click', () => {
                this.app.newConversation();
                this.render();
            });
        });

        root.querySelectorAll(
            '[data-action="retry"]'
        ).forEach(button => {
            button.addEventListener('click', () => {
                this.retry();
            });
        });

        root.querySelectorAll(
            '.ui-welcome-prompt'
        ).forEach(button => {
            button.addEventListener('click', () => {
                const message = button.dataset.promptMessage || '';
                if (!message) return;
                const input = this.root.querySelector('[data-role="composer"]');
                if (!input) return;
                this.app.setComposerValue(message);
                input.value = message;
                input.focus();
                const sendButton = input.form.querySelector('.ui-send-button');
                if (sendButton) {
                    sendButton.disabled = !this.app.components.composer.canSubmit();
                }
            });
        });

        root.querySelectorAll(
            '[data-action="voice-input"]'
        ).forEach(button => {
            button.addEventListener('click', () => {
                this.toggleVoiceInput(button);
            });
        });

        root.querySelectorAll(
            '[data-action="copy-message"]'
        ).forEach(button => {
            button.addEventListener('click', async () => {
                const messageId = button.dataset.messageId;

                const message =
                    this.app.state.conversation.messages.find(
                        item => String(item.id) === String(messageId)
                    );

                if (!message || message.role !== 'assistant') {
                    return;
                }

                try {
                    await navigator.clipboard.writeText(message.content);

                    button.textContent = 'Copied';
                    button.setAttribute(
                        'aria-label',
                        'Assistant response copied'
                    );

                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.setAttribute(
                            'aria-label',
                            'Copy assistant response'
                        );
                    }, 1400);
                } catch (error) {
                    button.textContent = 'Copy failed';

                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 1400);
                }
            });
        });
    }

    renderAttachmentPreview(root) {
        const preview =
            root.querySelector('[data-role="attachment-preview"]');

        if (!preview) {
            return;
        }

        preview.innerHTML = '';

        const file = this.selectedFile;

        if (!file) {
            preview.hidden = true;
            return;
        }

        preview.hidden = false;

        const item = document.createElement('div');
        item.className = 'ui-attachment-item';

        if (file.type && file.type.startsWith('image/')) {
            const image = document.createElement('img');
            image.className = 'ui-attachment-thumbnail';
            image.alt = file.name || 'Selected image';

            const objectUrl = URL.createObjectURL(file);
            image.src = objectUrl;

            image.addEventListener('load', () => {
                URL.revokeObjectURL(objectUrl);
            }, { once: true });

            item.appendChild(image);
        } else {
            const icon = document.createElement('span');
            icon.className = 'ui-attachment-icon';
            icon.textContent = '📄';
            icon.setAttribute('aria-hidden', 'true');

            item.appendChild(icon);
        }

        const name = document.createElement('span');
        name.className = 'ui-attachment-name';
        name.textContent = file.name || 'Selected file';
        name.title = file.name || 'Selected file';

        item.appendChild(name);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ui-attachment-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', 'Remove selected file');

        remove.addEventListener('click', () => {
            this.selectedFile = null;

            const fileInput =
                root.querySelector('[data-role="file-input"]');

            if (fileInput) {
                fileInput.value = '';
            }

            this.renderAttachmentPreview(root);
        });

        item.appendChild(remove);
        preview.appendChild(item);
    }

    toggleVoiceInput(button) {
        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!Recognition) {
            button.textContent = 'N/A';
            button.setAttribute(
                'aria-label',
                'Voice input is not supported in this browser'
            );

            setTimeout(() => {
                this.setVoiceButtonIcon(button);
                button.setAttribute(
                    'aria-label',
                    'Use voice input'
                );
            }, 1400);

            return;
        }

        if (this.voiceListening) {
            if (this.voiceRecognition) {
                this.voiceRecognition.stop();
            }
            return;
        }

        const input =
            this.root.querySelector('[data-role="composer"]');

        if (!input) {
            return;
        }

        const recognition = new Recognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        this.voiceRecognition = recognition;
        this.voiceListening = true;

        button.classList.add('is-listening');
        this.setVoiceButtonIcon(button);
        button.setAttribute(
            'aria-label',
            'Stop voice input'
        );

        recognition.onresult = event => {
            const result = event.results &&
                event.results[0] &&
                event.results[0][0];

            const transcript =
                result && typeof result.transcript === 'string'
                    ? result.transcript.trim()
                    : '';

            if (!transcript) {
                return;
            }

            this.app.setComposerValue(transcript);
            input.value = transcript;

            const sendButton =
                input.form.querySelector('.ui-send-button');

            if (sendButton) {
                sendButton.disabled =
                    !this.app.components.composer.canSubmit();
            }
        };

        recognition.onerror = event => {
            const errorCode =
                event && typeof event.error === 'string'
                    ? event.error
                    : 'unknown';

            this.voiceErrorActive = true;

            this.stopVoiceInput(button);

            button.textContent = 'Voice unavailable';

            button.setAttribute(
                'aria-label',
                `Voice input error: ${errorCode}`
            );

            setTimeout(() => {
                this.setVoiceButtonIcon(button);
                button.setAttribute(
                    'aria-label',
                    'Use voice input'
                );
            }, 1800);
        };

        recognition.onend = () => {
            if (this.voiceErrorActive) {
                this.voiceErrorActive = false;
                return;
            }

            this.stopVoiceInput(button);
        };

        try {
            recognition.start();
        } catch (error) {
            this.stopVoiceInput(button);
        }
    }

    setVoiceButtonIcon(button) {
        if (!button) return;
        button.innerHTML = '<span class="ui-voice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="12" rx="4"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M9 21h6"></path></svg></span>';
    }

    stopVoiceInput(button) {
        this.voiceListening = false;
        this.voiceRecognition = null;

        if (!button) {
            return;
        }

        button.classList.remove('is-listening');
        this.setVoiceButtonIcon(button);
        button.setAttribute(
            'aria-label',
            'Use voice input'
        );
    }

    async submit() {
        const message =
            this.app.getComposerValue();

        if (!message.trim()) {
            return;
        }

        const pending =
            this.app.submitMessage(message);

        this.render();

        const result = await pending;

        this.render();

        return result;
    }

    async retry() {
        const pending =
            this.app.retryLastMessage();

        this.render();

        const result = await pending;

        this.render();

        return result;
    }

    mount() {
        return this.render();
    }
}

function mountChatTBM(options = {}) {
    const browser =
        new ChatTBMBrowser(options);

    browser.mount();

    return browser;
}

export {
    ChatTBMBrowser,
    mountChatTBM
};
