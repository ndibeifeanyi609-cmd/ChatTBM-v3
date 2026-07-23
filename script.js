// ChatTBM V3.0
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const welcomeScreen = document.getElementById("welcome-screen");
const chatContainer = document.getElementById("chat-container");

const demoReplies = [
    "I can help you create viral captions, scripts, and content ideas.",
    "Tell me your niche or topic and I'll generate something powerful.",
    "Would you like me to write a caption, video idea, or social media post?",
    "I'm ready when you are! What's on your mind?"
];

// Add message
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = sender === "user" ? "user-message" : "bot-message";
    message.textContent = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Bot reply
function botReply() {
    const random = demoReplies[Math.floor(Math.random() * demoReplies.length)];
    setTimeout(() => addMessage(random, "bot"), 800);
}

// Send message
function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // Hide welcome, show chat
    welcomeScreen.style.display = "none";
    chatContainer.style.display = "block";

    addMessage(text, "user");
    userInput.value = "";
    botReply();
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Quick prompt cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        userInput.value = prompt;
        sendMessage();
    });
});

// New Chat
document.querySelector('.new-chat-btn').addEventListener('click', () => {
    if (confirm("Start a new chat?")) {
        location.reload();
    }
});
