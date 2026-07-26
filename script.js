/* ==========================================
   ChatTBM V5.1
   script.js
   Part 1 - Core System
========================================== */

// ===========================
// DOM ELEMENTS
// ===========================

const chatBox = document.getElementById("chat-box");
const welcomeScreen = document.getElementById("welcome-screen");

const userInput = document.getElementById("user-input");

const sendBtn = document.getElementById("send-btn");
const uploadBtn = document.getElementById("upload-btn");
const voiceBtn = document.getElementById("voice-btn");

const fileInput = document.getElementById("file-input");
const attachmentPreview = document.getElementById("attachment-preview");

const loadingIndicator =
document.getElementById("loading-indicator");

const toast =
document.getElementById("toast");

// ===========================
// APP STATE
// ===========================

let uploadedFile = null;

let chatHistory = [];

const STORAGE_KEY = "ChatTBM_V51_History";

// ===========================
// SHOW CHAT
// ===========================

function showChat(){

    if(welcomeScreen){

        welcomeScreen.style.display = "none";

    }

}

// ===========================
// AUTO SCROLL
// ===========================

function scrollChat(){

    chatBox.scrollTop = chatBox.scrollHeight;

}

// ===========================
// ADD MESSAGE
// ===========================

function addMessage(type,text){

    showChat();

    const message =
    document.createElement("div");

    message.className =
    `message ${type}`;

    message.textContent = text;

    chatBox.appendChild(message);

    scrollChat();

    chatHistory.push({

        type:type,

        text:text

    });

    saveHistory();

}

// ===========================
// SEND MESSAGE
// ===========================

function sendMessage(){

    const message =
    userInput.value.trim();

    if(message === "" && !uploadedFile){

        return;

    }

    let finalMessage = message;

    if(uploadedFile){

        finalMessage +=
        `\n📎 ${uploadedFile.name}`;

    }

    addMessage("user",finalMessage);

    userInput.value = "";

    clearAttachment();

    generateReply(message);

}

// ===========================
// EVENTS
// ===========================

sendBtn.addEventListener(
"click",
sendMessage
);

userInput.addEventListener(
"keydown",
function(event){

    if(event.key === "Enter"
    && !event.shiftKey){

        event.preventDefault();

        sendMessage();

    }

});

// ===========================
// STARTUP
// ===========================

console.log(
"✅ ChatTBM V5.1 Started"
);

/* ==========================================
   ChatTBM V5.1
   script.js
   Part 2 - AI Engine & Chat History
========================================== */

// ===========================
// AI RESPONSE DATABASE
// ===========================

const aiReplies = {

    greeting: [
        "Hello! 👋 Welcome to ChatTBM.",
        "Hi! What would you like to create today?",
        "Welcome back! Let's make something amazing."
    ],

    caption: [
        "I can write engaging captions for your social media posts.",
        "Tell me about your photo or video and I'll create a caption."
    ],

    script: [
        "I can help write YouTube, TikTok, Facebook, and Instagram scripts.",
        "Give me your topic and I'll build a script."
    ],

    ideas: [
        "Here are some fresh content ideas you can try today.",
        "Let's brainstorm viral content together."
    ],

    default: [
        "Tell me more so I can help.",
        "That's interesting. Let's build something great.",
        "I'm ready to help with your content."
    ]

};

// ===========================
// FIND REPLY
// ===========================

function getReply(message){

    const text = message.toLowerCase();

    if(text.includes("hello") ||
       text.includes("hi") ||
       text.includes("hey")){

        return randomReply("greeting");
    }

    if(text.includes("caption")){

        return randomReply("caption");
    }

    if(text.includes("script") ||
       text.includes("video")){

        return randomReply("script");
    }

    if(text.includes("idea") ||
       text.includes("viral")){

        return randomReply("ideas");
    }

    return randomReply("default");

}

// ===========================
// RANDOM REPLY
// ===========================

function randomReply(category){

    const list = aiReplies[category];

    return list[
        Math.floor(Math.random() * list.length)
    ];

}

// ===========================
// GENERATE AI RESPONSE
// ===========================

function generateReply(message){

    showLoading();

    setTimeout(()=>{

        hideLoading();

        addMessage(
            "bot",
            getReply(message)
        );

    },700);

}

// ===========================
// CHAT HISTORY
// ===========================

function saveHistory(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chatHistory)
    );

}

function loadHistory(){

    const saved =
    localStorage.getItem(STORAGE_KEY);

    if(!saved){

        showWelcomeMessage();

        return;

    }

    chatHistory =
    JSON.parse(saved);

    chatHistory.forEach(item=>{

        const message =
        document.createElement("div");

        message.className =
        `message ${item.type}`;

        message.textContent =
        item.text;

        chatBox.appendChild(message);

    });

    scrollChat();

}

// ===========================
// WELCOME MESSAGE
// ===========================

function showWelcomeMessage(){

    addMessage(
        "bot",
        "👋 Welcome to ChatTBM. Your AI Content Assistant is ready."
    );

}

/* ==========================================
   ChatTBM V5.1
   script.js
   Part 3 - Upload, Quick Actions & Toast
========================================== */

// ===========================
// FILE UPLOAD
// ===========================

if(uploadBtn){

    uploadBtn.addEventListener("click",()=>{

        fileInput.click();

    });

}

if(fileInput){

    fileInput.addEventListener("change",(event)=>{

        const file = event.target.files[0];

        if(!file){

            return;

        }

        uploadedFile = file;

        showAttachment(file);

    });

}

// ===========================
// SHOW ATTACHMENT
// ===========================

function showAttachment(file){

    attachmentPreview.innerHTML = "";

    const preview =
    document.createElement("div");

    preview.className = "file-preview";

    if(file.type.startsWith("image/")){

        const image =
        document.createElement("img");

        image.src =
        URL.createObjectURL(file);

        image.className =
        "upload-image-preview";

        preview.appendChild(image);

    }

    const fileName =
    document.createElement("span");

    fileName.textContent =
    file.name;

    preview.appendChild(fileName);

    attachmentPreview.appendChild(preview);

}

// ===========================
// CLEAR ATTACHMENT
// ===========================

function clearAttachment(){

    uploadedFile = null;

    fileInput.value = "";

    attachmentPreview.innerHTML = "";

}

// ===========================
// QUICK ACTION BUTTONS
// ===========================

const quickButtons =
document.querySelectorAll(".quick-btn");

quickButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const prompt =
        button.dataset.prompt;

        userInput.value = prompt;

        userInput.focus();

    });

});

// ===========================
// TOAST MESSAGE
// ===========================

function showToast(message){

    if(!toast){

        return;

    }

    toast.textContent = message;

    toast.classList.remove("hidden");

    setTimeout(()=>{

        toast.classList.add("hidden");

    },2000);

}

// ===========================
// COPY LAST BOT MESSAGE
// ===========================

function copyLastReply(){

    const replies =
    document.querySelectorAll(".message.bot");

    if(replies.length === 0){

        showToast("No reply to copy");

        return;

    }

    const lastReply =
    replies[replies.length - 1];

    navigator.clipboard.writeText(
        lastReply.textContent
    );

    showToast("Copied");

}

/* ==========================================
   ChatTBM V5.1
   script.js
   Part 4 - Voice Input & Loading System
========================================== */

// ===========================
// SPEECH RECOGNITION
// ===========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

let recognition = null;

if(SpeechRecognition){

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onresult = function(event){

        const speech =
        event.results[0][0].transcript;

        userInput.value = speech;

        userInput.focus();

        showToast("Voice captured");

    };

    recognition.onerror = function(){

        showToast("Voice recognition failed");

    };

    recognition.onend = function(){

        voiceBtn.classList.remove("recording");

    };

}

// ===========================
// VOICE BUTTON
// ===========================

if(voiceBtn){

    voiceBtn.addEventListener("click",()=>{

        if(!recognition){

            showToast(
            "Voice not supported on this browser"
            );

            return;

        }

        voiceBtn.classList.add("recording");

        recognition.start();

    });

}

// ===========================
// LOADING INDICATOR
// ===========================

function showLoading(){

    if(loadingIndicator){

        loadingIndicator.classList.remove("hidden");

    }

}

function hideLoading(){

    if(loadingIndicator){

        loadingIndicator.classList.add("hidden");

    }

}

// ===========================
// SIMULATE BOT TYPING
// ===========================

function botTyping(callback){

    showLoading();

    setTimeout(()=>{

        hideLoading();

        if(typeof callback === "function"){

            callback();

        }

    },700);

}

/* ==========================================
   ChatTBM V5.1
   script.js
   Part 5 - Initialization & Final Setup
========================================== */

// ===========================
// AUTO-RESIZE TEXTAREA
// ===========================

function autoResizeTextarea(){

    if(!userInput) return;

    userInput.style.height = "auto";

    userInput.style.height =
    userInput.scrollHeight + "px";

}

if(userInput){

    userInput.addEventListener(
        "input",
        autoResizeTextarea
    );

}



// ===========================
// CLEAR CHAT
// ===========================

function clearChat(){

    chatHistory = [];

    localStorage.removeItem(
        STORAGE_KEY
    );

    chatBox.innerHTML = "";

    showWelcomeMessage();

}



// ===========================
// NEW CHAT BUTTON
// ===========================

const newChatBtn =
document.getElementById("new-chat-btn");

if(newChatBtn){

    newChatBtn.addEventListener(
        "click",
        clearChat
    );

}



// ===========================
// LOAD APP
// ===========================

function initializeApp(){

    loadHistory();

    autoResizeTextarea();

    console.log(
        "🚀 ChatTBM V5.1 Ready"
    );

}



// ===========================
// DOM READY
// ===========================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
