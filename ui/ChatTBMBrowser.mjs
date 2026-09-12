'use strict';

import { ChatTBMApp } from './ChatTBMApp.mjs';

class ChatTBMBrowser {
    constructor(options = {}) {
        this.root = options.root || document.body;
        this.app = options.app || new ChatTBMApp({
            userId: options.userId
        });
    }

    render() {
        const model = this.app.render();
        this.root.innerHTML = '';

        const app = document.createElement('div');
        app.className = 'ui-app';

        const shell = document.createElement('div');
        shell.className = 'ui-app-shell';

        shell.appendChild(this.renderSidebar(model.sidebar));

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

        const title = document.createElement('h1');
        title.className = 'ui-welcome-title';
        title.textContent = model.title;

        const subtitle = document.createElement('p');
        subtitle.className = 'ui-welcome-subtitle';
        subtitle.textContent = model.subtitle;

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
        textarea.placeholder = 'Ask ChatTBM anything…';
        textarea.rows = 1;
        textarea.dataset.role = 'composer';
        textarea.setAttribute(
            'aria-label',
            'Message ChatTBM'
        );

        const button = document.createElement('button');
        button.type = 'submit';
        button.className = 'ui-send-button';
        button.textContent = '↑';
        button.setAttribute(
            'aria-label',
            'Send message'
        );
        button.disabled = !model.submitAvailable;

        form.appendChild(textarea);
        form.appendChild(button);
        wrapper.appendChild(form);

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
