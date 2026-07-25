const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatBox = document.getElementById("chat-box");

// =============================
// Voice Recognition
// =============================
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.textContent = "🎙️";
    });

    recognition.onresult = (event) => {
        input.value = event.results[0][0].transcript;
        voiceBtn.textContent = "🎤";
    };

    recognition.onend = () => {
        voiceBtn.textContent = "🎤";
    };

} else {

    voiceBtn.addEventListener("click", () => {
        alert("Voice input is not supported in this browser.");
    });

}

// =============================
// Send Message
// =============================
function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;

    // Show chat area
    chatBox.classList.remove("hidden");

    // User message
    chatBox.innerHTML += `
        <div class="flex justify-end mb-3">
            <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                ${text}
            </div>
        </div>
    `;

    input.value = "";

    // Thinking bubble
    const thinking = document.createElement("div");

    thinking.innerHTML = `
        <div class="flex justify-start mb-3">
            <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                🤖 <strong>ChatTBM</strong><br><br>
                Thinking...
            </div>
        </div>
    `;

    chatBox.appendChild(thinking);

    chatBox.scrollTop = chatBox.scrollHeight;

    // Fake AI Response
    setTimeout(() => {

    let reply = "";

    const message = text.toLowerCase();

    if (message.includes("hello") || message.includes("hi")) {

        reply = "👋 Hello! Welcome to ChatTBM. How can I help you today?";

    } else if (message.includes("caption")) {

        reply = "✍️ Sample Caption:\n\nDream big. Stay consistent. Success follows action. 🚀";

    } else if (message.includes("script")) {

        reply = "🎬 Sample Script:\n\nHook your audience in the first 3 seconds, tell a compelling story, then end with a clear call to action.";

    } else if (message.includes("business")) {

        reply = "💼 Business Ideas:\n• Social Media Agency\n• AI Content Creation\n• Digital Marketing Services";

} else if (
    message.includes("who are you") ||
    message.includes("what are you") ||
    message.includes("who created you")
) {

        reply = "🤖 I'm ChatTBM, your AI Content Assistant. I help create captions, scripts, marketing content and much more.";

    } else {

        reply = "😊 I'm still in Demo Mode. Once my AI API is connected, I'll provide intelligent answers to your questions.";

    }

    thinking.innerHTML = `
        <div class="flex justify-start mb-3">
            <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                🤖 <strong>ChatTBM</strong><br><br>
                ${reply}
            </div>
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

}, 1000);
}

// =============================
// Events
// =============================
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

// =============================
// Quick Action Buttons
// =============================

document.getElementById("caption-btn").addEventListener("click", () => {
    input.value = "Create a viral caption";
    sendMessage();
});

document.getElementById("video-btn").addEventListener("click", () => {
    input.value = "Generate video ideas";
    sendMessage();
});

document.getElementById("post-btn").addEventListener("click", () => {
    input.value = "Write social media posts";
    sendMessage();
});
