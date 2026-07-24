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

sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (text) {
        alert("You said: " + text + "\n\n(We'll connect real AI backend soon!)");
        userInput.value = "";
    }
});

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});
