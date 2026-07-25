// =============================
// ChatTBM V3.5 Demo AI Engine
// Core Setup
// =============================

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
// ChatTBM Message Display
// =============================

function addBotMessage(message){

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


// =============================
// File Upload
// =============================

if(uploadBtn && fileInput){

    uploadBtn.addEventListener("click",()=>{

        fileInput.click();

    });


    fileInput.addEventListener("change",()=>{


        if(fileInput.files.length > 0){

            let file=fileInput.files[0];


            addBotMessage(
            `📎 File Selected

${file.name}

I can help you create content from this file.`
            );

        }

    });

}


// =============================
// Creator Tools
// =============================

function creatorTool(tool){


let request="";


switch(tool){


case "captionTemplates":

request="Create caption templates";

break;


case "hashtags":

request="Generate hashtags";

break;


case "hooks":

request="Create viral hooks";

break;


case "cta":

request="Create CTA ideas";

break;


case "bio":

request="Create creator bio";

break;


case "username":

request="Generate username ideas";

break;


case "ideas":

request="Generate viral content ideas";

break;


case "calendar":

request="Create content calendar";

break;


default:

request="Creator tool";


}


input.value=request;

sendMessage();


}


// =============================
// AI Video Studio Tools
// =============================

function videoTool(tool){


chatBox.classList.remove("hidden");


let message="";


switch(tool){


case "create":

message=
`🎥 AI Video Creator

I will create:

1. Hook
2. Story
3. Scenes
4. CTA

Tell me your video topic.`;

break;



case "script":

message=
`🎬 Video Script Generator

Give me your topic and I will create:

• Hook
• Main story
• Ending CTA`;

break;



case "image":

message=
`🖼️ AI Image Prompt Generator

Tell me what you want to create.

I will add:

• Character
• Camera
• Lighting
• Style`;

break;



case "scene":

message=
`🎞️ Story Scene Breakdown

Send your story and I will divide it into cinematic scenes.`;

break;



case "voice":

message=
`🎙️ Voice-over Writer

Tell me your video topic and I will create a natural voice script.`;

break;



case "youtube":

message=
`📺 YouTube Script Generator

Give me your topic.

I will create:

Hook → Body → CTA`;

break;



case "reels":

message=
`🎵 Reel & TikTok Script

Tell me your idea and I will create a short viral script.`;

break;


}


addBotMessage(message);


}

// =============================
// Voice Recognition
// =============================

if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){

    const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;


    const recognition = new SpeechRecognition();


    recognition.lang="en-US";
    recognition.continuous=false;
    recognition.interimResults=false;


    voiceBtn.addEventListener("click",()=>{

        recognition.start();

        voiceBtn.textContent="🎙️";

    });


    recognition.onresult=(event)=>{


        input.value =
        event.results[0][0].transcript;


        voiceBtn.textContent="🎤";

    };


    recognition.onend=()=>{

        voiceBtn.textContent="🎤";

    };


}

else{


    voiceBtn.addEventListener("click",()=>{

        alert("Voice input is not supported on this browser.");

    });


}



// =============================
// ChatTBM Demo AI Brain
// =============================

function generateAIReply(message){


let text=message.toLowerCase();



// Greetings

if(text.includes("hello") || text.includes("hi")){


return `
👋 Welcome to ChatTBM!

I am your AI Content Assistant.

I can help you create:

🎥 Videos
✍️ Captions
#️⃣ Hashtags
🎬 Scripts
🖼️ Image Prompts
📅 Content Plans
`;

}



// Video Script Generator

if(
text.includes("video script") ||
text.includes("create ai video") ||
text.includes("script")
){


return `
🎥 VIDEO SCRIPT

🔥 HOOK:
"Stop scrolling! You need to see this."

📖 STORY:
Introduce the problem and tell an engaging story.

🎬 SCENE 1:
Show the beginning moment.

🎬 SCENE 2:
Show the main action.

🎬 SCENE 3:
Show the result.

📢 CTA:
"Follow ChatTBM for more AI content ideas."
`;

}



// Image Prompt Generator

if(
text.includes("image") ||
text.includes("prompt")
){


return `
🖼️ CINEMATIC IMAGE PROMPT

Subject:
A detailed main character or product.

Camera:
Cinematic camera angle, shallow depth of field.

Lighting:
Professional dramatic lighting.

Style:
Ultra realistic, high quality, detailed.

Mood:
Creative and inspiring.
`;

}



// Scene Generator

if(
text.includes("scene") ||
text.includes("story")
){


return `
🎬 STORY TO SCENE BREAKDOWN


Scene 1:
Introduction and setting.


Scene 2:
Character faces a challenge.


Scene 3:
The main action happens.


Scene 4:
Final result and message.


Scene 5:
CTA and audience engagement.
`;

}



// Voice Over Generator

if(
text.includes("voice") ||
text.includes("voice-over")
){


return `
🎙️ VOICE-OVER SCRIPT


Intro:
"Today I will show you something amazing."


Middle:
"Follow along as we discover this step by step."


Ending:
"Try it yourself and share your results."
`;

}



// Caption Generator

if(
text.includes("caption")
){


return `
✍️ VIRAL CAPTION IDEAS


🔥 Caption 1:
"Your next big idea starts here."


🚀 Caption 2:
"Small actions create massive results."


😂 Caption 3:
"When your idea finally becomes reality."
`;

}



// Hashtag Generator

if(
text.includes("hashtag")
){


return `
#️⃣ HASHTAG PACK


#ContentCreator
#AI
#DigitalCreator
#ViralContent
#Entrepreneur
#SocialMedia
#ChatTBM
`;

}



// Hook Generator

if(
text.includes("hook")
){


return `
🎯 VIRAL HOOKS


• Nobody tells you this...

• I tested this so you don't have to...

• This changed everything...

• Stop making this mistake...
`;

}



// Title Generator

if(
text.includes("title")
){


return `
📌 TITLE IDEAS


1. The Secret To Creating Viral Content

2. How AI Is Changing Creators

3. 5 Things Every Creator Should Know
`;

}



// Content Calendar

if(
text.includes("calendar")
){


return `
📅 CONTENT CALENDAR


Monday:
Educational post


Tuesday:
Behind the scenes


Wednesday:
Tips and tricks


Thursday:
Storytelling


Friday:
Product showcase


Weekend:
Community content
`;

}



// Default AI Response


return `
🤖 ChatTBM Demo AI


I can help you create:

🎥 Video scripts
🖼️ Image prompts
🎬 Scenes
🎙️ Voice overs
✍️ Captions
#️⃣ Hashtags
📅 Content calendars


Tell me what you want to create.
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



// Thinking Animation

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


let reply = generateAIReply(text);



thinking.innerHTML=`

<div class="flex justify-start mb-3">

<div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">

🤖 <strong>ChatTBM</strong>

<br><br>

${reply.replace(/\n/g,"<br>")}

</div>

</div>

`;



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
// Quick Actions
// =============================


const captionButton =
document.getElementById("caption-btn");


if(captionButton){

captionButton.addEventListener("click",()=>{


input.value="Create a viral caption";


sendMessage();


});

}



const videoButton =
document.getElementById("video-btn");


if(videoButton){

videoButton.addEventListener("click",()=>{


input.value="Create AI video script";


sendMessage();


});

}



const postButton =
document.getElementById("post-btn");


if(postButton){

postButton.addEventListener("click",()=>{


input.value="Write social media posts";


sendMessage();


});

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


const saved =
localStorage.getItem("ChatTBM_Chat");



if(saved){


chatBox.innerHTML=saved;


chatBox.classList.remove("hidden");


chatBox.scrollTop=
chatBox.scrollHeight;


}


}



const observer =
new MutationObserver(()=>{


saveChat();


});



observer.observe(chatBox,{

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
// Copy Latest Reply
// =============================


function copyLastReply(){


const replies =
chatBox.querySelectorAll(".bg-gray-800");



if(replies.length===0){


alert("No ChatTBM reply found.");


return;


}



const last =
replies[replies.length-1].innerText;



navigator.clipboard.writeText(last);



alert("ChatTBM reply copied!");



}

// =============================
// ChatTBM V3.5 Extra AI Features
// =============================


// AI Content Post Generator

function createSocialPost(topic){

return `
📱 SOCIAL MEDIA POST


🔥 Hook:
${topic} is changing the way creators work.


📝 Main Post:

Here is something every creator should know about ${topic}.

Create.
Test.
Improve.
Grow.


📢 CTA:

Follow ChatTBM for more creator tools 🚀
`;

}



// AI YouTube Description Generator

function createYoutubeDescription(topic){

return `
📺 YOUTUBE DESCRIPTION


Title:
${topic} - Everything You Need To Know


Description:

In this video we explore ${topic}.

You will learn:
✅ Important tips
✅ Creative ideas
✅ Practical steps


Subscribe for more AI creator content.
`;

}



// AI Marketing Idea Generator

function marketingIdeas(){

return `
🚀 MARKETING IDEAS


1. Create a behind-the-scenes video

2. Share customer results

3. Make educational content

4. Show your process

5. Use storytelling to build trust
`;

}



// =============================
// New Chat Function
// =============================


function newChat(){


chatBox.innerHTML="";


chatBox.classList.add("hidden");


localStorage.removeItem("ChatTBM_Chat");


}



// =============================
// Protect Empty Elements
// =============================


document.addEventListener("DOMContentLoaded",()=>{


if(!chatBox){

console.log("ChatTBM chat area missing");

}


if(!input){

console.log("ChatTBM input missing");

}


});



// =============================
// ChatTBM V3.5 Ready
// =============================


console.log(
"🚀 ChatTBM V3.5 Demo AI Engine Loaded"
);
