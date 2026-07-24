constconst userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

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
