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

        thinking.innerHTML = `
            <div class="flex justify-start mb-3">
                <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                    🤖 <strong>ChatTBM</strong><br><br>
                    Hello! 👋

                    I'm ChatTBM.

                    My AI brain is not connected yet because we're still waiting for the API.

                    Right now I'm running in Demo Mode.

                    Once the API is connected I'll be able to generate:

                    • Viral captions
                    • Video scripts
                    • Business ideas
                    • Social media posts
                    • Marketing content
                    • Much more...
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
