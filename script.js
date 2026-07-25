// =============================
// ChatTBM V3.7 Demo AI Engine
// Part 1 - Core Setup
// =============================

// Core Elements
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatBox = document.getElementById("chat-box");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");

// =============================
// AI State
// =============================

let activeTool = null;
let toolStep = 0;
let toolData = {};

// =============================
// Conversation Memory
// =============================

let chatMemory = {
    topic: "",
    contentType: "",
    style: "",
    audience: "",
    platform: ""
};

// Load Memory

const savedMemory = localStorage.getItem("ChatTBM_Memory");

if (savedMemory) {
    chatMemory = JSON.parse(savedMemory);
}

// Save Memory

function saveMemory() {

    localStorage.setItem(
        "ChatTBM_Memory",
        JSON.stringify(chatMemory)
    );

}

// =============================
// Message Functions
// =============================

function addUserMessage(message){

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

function addBotMessage(message){

    chatBox.classList.remove("hidden");

    chatBox.innerHTML += `
    <div class="flex justify-start mb-3">
        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
            🤖 <strong>ChatTBM</strong><br><br>
            ${message.replace(/\n/g,"<br>")}
        </div>
    </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

}

// =============================
// Upload Button
// =============================

if(uploadBtn && fileInput){

    uploadBtn.addEventListener("click",()=>{

        fileInput.click();

    });

    fileInput.addEventListener("change",()=>{

        if(fileInput.files.length>0){

            const file=fileInput.files[0];

            addBotMessage(
`📎 File Selected

${file.name}

I can help you create captions, scripts, summaries and content from this file.`
            );

        }

    });

}

// =============================
// Memory Detection
// =============================

function rememberConversation(text){

    const lower=text.toLowerCase();

    if(
        lower.includes("video about") ||
        lower.includes("create a video about") ||
        lower.includes("topic")
    ){

        chatMemory.topic=text;

    }

    if(lower.includes("youtube")){

        chatMemory.platform="YouTube";

    }

    if(
        lower.includes("tiktok") ||
        lower.includes("reel") ||
        lower.includes("instagram")
    ){

        chatMemory.platform="TikTok / Reels";

    }

    if(lower.includes("business")){

        chatMemory.audience="Business";

    }

    if(lower.includes("funny")){

        chatMemory.style="Funny";

    }

    if(lower.includes("cinematic")){

        chatMemory.style="Cinematic";

    }

    saveMemory();

}

// =============================
// Creator Tools
// =============================

function creatorTool(tool){

    switch(tool){

        case "captionTemplates":
            input.value="Create a viral caption";
            break;

        case "hashtags":
            input.value="Generate hashtags";
            break;

        case "hooks":
            input.value="Create viral hooks";
            break;

        case "cta":
            input.value="Create a strong call to action";
            break;

        case "bio":
            input.value="Create a professional creator bio";
            break;

        case "username":
            input.value="Generate username ideas";
            break;

        case "ideas":
            input.value="Generate viral content ideas";
            break;

        case "calendar":
            input.value="Create a content calendar";
            break;

        default:
            input.value="Help me create content";

    }

    sendMessage();

}

// =============================
// AI Video Studio
// =============================

function videoTool(tool){

    activeTool = tool;

    switch(tool){

        case "create":

            addBotMessage(
`🎥 AI Video Studio

Tell me your topic.

I will automatically generate:

🎬 Complete Video Script
🎙️ Voice-over
🎥 Scene Breakdown
🖼️ AI Image Prompts
✍️ Caption
#️⃣ Hashtags
📌 Title`
            );

        break;


        case "script":

            addBotMessage(
`🎬 Video Script Generator

Tell me your topic.

Example:

Create a video about restaurants.`
            );

        break;


        case "image":

            addBotMessage(
`🖼️ AI Image Prompt Generator

Describe your scene.

Example:

A luxury restaurant at night.`
            );

        break;


        case "scene":

            addBotMessage(
`🎥 Story Scene Generator

Tell me your story or topic.

I will divide it into cinematic scenes.`
            );

        break;


        case "voice":

            addBotMessage(
`🎙️ Voice-over Writer

Tell me your topic.

I'll create a professional narration.`
            );

        break;


        case "youtube":

            addBotMessage(
`📺 YouTube Creator Mode

I will generate:

• SEO Title
• Hook
• Script
• Description
• CTA`
            );

        break;


        case "reels":

            addBotMessage(
`🎵 TikTok / Reels Mode

I will generate:

• Viral Hook
• Short Script
• Caption
• Hashtags`
            );

        break;

    }

}

// =============================
// AI Content Generator
// =============================

function createCompleteContent(topic){

rememberConversation(topic);

return `

📌 TITLE

The Ultimate Guide to ${topic}

━━━━━━━━━━━━━━

🎬 VIDEO SCRIPT

🔥 Hook

"Stop scrolling! Here's everything you need to know about ${topic}."

Story

Today we're exploring ${topic}.

We'll cover the biggest ideas, practical tips and an engaging example.

CTA

Follow ChatTBM for more creator tools.

━━━━━━━━━━━━━━

🎙️ VOICE-OVER

Welcome!

Today we're talking about ${topic}.

Stay with me until the end because you won't want to miss the final tip.

━━━━━━━━━━━━━━

🎥 SCENES

Scene 1
Opening cinematic shot.

Scene 2
Introduce the problem.

Scene 3
Present the solution.

Scene 4
Show the result.

Scene 5
Strong ending with CTA.

━━━━━━━━━━━━━━

🖼️ AI IMAGE PROMPT

Ultra realistic.

Subject:
${topic}

Lighting:
Cinematic lighting.

Camera:
35mm lens.

Style:
Photorealistic.

Quality:
8K Ultra HD.

━━━━━━━━━━━━━━

✍️ CAPTION

Everything starts with one great idea.

Today we're exploring ${topic}.

Save this post for later.

━━━━━━━━━━━━━━

#️⃣ HASHTAGS

#ChatTBM
#AI
#ContentCreator
#ViralContent
#DigitalCreator
#Marketing
#${topic.replace(/\s+/g,"")}

`;

}

// =============================
// ChatTBM V3.7 AI Brain
// =============================

function generateAIReply(message){

    const text = message.toLowerCase();

    // Remember the conversation
    rememberConversation(message);

    // Continue using previous topic
    if(
        (text.includes("make it funny") ||
         text.includes("make it cinematic") ||
         text.includes("make it shorter") ||
         text.includes("continue") ||
         text.includes("improve it")) &&
         chatMemory.topic !== ""
    ){

        return createCompleteContent(chatMemory.topic);

    }

    // Complete AI Content Generator
    if(
        text.includes("video about") ||
        text.includes("create a video") ||
        text.includes("make a video") ||
        text.includes("video script") ||
        text.includes("youtube") ||
        text.includes("reel") ||
        text.includes("tiktok")
    ){

        return createCompleteContent(message);

    }

    // Caption Generator
    if(text.includes("caption")){

        return `

✍️ VIRAL CAPTION

Success starts with one small step.

Stay consistent.

Stay creative.

Save this post and follow ChatTBM for more.

`;

    }

    // Hashtag Generator
    if(text.includes("hashtag")){

        return `

#️⃣ HASHTAGS

#ChatTBM
#AI
#ContentCreator
#CreatorEconomy
#Marketing
#ViralContent
#Business

`;

    }

    // Hook Generator
    if(text.includes("hook")){

        return `

🎯 VIRAL HOOKS

• Stop scrolling...

• You need to see this.

• Nobody talks about this.

• This changed everything.

• Here's the secret...

`;

    }

    // Title Generator
    if(text.includes("title")){

        return `

📌 TITLE IDEAS

1. The Secret Behind Viral Content

2. Create Better Videos With AI

3. The Content Strategy Nobody Uses

`;

    }

    // Content Calendar
    if(text.includes("calendar")){

        return `

📅 CONTENT CALENDAR

Monday
Educational

Tuesday
Behind the Scenes

Wednesday
Tips

Thursday
Story

Friday
Product

Saturday
Community

Sunday
Motivation

`;

    }

    // Greeting
    if(text.includes("hello") || text.includes("hi")){

        return `

👋 Welcome to ChatTBM V3.7

I can automatically generate:

🎬 Complete Video Scripts

🎙️ Voice-over

🎥 Scene Breakdown

🖼️ AI Image Prompts

✍️ Captions

#️⃣ Hashtags

📌 Titles

📅 Content Calendars

Just tell me what you want to create.

`;

    }

    // Default
    return `

🤖 ChatTBM Demo AI

Tell me a topic like:

Create a video about a restaurant

Create a YouTube video about football

Create a TikTok about fitness

I'll generate everything automatically.

`;

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
            🤖 <strong>ChatTBM</strong><br><br>
            Thinking...
        </div>
    </div>
    `;

    chatBox.appendChild(thinking);

    chatBox.scrollTop=chatBox.scrollHeight;

    setTimeout(()=>{

        thinking.innerHTML=`
        <div class="flex justify-start mb-3">
            <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                🤖 <strong>ChatTBM</strong><br><br>
                ${generateAIReply(text).replace(/\n/g,"<br>")}
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
// Voice Recognition
// =============================

if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){

    const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang="en-US";
    recognition.interimResults=false;

    voiceBtn.addEventListener("click",()=>{

        recognition.start();

        voiceBtn.textContent="🎙️";

    });

    recognition.onresult=(event)=>{

        input.value=event.results[0][0].transcript;

        voiceBtn.textContent="🎤";

    };

    recognition.onend=()=>{

        voiceBtn.textContent="🎤";

    };

}

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

    const saved=
    localStorage.getItem("ChatTBM_Chat");

    if(saved){

        chatBox.innerHTML=saved;

        chatBox.classList.remove("hidden");

        chatBox.scrollTop=chatBox.scrollHeight;

    }

}

loadChat();

// =============================
// New Chat
// =============================

function newChat(){

    chatBox.innerHTML="";

    chatBox.classList.add("hidden");

    localStorage.removeItem("ChatTBM_Chat");

    chatMemory={
        topic:"",
        contentType:"",
        style:"",
        audience:"",
        platform:""
    };

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

    const replies=
    chatBox.querySelectorAll(".bg-gray-800");

    if(replies.length===0){

        alert("No ChatTBM reply found.");

        return;

    }

    navigator.clipboard.writeText(
        replies[replies.length-1].innerText
    );

    alert("Copied!");

}

// =============================
// ChatTBM V3.7 Ready
// =============================

console.log("🚀 ChatTBM V3.7 Demo AI Loaded");
