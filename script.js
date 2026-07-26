// =====================================
// ChatTBM V4.0
// AI Creator Assistant Engine
// Part 1 - Core Setup
// =====================================


// =============================
// Core Elements
// =============================

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");

const chatBox = document.getElementById("chat-box");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");


// =============================
// ChatTBM V4.0 State
// =============================

let creatorMode = "Default";

let activeAssistant = false;

let assistantStep = 0;


// Creator Data

let creatorData = {

    topic: "",
    audience: "",
    platform: "",
    style: ""

};


// =============================
// Conversation Memory
// =============================

let chatMemory = {

    topic: "",
    lastRequest: "",
    style: "",
    platform: "",
    audience: ""

};


// Load Memory

const savedMemory =
localStorage.getItem("ChatTBM_V4_Memory");


if(savedMemory){

    chatMemory = JSON.parse(savedMemory);

}


// Save Memory

function saveMemory(){

    localStorage.setItem(
        "ChatTBM_V4_Memory",
        JSON.stringify(chatMemory)
    );

}



// =============================
// Creator Mode
// =============================

const savedMode =
localStorage.getItem("ChatTBM_V4_Mode");


if(savedMode){

    creatorMode = savedMode;

}


// Change Creator Mode

function changeCreatorMode(mode){

    creatorMode = mode;


    localStorage.setItem(
        "ChatTBM_V4_Mode",
        creatorMode
    );


    addBotMessage(

`✅ Creator Mode Changed

🎨 Mode:
${creatorMode}`

    );

}



// =============================
// Chat Settings
// =============================

let chatSettings = {

    autoSave:true,
    voice:true,
    memory:true

};



// =============================
// Utility Functions
// =============================

function cleanText(text){

    return text
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");

}



function showChat(){

    if(chatBox){

        chatBox.classList.remove("hidden");

    }

}



function scrollChat(){

    if(chatBox){

        chatBox.scrollTop =
        chatBox.scrollHeight;

    }

}



// =============================
// Memory Detection
// =============================

function updateMemory(text){

    const message =
    text.toLowerCase();


    chatMemory.lastRequest = text;



    if(
        message.includes("video about") ||
        message.includes("create a video") ||
        message.includes("make a video")
    ){

        chatMemory.topic = text;

    }



    if(
        message.includes("youtube")
    ){

        chatMemory.platform="YouTube";

    }



    if(
        message.includes("tiktok") ||
        message.includes("reel") ||
        message.includes("instagram")
    ){

        chatMemory.platform="TikTok/Reels";

    }



    if(
        message.includes("business")
    ){

        chatMemory.audience="Business";

    }



    if(
        message.includes("funny")
    ){

        chatMemory.style="Funny";

    }



    if(
        message.includes("cinematic")
    ){

        chatMemory.style="Cinematic";

    }



    saveMemory();

}



// =============================
// ChatTBM V4.0 Start
// =============================

console.log(
"🚀 ChatTBM V4.0 Core Loaded"
);
