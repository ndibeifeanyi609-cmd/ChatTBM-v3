constconst userInput = document.getElementById("user-input");
const voiceBtn = document.getElementById("voice-btn");

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {

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

function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;

    const chatBox = document.getElementById("chat-box");

    // Show chat area
    chatBox.classList.remove("hidden");

    // User message
    chatBox.innerHTML += `
        <div class="flex justify-end">
            <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                ${text}
            </div>
        </div>
    `;

    // Clear input
    input.value = "";

    // Thinking bubble
    const thinking = document.createElement("div");

    thinking.innerHTML = `
        <div class="flex justify-start">
            <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                🤖 <strong>ChatTBM</strong><br>
                Thinking...
            </div>
        </div>
    `;

    chatBox.appendChild(thinking);

    chatBox.scrollTop = chatBox.scrollHeight;

    // Fake AI reply
    setTimeout(() => {

        thinking.innerHTML = `
            <div class="flex justify-start">
                <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                    🤖 <strong>ChatTBM</strong><br><br>
                    Thanks for your message! I'm currently running in demo mode. Once my AI API is connected, I'll provide real intelligent responses.
                </div>
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

    }, 1000);

}
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});
