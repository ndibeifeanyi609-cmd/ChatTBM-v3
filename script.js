// ==========================================
// ChatTBM v3
// Part 1
// ==========================================

// Get Elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Demo AI Replies
const demoReplies = [
    "I can help you create captions, scripts, and viral content ideas.",
    "Try asking me to write a Facebook post, Instagram caption, or YouTube script.",
    "Need content ideas? Tell me your niche and I'll generate some.",
    "When your API is connected, I'll provide real AI-powered responses.",
    "ChatTBM is ready to become your AI Content Assistant."
];

// Add Message
function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className =
        sender === "user"
        ? "user-message"
        : "bot-message";

    message.textContent = text;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Demo AI Response
function botReply() {

    const random =
        demoReplies[
            Math.floor(Math.random() * demoReplies.length)
        ];

    setTimeout(() => {

        addMessage(random, "bot");

    }, 700);

}

// Send Message
function sendMessage() {

    const text = userInput.value.trim();

    if (text === "") return;

    addMessage(text, "user");

    userInput.value = "";

    botReply();

}

// Button Click
sendBtn.addEventListener("click", sendMessage);

// Press Enter
userInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        sendMessage();

    }

});
