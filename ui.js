// =====================================
// ChatTBM V7
// UI Engine
// =====================================

class UIEngine {

    constructor() {

        this.chatBox =
        document.getElementById("chatBox");

    }

    // ==========================
    // USER MESSAGE
    // ==========================

    addUserMessage(message) {

        this.addMessage(
            message,
            "user"
        );

    }

    // ==========================
    // AI MESSAGE
    // ==========================

    addBotMessage(message) {

        this.addMessage(
            message,
            "bot"
        );

    }

    // ==========================
    // CREATE MESSAGE
    // ==========================

    addMessage(text, role) {

        if (!this.chatBox) return;

        const bubble =
        document.createElement("div");

        bubble.className =
        `message ${role}`;

        bubble.innerHTML = text;

        this.chatBox.appendChild(bubble);

        this.scrollToBottom();

    }

    // ==========================
    // LOADING
    // ==========================

    showTyping() {

        const typing =
        document.createElement("div");

        typing.id = "typingIndicator";

        typing.className =
        "message bot typing";

        typing.innerHTML =
        "ChatTBM is thinking...";

        this.chatBox.appendChild(
            typing
        );

        this.scrollToBottom();

    }

    hideTyping() {

        const typing =
        document.getElementById(
            "typingIndicator"
        );

        if (typing) {

            typing.remove();

        }

    }

    // ==========================
    // AUTO SCROLL
    // ==========================

    scrollToBottom() {

        this.chatBox.scrollTop =
        this.chatBox.scrollHeight;

    }

}

window.ChatTBMUI =
new UIEngine();
