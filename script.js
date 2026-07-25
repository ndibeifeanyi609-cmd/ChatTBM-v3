// =============================
// ChatTBM V3.2
// Core Variables
// =============================

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatBox = document.getElementById("chat-box");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");

// =============================
// Tool State
// =============================

let activeTool = null;
let toolStep = 0;
let toolData = {};

// =============================
// Upload Button
// =============================

if (uploadBtn && fileInput) {

    uploadBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {

        if (fileInput.files.length > 0) {

            const file = fileInput.files[0];

            chatBox.classList.remove("hidden");

            chatBox.innerHTML += `
            <div class="flex justify-start mb-3">
                <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                    📎 <strong>File Selected</strong><br><br>
                    ${file.name}
                </div>
            </div>
            `;

            chatBox.scrollTop = chatBox.scrollHeight;
        }

    });

}

// =============================
// Creator Tools
// =============================

function creatorTool(tool){

    let text="";

    switch(tool){

        case "captionTemplates":
            text="Caption Templates";
            break;

        case "hashtags":
            text="Hashtag Generator";
            break;

        case "hooks":
            text="Hook Generator";
            break;

        case "cta":
            text="CTA Generator";
            break;

        case "bio":
            text="Bio Generator";
            break;

        case "username":
            text="Username Ideas";
            break;

        case "ideas":
            text="Viral Content Ideas";
            break;

        case "calendar":
            text="Content Calendar";
            break;

        default:
            text="Creator Tool";

    }

    input.value = text;
    sendMessage();

}

// =============================
// AI Video Studio
// =============================

function videoTool(tool){

    chatBox.classList.remove("hidden");

    let message="";

    switch(tool){

        case "create":
            message="🎥 Let's create your AI video.\n\nQuestion 1 of 5:\n\nWhat is your video about?";
            break;

        case "script":
            message="🎬 What topic do you want the video script to cover?";
            break;

        case "image":
            message="🖼️ Describe the image you want to generate.";
            break;

        case "scene":
            message="🎞️ What story or product should I turn into scenes?";
            break;

        case "voice":
            message="🎙️ What should the voice-over say?";
            break;

        case "youtube":
            message="📺 What is your YouTube video topic?";
            break;

        case "reels":
            message="🎵 What is your Reel or TikTok about?";
            break;

    }

    chatBox.innerHTML += `
    <div class="flex justify-start mb-3">
        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">
            🤖 <strong>ChatTBM</strong><br><br>
            ${message}
        </div>
    </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

}

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

    chatBox.classList.remove("hidden");

    // User Message
    chatBox.innerHTML += `
    <div class="flex justify-end mb-3">
        <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">
            ${text}
        </div>
    </div>
    `;

    input.value = "";

    // Thinking Bubble
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

    setTimeout(() => {

        const message = text.toLowerCase();

        let reply = "";

        if (message.includes("hello") || message.includes("hi")) {

            reply = "👋 Hello! Welcome to ChatTBM. How can I help you today?";

        }

        else if (message.includes("caption templates")) {

            reply = `✍️ Caption Templates

🔥 Viral
Stop scrolling... this changes everything.

💼 Business
Helping people solve problems every day.

😂 Funny
I said one video... now it's 3 AM.

💪 Motivation
Small steps every day become big results.`;

        }

        else if (message.includes("hashtag")) {

            reply = `#️⃣ Trending Hashtags

#ContentCreator
#Entrepreneur
#Marketing
#SocialMedia
#AI
#Viral
#Business
#Success`;

        }

        else if (message.includes("hook")) {

            reply = `🎯 Viral Hooks

• Nobody talks about this...

• I wish I knew this earlier...

• Stop scrolling!

• Here's why you're struggling...

• This will surprise you...`;

        }

        else if (message.includes("cta")) {

            reply = `📢 Call To Action Ideas

• Follow for more.

• Save this post.

• Share with a friend.

• Comment your thoughts.

• DM me to get started.`;

        }

        else if (message.includes("bio")) {

            reply = `👤 Bio Generator

Helping brands grow online 🚀

Content Creator | Entrepreneur

DM for collaborations`;

        }

        else if (message.includes("username")) {

            reply = `🔥 Username Ideas

ChatTBMStudio

TBMCreator

TBMMedia

CreateWithTBM

TheContentPlug`;

        }

        else if (message.includes("viral content")) {

            reply = `💡 Viral Content Ideas

1. Before vs After

2. Things Nobody Tells You

3. Behind The Scenes

4. My Biggest Mistake

5. AI Productivity Hacks`;

        }

        else if (message.includes("content calendar")) {

            reply = `📅 Weekly Content Calendar

Monday - Educational

Tuesday - Behind The Scenes

Wednesday - Tips

Thursday - Storytelling

Friday - Product

Saturday - Trends

Sunday - Motivation`;

        }

        else if (message.includes("create ai video")) {

            reply = `🎥 AI Video Creator

Let's begin!

Question 1 of 5

What is your video about?`;

        }

        else if (message.includes("video script")) {

            reply = `🎬 Tell me your topic and I'll create a complete video script.`;

        }

        else if (message.includes("image prompt")) {

            reply = `🖼️ Describe the scene you want and I'll generate an AI image prompt.`;

        }

        else if (message.includes("scene")) {

            reply = `🎞️ I'll divide your story into cinematic scenes.`;

        }

        else if (message.includes("voice")) {

            reply = `🎙️ I'll create a natural voice-over script for your video.`;

        }

        else if (message.includes("youtube")) {

            reply = `📺 I'll generate a YouTube script with Hook, Body and CTA.`;

        }

        else if (message.includes("reel") || message.includes("tiktok")) {

            reply = `🎵 I'll create a short-form Reel/TikTok script optimized for engagement.`;

        }

        else if (message.includes("caption")) {

            reply = "✍️ Dream big. Stay consistent. Success follows action. 🚀";

        }

        else if (message.includes("video")) {

            reply = "🎬 Try: Behind the scenes, 5 tips, Product showcase, Customer story.";

        }

        else if (message.includes("social media")) {

            reply = "📱 Consistency beats perfection. Show up every day.";

        }

        else if (message.includes("script")) {

            reply = "🎬 Start with a strong hook, tell a story, and end with a clear CTA.";

        }

        else {

            reply = "😊 ChatTBM is currently running in Demo Mode. Connect an AI API to unlock intelligent responses.";

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

    input.value = "Create a Viral Caption";
    sendMessage();

});

document.getElementById("video-btn").addEventListener("click", () => {

    input.value = "Generate Video Ideas";
    sendMessage();

});

document.getElementById("post-btn").addEventListener("click", () => {

    input.value = "Write Social Media Posts";
    sendMessage();

});

// =============================
// Auto Save Chat
// =============================

function saveChat(){

    localStorage.setItem("ChatTBM_Chat", chatBox.innerHTML);

}

function loadChat(){

    const saved = localStorage.getItem("ChatTBM_Chat");

    if(saved){

        chatBox.innerHTML = saved;

        if(saved.trim() !== ""){

            chatBox.classList.remove("hidden");

        }

        chatBox.scrollTop = chatBox.scrollHeight;

    }

}

const observer = new MutationObserver(() => {

    saveChat();

});

observer.observe(chatBox, {

    childList:true,
    subtree:true

});

loadChat();

// =============================
// Clear Chat
// =============================

function clearChat(){

    if(confirm("Clear this conversation?")){

        chatBox.innerHTML="";

        chatBox.classList.add("hidden");

        localStorage.removeItem("ChatTBM_Chat");

    }

}

// =============================
// Copy Latest ChatTBM Reply
// =============================

function copyLastReply(){

    const messages = chatBox.querySelectorAll(".bg-gray-800");

    if(messages.length===0){

        alert("No ChatTBM reply to copy.");

        return;

    }

    const lastReply = messages[messages.length-1].innerText;

    navigator.clipboard.writeText(lastReply);

    alert("Copied!");

}
