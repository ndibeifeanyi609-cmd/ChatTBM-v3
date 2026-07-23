// =================================
// ChatTBM V3.0 Simple AI Interface
// =================================

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");


// Demo AI Replies

const demoReplies = [
    "I can help you create viral captions, scripts, and content ideas.",
    "Tell me your topic and I will help you create something engaging.",
    "I can help with Instagram, Facebook, TikTok, and YouTube content.",
    "Let's create something viral. What idea do you have?"
];



// Add Message

function addMessage(text, sender) {

    const message = document.createElement("div");

    message.className = sender === "user"
        ? "user-message"
        : "bot-message";


    message.textContent = text;


    chatBox.appendChild(message);


    chatBox.scrollTop = chatBox.scrollHeight;

}



// AI Reply

function botReply() {

    const reply =
    demoReplies[Math.floor(Math.random() * demoReplies.length)];


    setTimeout(() => {

        addMessage(reply, "bot");

    }, 800);

}



// Send Message

function sendMessage() {


    const text = userInput.value.trim();


    if (text === "") return;



    // Remove welcome screen

    const welcome = document.querySelector(".welcome");

    if (welcome) {

        welcome.style.display = "none";

    }



    addMessage(text, "user");


    userInput.value = "";


    botReply();

}



// Button Click

sendBtn.addEventListener("click", sendMessage);



// Enter Key

userInput.addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        sendMessage();

    }

});
