// =============================
// ChatTBM V3.1
// Core Functions
// =============================

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatBox = document.getElementById("chat-box");

const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");

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
                    📎 File Selected<br><br>
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

    input.value=text;

    sendMessage();

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

        voiceBtn.textContent="🎙️";

    });

    recognition.onresult=(event)=>{

        input.value=event.results[0][0].transcript;

        voiceBtn.textContent="🎤";

    };

    recognition.onend=()=>{

        voiceBtn.textContent="🎤";

    };

}else{

    voiceBtn.addEventListener("click",()=>{

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

    chatBox.innerHTML += `
        <div class="flex justify-end mb-3">
            <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">
                ${text}
            </div>
        </div>
    `;

    input.value = "";

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

            reply =
`✍️ Caption Templates

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

            reply =
`#️⃣ Trending Hashtags

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

            reply =
`🎯 Viral Hooks

• Nobody talks about this...
• I wish I knew this earlier...
• Here's why you're struggling...
• Stop scrolling!
• This will surprise you...`;

        }

        else if (message.includes("cta")) {

            reply =
`📢 Call To Action

• Follow for more.
• Save this post.
• Share with a friend.
• Comment your opinion.
• DM me to get started.`;

        }

        else if (message.includes("bio")) {

            reply =
`👤 Bio Generator

Helping brands grow online 🚀

Content Creator | Entrepreneur

DM for collaborations`;

        }

        else if (message.includes("username")) {

            reply =
`🔥 Username Ideas

ChatTBMStudio

TBMCreator

TBMMedia

TheContentPlug

CreateWithTBM`;

        }

        else if (message.includes("viral content")) {

            reply =
`💡 Viral Content Ideas

1. Before vs After

2. My biggest mistake

3. Things nobody tells you

4. Behind the scenes

5. AI productivity hacks`;

        }

        else if (message.includes("content calendar")) {

            reply =
`📅 Weekly Content Calendar

Monday - Educational

Tuesday - Behind the Scenes

Wednesday - Tips

Thursday - Story

Friday - Product

Saturday - Trends

Sunday - Motivation`;

        }

        else if (message.includes("caption")) {

            reply = "✍️ Dream big. Stay consistent. Success follows action. 🚀";

        }

        else if (message.includes("video")) {

            reply = "🎬 Try: Behind the scenes, 5 tips, or a day in your business.";

        }

        else if (message.includes("social media")) {

            reply = "📱 Consistency beats perfection. Show up every day.";

        }

        else if (message.includes("script")) {

            reply = "🎬 Start with a hook, tell a story, then finish with a strong CTA.";

        }

        else {

            reply = "😊 ChatTBM is running in Demo Mode. AI responses will become available once your API is connected.";

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

    },1000);

}

// =============================
// Events
// =============================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});

// =============================
// Quick Action Buttons
// =============================

document.getElementById("caption-btn").addEventListener("click",()=>{

    input.value="Create a Viral Caption";

    sendMessage();

});

document.getElementById("video-btn").addEventListener("click",()=>{

    input.value="Generate Video Ideas";

    sendMessage();

});

document.getElementById("post-btn").addEventListener("click",()=>{

    input.value="Write Social Media Posts";

    sendMessage();

});
