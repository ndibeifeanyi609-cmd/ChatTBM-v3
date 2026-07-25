// =============================
// ChatTBM V3.6 Demo AI Engine
// Part 1 - Core Setup & Memory
// =============================

// Core Elements
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatBox = document.getElementById("chat-box");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");

// =============================
// AI Tool State
// =============================

let activeTool = null;
let toolStep = 0;
let toolData = {};

// =============================
// ChatTBM Conversation Memory
// =============================

let chatMemory = {
    topic: "",
    style: "",
    creatorMode: "",
    platform: "",
    lastReply: ""
};

// =============================
// Load Memory
// =============================

const savedMemory = localStorage.getItem("ChatTBM_Memory");

if (savedMemory) {

    chatMemory = JSON.parse(savedMemory);

}

// =============================
// Save Memory
// =============================

function saveMemory() {

    localStorage.setItem(
        "ChatTBM_Memory",
        JSON.stringify(chatMemory)
    );

}

// =============================
// Memory Helpers
// =============================

function rememberTopic(topic) {

    chatMemory.topic = topic;
    saveMemory();

}

function rememberStyle(style) {

    chatMemory.style = style;
    saveMemory();

}

function rememberCreatorMode(mode) {

    chatMemory.creatorMode = mode;
    saveMemory();

}

function rememberPlatform(platform) {

    chatMemory.platform = platform;
    saveMemory();

}

function rememberReply(reply) {

    chatMemory.lastReply = reply;
    saveMemory();

}

// =============================
// Chat Message Components
// =============================

function addBotMessage(message) {

    chatBox.classList.remove("hidden");

    chatBox.innerHTML += `
    <div class="flex justify-start mb-3">

        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            🤖 <strong>ChatTBM</strong>

            <br><br>

            ${message.replace(/\n/g,"<br>")}

        </div>

    </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

}

function addUserMessage(message) {

    chatBox.classList.remove("hidden");

    chatBox.innerHTML += `
    <div class="flex justify-end mb-3">

        <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            ${message}

        </div>

    </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

}

console.log("✅ ChatTBM V3.6 Part 1 Loaded");

// =============================
// File Upload
// =============================

if (uploadBtn && fileInput) {

    uploadBtn.addEventListener("click", () => {

        fileInput.click();

    });

    fileInput.addEventListener("change", () => {

        if (fileInput.files.length > 0) {

            const file = fileInput.files[0];

            addBotMessage(`📎 File Selected

${file.name}

I can help you create captions, scripts, summaries and content from this file.`);

        }

    });

}

// =============================
// Creator Tools
// =============================

function creatorTool(tool) {

    let request = "";

    switch (tool) {

        case "captionTemplates":
            request = "Create viral captions";
            break;

        case "hashtags":
            request = "Generate hashtags";
            break;

        case "hooks":
            request = "Create viral hooks";
            break;

        case "cta":
            request = "Create call to action";
            break;

        case "bio":
            request = "Create creator bio";
            break;

        case "username":
            request = "Generate username ideas";
            break;

        case "ideas":
            request = "Generate viral content ideas";
            break;

        case "calendar":
            request = "Create content calendar";
            break;

        default:
            request = "Creator tool";

    }

    input.value = request;
    sendMessage();

}

// =============================
// AI Video Studio
// =============================

function videoTool(tool) {

    let message = "";

    switch (tool) {

        case "create":

            rememberCreatorMode("Video Creator");

            message = `🎥 AI Video Creator

I can build:

✅ Hook
✅ Story
✅ Scene Breakdown
✅ Voice-over
✅ Caption
✅ CTA

What is your video about?`;

            break;

        case "script":

            rememberCreatorMode("Script Writer");

            message = `🎬 Video Script Generator

Tell me your topic.

I'll create a complete script with:

• Hook
• Story
• Ending
• CTA`;

            break;

        case "image":

            rememberCreatorMode("Image Prompt");

            message = `🖼️ AI Image Prompt Generator

Describe what you want.

I'll include:

• Character
• Camera
• Lighting
• Style
• Mood`;

            break;

        case "scene":

            rememberCreatorMode("Scene Builder");

            message = `🎞️ Story to Scene Builder

Send your story.

I'll break it into cinematic scenes.`;

            break;

        case "voice":

            rememberCreatorMode("Voice Writer");

            message = `🎙️ Voice-over Writer

Tell me your topic.

I'll create a natural voice-over script.`;

            break;

        case "youtube":

            rememberPlatform("YouTube");

            message = `📺 YouTube Creator Mode Activated

Your scripts will now be optimized for YouTube videos.`;

            break;

        case "reels":

            rememberPlatform("TikTok / Reels");

            message = `🎵 TikTok & Reels Mode Activated

Your scripts will now focus on short-form viral content.`;

            break;

        default:

            message = "How can I help with your video project?";

    }

    addBotMessage(message);

}

// =============================
// Voice Recognition
// =============================

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

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

console.log("✅ ChatTBM V3.6 Part 2 Loaded");

// =============================
// ChatTBM V3.6 Demo AI Brain
// =============================

function generateAIReply(message){

let text = message.toLowerCase();

// -----------------------------
// Conversation Memory
// -----------------------------

if(
text.includes("restaurant") ||
text.includes("food") ||
text.includes("business") ||
text.includes("fashion") ||
text.includes("football") ||
text.includes("car") ||
text.includes("movie") ||
text.includes("travel")
){

rememberTopic(message);

}

if(text.includes("funny")){

rememberStyle("Funny");

}

if(text.includes("cinematic")){

rememberStyle("Cinematic");

}

if(text.includes("motivational")){

rememberStyle("Motivational");

}

if(text.includes("youtube")){

rememberPlatform("YouTube");

}

if(
text.includes("reel") ||
text.includes("tiktok")
){

rememberPlatform("TikTok / Reels");

}

// -----------------------------
// Continue Previous Conversation
// -----------------------------

if(

(text.includes("continue") ||
text.includes("make it") ||
text.includes("rewrite") ||
text.includes("improve")) &&

chatMemory.topic !== ""

){

return `🧠 Conversation Memory

Topic:
${chatMemory.topic}

Style:
${chatMemory.style || "Normal"}

Platform:
${chatMemory.platform || "General"}

I still remember your project.

Tell me what you would like me to improve next.`;

}

// -----------------------------
// Greetings
// -----------------------------

if(
text.includes("hello") ||
text.includes("hi")
){

return `👋 Welcome to ChatTBM!

I am your AI Content Assistant.

I can help you create:

🎥 Video Scripts
🖼️ AI Image Prompts
🎬 Story Scenes
🎙️ Voice-over Scripts
✍️ Captions
#️⃣ Hashtags
📌 Titles
📅 Content Calendars

What would you like to create today?`;

}

// -----------------------------
// Complete Video Script
// -----------------------------

if(

text.includes("video") ||
text.includes("script") ||
text.includes("create ai video")

){

return `🎥 COMPLETE VIDEO SCRIPT

🔥 Hook

Stop scrolling...
This changes everything.

📖 Story

Introduce the topic clearly.
Explain the problem.
Show the solution.

🎬 Scene 1

Introduce the location.

🎬 Scene 2

Show the main action.

🎬 Scene 3

Reveal the result.

📢 CTA

Follow ChatTBM for more creator ideas.`;

}

// -----------------------------
// AI Image Prompt Generator
// -----------------------------

if(
text.includes("image") ||
text.includes("prompt")
){

return `🖼️ AI IMAGE PROMPT

Subject:
${chatMemory.topic || "Your chosen subject"}

Camera:
35mm cinematic lens

Lighting:
Golden hour, soft dramatic lighting

Style:
Ultra realistic, highly detailed, 8K

Composition:
Professional framing with shallow depth of field.

Mood:
${chatMemory.style || "Cinematic"}
`;

}

// -----------------------------
// Story Scene Breakdown
// -----------------------------

if(
text.includes("scene") ||
text.includes("story")
){

return `🎬 STORY SCENES

Scene 1
Introduce the location and characters.

Scene 2
Present the main challenge.

Scene 3
Build suspense.

Scene 4
Reveal the solution.

Scene 5
Finish with a memorable ending and CTA.
`;

}

// -----------------------------
// Voice-over Writer
// -----------------------------

if(
text.includes("voice") ||
text.includes("voice-over")
){

return `🎙️ VOICE-OVER SCRIPT

Intro:
Today I'll show you something amazing.

Middle:
Let's break everything down step by step.

Ending:
Follow ChatTBM for more AI creator tools.
`;

}

// -----------------------------
// Caption Generator
// -----------------------------

if(text.includes("caption")){

return `✍️ VIRAL CAPTIONS

1. Small ideas become big success with consistency. 🚀

2. Your next viral post starts here.

3. Create. Improve. Repeat.
`;

}

// -----------------------------
// Hashtag Generator
// -----------------------------

if(text.includes("hashtag")){

return `#️⃣ HASHTAGS

#ChatTBM
#ContentCreator
#AI
#SocialMedia
#Marketing
#Entrepreneur
#ViralContent
`;

}

// -----------------------------
// Title Generator
// -----------------------------

if(text.includes("title")){

return `📌 TITLE IDEAS

1. The Secret Behind Viral Content

2. Create Better Content With AI

3. The Creator's Ultimate Guide
`;

}

// -----------------------------
// Content Calendar
// -----------------------------

if(text.includes("calendar")){

return `📅 WEEKLY CONTENT CALENDAR

Monday — Educational

Tuesday — Behind the Scenes

Wednesday — Tips

Thursday — Storytelling

Friday — Product Showcase

Saturday — Trending Topic

Sunday — Motivation
`;

}

// -----------------------------
// Default Response
// -----------------------------

return `🤖 ChatTBM Demo AI

I can help you create:

🎥 Video scripts
🖼️ AI image prompts
🎬 Story scenes
🎙️ Voice-over scripts
✍️ Captions
#️⃣ Hashtags
📌 Titles
📅 Content calendars

Just tell me what you'd like to create.`;

}

// =============================
// Send Message
// =============================

function sendMessage(){

    const text = input.value.trim();

    if(text==="") return;

    addUserMessage(text);

    input.value="";

    const thinking=document.createElement("div");

    thinking.innerHTML=`
    <div class="flex justify-start mb-3">
        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
            🤖 <strong>ChatTBM</strong>
            <br><br>
            Thinking...
        </div>
    </div>
    `;

    chatBox.appendChild(thinking);

    chatBox.scrollTop=chatBox.scrollHeight;

    setTimeout(()=>{

        const reply=generateAIReply(text);

        rememberReply(reply);

        thinking.innerHTML=`
        <div class="flex justify-start mb-3">
            <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                🤖 <strong>ChatTBM</strong>
                <br><br>
                ${reply.replace(/\n/g,"<br>")}
            </div>
        </div>
        `;

        saveChat();

        chatBox.scrollTop=chatBox.scrollHeight;

    },1000);

}

// =============================
// Button Events
// =============================

if(sendBtn){

    sendBtn.addEventListener("click",sendMessage);

}

if(input){

    input.addEventListener("keypress",(e)=>{

        if(e.key==="Enter"){

            sendMessage();

        }

    });

}

// =============================
// Quick Action Buttons
// =============================

document.getElementById("caption-btn")?.addEventListener("click",()=>{

    input.value="Create a viral caption";

    sendMessage();

});

document.getElementById("video-btn")?.addEventListener("click",()=>{

    input.value="Create AI video script";

    sendMessage();

});

document.getElementById("post-btn")?.addEventListener("click",()=>{

    input.value="Write social media post";

    sendMessage();

});

// =============================
// Auto Save Chat
// =============================

function saveChat(){

    localStorage.setItem(
        "ChatTBM_Chat",
        chatBox.innerHTML
    );

}

function loadChat(){

    const saved=localStorage.getItem("ChatTBM_Chat");

    if(saved){

        chatBox.innerHTML=saved;

        chatBox.classList.remove("hidden");

        chatBox.scrollTop=chatBox.scrollHeight;

    }

}

const observer=new MutationObserver(()=>{

    saveChat();

});

observer.observe(chatBox,{

    childList:true,
    subtree:true

});

loadChat();

// =============================
// New Chat
// =============================

function newChat(){

    chatBox.innerHTML="";

    chatBox.classList.add("hidden");

    localStorage.removeItem("ChatTBM_Chat");

    chatMemory.topic="";
    chatMemory.style="";
    chatMemory.platform="";
    chatMemory.creatorMode="";
    chatMemory.lastReply="";

    saveMemory();

}

// =============================
// Clear Chat
// =============================

function clearChat(){

    if(confirm("Clear this conversation?")){

        newChat();

    }

}

// =============================
// Copy Latest Reply
// =============================

function copyLastReply(){

    if(!chatMemory.lastReply){

        alert("No ChatTBM reply to copy.");

        return;

    }

    navigator.clipboard.writeText(chatMemory.lastReply);

    alert("Copied!");

}

// =============================
// App Ready
// =============================

document.addEventListener("DOMContentLoaded",()=>{

    console.log("🚀 ChatTBM V3.6 Loaded");

});
