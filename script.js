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

// =====================================
// ChatTBM V4.0
// Part 2 - Message System
// =====================================


// =============================
// User Message Display
// =============================

function addUserMessage(message){

    showChat();

    chatBox.innerHTML += `

    <div class="flex justify-end mb-3">

        <div class="bg-blue-600 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            ${cleanText(message)}

        </div>

    </div>

    `;

    scrollChat();

}



// =============================
// ChatTBM Message Display
// =============================

function addBotMessage(message){

    showChat();

    chatBox.innerHTML += `

    <div class="flex justify-start mb-3">

        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            🤖 <strong>ChatTBM</strong>

            <br><br>

            ${message.replace(/\n/g,"<br>")}

        </div>

    </div>

    `;


    scrollChat();

}



// =============================
// Thinking Animation
// =============================

function createThinkingBubble(){

    const thinking =
    document.createElement("div");


    thinking.className =
    "thinking-message";


    thinking.innerHTML = `

    <div class="flex justify-start mb-3">

        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            🤖 <strong>ChatTBM</strong>

            <br><br>

            Thinking...

        </div>

    </div>

    `;


    chatBox.appendChild(thinking);


    scrollChat();


    return thinking;

}



// =============================
// Replace Thinking With Reply
// =============================

function updateThinkingBubble(element,message){


    element.innerHTML = `

    <div class="flex justify-start mb-3">

        <div class="bg-gray-800 text-white px-4 py-3 rounded-2xl max-w-[80%]">

            🤖 <strong>ChatTBM</strong>

            <br><br>

            ${message.replace(/\n/g,"<br>")}

        </div>

    </div>

    `;


    scrollChat();

}



// =============================
// Conversation Tracker
// =============================

let conversationHistory = [];



function saveConversation(message,type){


    conversationHistory.push({

        role:type,

        message:message,

        time:new Date().toISOString()

    });


    localStorage.setItem(

        "ChatTBM_V4_History",

        JSON.stringify(conversationHistory)

    );



}



// Load Previous Conversation

const savedHistory =
localStorage.getItem("ChatTBM_V4_History");


if(savedHistory){

    conversationHistory =
    JSON.parse(savedHistory);

}



// =============================
// Chat Input Processing
// =============================

function processUserMessage(text){


    updateMemory(text);


    saveConversation(
        text,
        "user"
    );


    addUserMessage(text);



    const thinking =
    createThinkingBubble();



    setTimeout(()=>{


        const reply =
        generateAIReply(text);



        updateThinkingBubble(
            thinking,
            reply
        );


        saveConversation(
            reply,
            "assistant"
        );


    },1000);



}



// =============================
// Send Button
// =============================

if(sendBtn){


    sendBtn.addEventListener(
        "click",
        ()=>{

            const text =
            input.value.trim();


            if(text==="") return;


            input.value="";


            processUserMessage(text);


        }
    );


}



// =============================
// Enter Key Support
// =============================

if(input){


    input.addEventListener(
        "keypress",
        (event)=>{


            if(event.key==="Enter"){


                const text =
                input.value.trim();


                if(text==="") return;


                input.value="";


                processUserMessage(text);


            }


        }
    );


}

// =====================================
// ChatTBM V4.0
// Part 3 - AI Creator Assistant
// =====================================


// =============================
// Creator Assistant State
// =============================

let assistantMemory = {

    collecting:false,

    step:0,

    topic:"",
    platform:"",
    style:"",
    audience:""

};



// =============================
// Start Creator Assistant
// =============================

function startCreatorAssistant(){


    assistantMemory.collecting = true;

    assistantMemory.step = 1;


    addBotMessage(

`🧠 AI Creator Assistant Activated


Before I create your content, I need a few details.


Question 1:

🎯 What is your video topic?`

    );


}



// =============================
// Assistant Question Flow
// =============================

function creatorAssistantFlow(message){


    if(!assistantMemory.collecting){

        return false;

    }



    if(assistantMemory.step===1){


        assistantMemory.topic = message;

        chatMemory.topic = message;


        assistantMemory.step = 2;


        addBotMessage(

`Great! 👍


Question 2:

📱 Where will you post this content?


Choose:

• YouTube
• TikTok
• Instagram Reels
• Facebook`

        );


        return true;

    }




    if(assistantMemory.step===2){


        assistantMemory.platform = message;

        chatMemory.platform = message;


        assistantMemory.step = 3;


        addBotMessage(

`Perfect.


Question 3:

🎭 What style do you want?


Examples:

• Funny
• Cinematic
• Educational
• Emotional
• Professional`

        );


        return true;

    }




    if(assistantMemory.step===3){


        assistantMemory.style = message;

        chatMemory.style = message;


        assistantMemory.step = 4;


        addBotMessage(

`Almost done.


Question 4:

👥 Who is your target audience?


Example:

Creators, customers, students, business owners`

        );


        return true;

    }




    if(assistantMemory.step===4){


        assistantMemory.audience = message;

        chatMemory.audience = message;


        assistantMemory.collecting=false;


        saveMemory();



        addBotMessage(

`✅ Information collected!


I will now create:


🎬 Complete Video Script

🎙️ Voice-over

🎥 Scene Breakdown

🖼️ AI Image Prompt

✍️ Caption

#️⃣ Hashtags

📌 Title


Generating your content...`

        );



        setTimeout(()=>{


            addBotMessage(

                createCompleteContent(
                    assistantMemory.topic
                )

            );


        },1500);



        return true;

    }



    return false;

}



// =============================
// Detect Follow Up Requests
// =============================

function handleFollowUp(message){


    const text =
    message.toLowerCase();



    if(
        text.includes("make it funny") ||
        text.includes("make it cinematic") ||
        text.includes("make it shorter") ||
        text.includes("change style")
    ){


        if(chatMemory.topic !== ""){


            chatMemory.style = message;

            saveMemory();



            return createCompleteContent(
                chatMemory.topic
            );


        }


    }



    return null;

}



// =============================
// Assistant Launcher
// =============================

function activateAssistant(){

    activeAssistant = true;

    startCreatorAssistant();

}



// =============================
// Part 3 Loaded
// =============================

console.log(
"🧠 ChatTBM V4.0 Creator Assistant Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 4 - Creator Modes
// =====================================


// =============================
// Creator Mode Database
// =============================

const creatorModes = {


    "YouTube Creator Mode": {

        platform:"YouTube",

        style:"Long-form content",

        focus:
        "Hook, Story, Retention, SEO, CTA"

    },


    "TikTok/Reels Mode": {

        platform:"Short Video",

        style:"Fast viral content",

        focus:
        "Strong hook, fast pacing, trends"

    },


    "Business Marketing Mode": {

        platform:"Business",

        style:"Professional",

        focus:
        "Brand awareness, customers, sales"

    },


    "Storytelling Mode": {

        platform:"Story",

        style:"Emotional",

        focus:
        "Characters, conflict, emotion, ending"

    }


};



// =============================
// Activate Creator Mode
// =============================

function activateCreatorMode(mode){


    if(!creatorModes[mode]){


        addBotMessage(

`❌ Creator Mode not found.

Available Modes:

🎥 YouTube Creator Mode

🎵 TikTok/Reels Mode

💼 Business Marketing Mode

📖 Storytelling Mode`

        );


        return;

    }



    creatorMode = mode;



    localStorage.setItem(

        "ChatTBM_V4_Mode",

        creatorMode

    );



    const details =
    creatorModes[mode];



    addBotMessage(

`🎨 Creator Mode Activated


${mode}


Platform:
${details.platform}


Style:
${details.style}


Focus:
${details.focus}`

    );


}



// =============================
// Mode Suggestions
// =============================

function showCreatorModes(){


return `

🎨 CHATTBM CREATOR MODES


1️⃣ YouTube Creator Mode

Best for:
Long videos, tutorials, documentaries


2️⃣ TikTok/Reels Mode

Best for:
Short viral videos


3️⃣ Business Marketing Mode

Best for:
Products, brands and advertising


4️⃣ Storytelling Mode

Best for:
Stories, movies and emotional content


Choose a mode to activate.

`;

}



// =============================
// Detect Mode Commands
// =============================

function detectCreatorMode(text){


const message =
text.toLowerCase();



if(
message.includes("youtube mode") ||
message.includes("youtube creator")
){

    activateCreatorMode(
        "YouTube Creator Mode"
    );

    return true;

}



if(
message.includes("tiktok") ||
message.includes("reels mode")
){

    activateCreatorMode(
        "TikTok/Reels Mode"
    );

    return true;

}



if(
message.includes("business mode") ||
message.includes("marketing mode")
){

    activateCreatorMode(
        "Business Marketing Mode"
    );

    return true;

}



if(
message.includes("storytelling mode") ||
message.includes("story mode")
){

    activateCreatorMode(
        "Storytelling Mode"
    );

    return true;

}



return false;


}



// =============================
// Apply Mode To Generation
// =============================

function getModeInstructions(){


const mode =
creatorModes[creatorMode];



if(!mode){

    return "";

}



return `

Creator Mode:
${creatorMode}

Platform:
${mode.platform}

Style:
${mode.style}

Focus:
${mode.focus}

`;

}



// =============================
// Part 4 Loaded
// =============================

console.log(
"🎨 ChatTBM V4.0 Creator Modes Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 5 - Advanced Video Studio Generator
// =====================================


// =============================
// Complete Content Generator
// =============================

function createCompleteContent(topic){


    let modeInfo = getModeInstructions();



return `

${modeInfo}


━━━━━━━━━━━━━━

📌 TITLE

The Ultimate Guide To ${topic}


━━━━━━━━━━━━━━

🎬 VIDEO SCRIPT


🔥 HOOK:

"Stop scrolling! You need to know this about ${topic}."


📖 STORY:

Today we are exploring ${topic}.

We will discover the important ideas, the challenges,
and the solutions that can help people understand this topic.


🎯 MAIN MESSAGE:

The key lesson about ${topic} is to create value,
tell a story, and keep your audience engaged.


📢 CTA:

Follow ChatTBM for more creator tools and AI ideas.


━━━━━━━━━━━━━━

🎙️ VOICE-OVER SCRIPT


"Welcome everyone.

Today we are talking about ${topic}.

Stay until the end because you will discover something useful.

Let's begin our journey."


━━━━━━━━━━━━━━

🎥 SCENE BREAKDOWN


🎬 Scene 1:

Opening shot introducing ${topic}.

Camera:
Cinematic wide shot.


🎬 Scene 2:

Show the problem or situation.

Camera:
Close-up emotional shots.


🎬 Scene 3:

Show the main action or solution.

Camera:
Dynamic movement shots.


🎬 Scene 4:

Show the final result.

Camera:
Professional cinematic ending.


🎬 Scene 5:

Final message and audience CTA.


━━━━━━━━━━━━━━

🖼️ AI IMAGE PROMPT


Subject:

${topic}


Character:

Detailed realistic character connected to the topic.


Camera:

35mm cinematic camera,
shallow depth of field.


Lighting:

Professional cinematic lighting.


Style:

Ultra realistic,
high detail,
8K quality.


Mood:

Creative and inspiring.


━━━━━━━━━━━━━━

✍️ VIRAL CAPTION


Everything starts with a great idea.

Today we explore ${topic}.

Create. Improve. Grow.

Save this for later 🚀


━━━━━━━━━━━━━━

#️⃣ HASHTAGS


#ChatTBM
#AI
#ContentCreator
#ViralContent
#DigitalCreator
#Innovation
#${topic.replace(/\s+/g,"")}


`;

}



// =============================
// Quick Video Requests
// =============================

function generateVideoIdea(topic){


return `

🎬 VIDEO IDEA


Topic:

${topic}


Hook:

"Nobody tells you this..."


Story:

Explain the problem,
show the journey,
then reveal the solution.


Ending:

Ask viewers to comment their thoughts.

`;

}



// =============================
// Short Form Generator
// =============================

function createShortVideo(topic){


return `

🎵 SHORT VIDEO SCRIPT


🔥 Hook (0-3 seconds):

"Wait! You need to see this."


🎬 Scene 1:

Introduce ${topic}.


🎬 Scene 2:

Show the interesting part.


🎬 Scene 3:

Give the result.


📢 CTA:

Follow for more.


`;

}



// =============================
// YouTube Description Generator
// =============================

function createYoutubeDescription(topic){


return `

📺 YOUTUBE DESCRIPTION


Title:

The Complete Guide To ${topic}


Description:

In this video we explore ${topic}.

You will learn useful ideas,
creative strategies,
and practical tips.


Subscribe for more ChatTBM AI creator tools.

`;

}



// =============================
// Part 5 Loaded
// =============================

console.log(
"🎬 ChatTBM V4.0 Video Studio Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 6 - Creator Content Tools
// =====================================


// =============================
// Caption Generator
// =============================

function generateCaption(topic){


return `

✍️ VIRAL CAPTION


🔥 Caption 1:

Your next big idea starts with one action.


🚀 Caption 2:

The future belongs to creators who keep learning.


😂 Caption 3:

I started with an idea...
now look what happened.


📌 Topic:

${topic || "Your content"}

`;

}



// =============================
// Hashtag Generator
// =============================

function generateHashtags(topic){


return `

#️⃣ HASHTAG PACK


#ChatTBM

#AI

#ContentCreator

#CreatorEconomy

#DigitalCreator

#ViralContent

#SocialMedia

#${(topic || "Creator").replace(/\s+/g,"")}

`;

}



// =============================
// Hook Generator
// =============================

function generateHooks(){


return `

🎯 VIRAL HOOKS


• Stop scrolling, you need to see this...


• Nobody talks about this...


• I discovered something amazing...


• This changed the way I create content...


• Before you try anything else, watch this...


`;

}



// =============================
// Title Generator
// =============================

function generateTitles(topic){


return `

📌 TITLE IDEAS


1. The Secret Behind ${topic}


2. How To Master ${topic}


3. Everything You Need To Know About ${topic}


4. Why Everyone Is Talking About ${topic}


5. The Future Of ${topic}


`;

}



// =============================
// Creator Bio Generator
// =============================

function generateBio(){


return `

👤 CREATOR BIO


AI Creator | Digital Storyteller 🚀


Helping creators turn ideas into content.


🎥 Videos
🤖 AI Tools
🔥 Creative Growth


`;

}



// =============================
// Username Generator
// =============================

function generateUsernames(){


return `

🔥 USERNAME IDEAS


ChatTBMStudio

CreatorWithAI

FutureCreatorAI

DigitalStoryLab

ViralCreatorHub

AIContentMaster

`;

}



// =============================
// Content Calendar Generator
// =============================

function generateCalendar(){


return `

📅 WEEKLY CONTENT CALENDAR


MONDAY

Educational Content


TUESDAY

Behind The Scenes


WEDNESDAY

Tips & Tricks


THURSDAY

Storytelling


FRIDAY

Product / Service


SATURDAY

Trending Content


SUNDAY

Community Engagement


`;

}



// =============================
// Marketing Ideas
// =============================

function generateMarketingIdeas(topic){


return `

💼 MARKETING IDEAS


1. Create a behind-the-scenes video about ${topic}


2. Share customer results


3. Explain your process


4. Tell your brand story


5. Create educational content


`;

}



// =============================
// Creator Tool Router
// =============================

function runCreatorTool(command){


const text =
command.toLowerCase();



if(text.includes("caption")){

    return generateCaption(chatMemory.topic);

}



if(text.includes("hashtag")){

    return generateHashtags(chatMemory.topic);

}



if(text.includes("hook")){

    return generateHooks();

}



if(text.includes("title")){

    return generateTitles(chatMemory.topic);

}



if(text.includes("bio")){

    return generateBio();

}



if(text.includes("username")){

    return generateUsernames();

}



if(text.includes("calendar")){

    return generateCalendar();

}



if(text.includes("marketing")){

    return generateMarketingIdeas(chatMemory.topic);

}



return null;


}



// =============================
// Part 6 Loaded
// =============================

console.log(
"✍️ ChatTBM V4.0 Creator Tools Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 7 - Multiple Chat Conversations
// =====================================


// =============================
// Chat Database
// =============================

let chatList = {};

let currentChat = "Chat 1";


// Load Chat Database

const savedChats =
localStorage.getItem("ChatTBM_V4_Chats");


if(savedChats){

    chatList = JSON.parse(savedChats);

}
else{

    chatList["Chat 1"] = "";

}



// =============================
// Save All Chats
// =============================

function saveChatList(){

    localStorage.setItem(
        "ChatTBM_V4_Chats",
        JSON.stringify(chatList)
    );

}



// =============================
// Save Current Chat
// =============================

function saveCurrentChat(){


    if(chatBox){

        chatList[currentChat] =
        chatBox.innerHTML;

    }


    saveChatList();

}



// =============================
// Load Chat
// =============================

function loadChat(name){


    currentChat = name;


    if(chatList[name]){


        chatBox.innerHTML =
        chatList[name];


        showChat();


    }
    else{


        chatBox.innerHTML="";


    }


    scrollChat();


}



// =============================
// Create New Chat
// =============================

function createNewChat(){


    saveCurrentChat();



    let number =
    Object.keys(chatList).length + 1;



    let newName =
    "Chat " + number;



    chatList[newName] = "";


    currentChat = newName;


    chatBox.innerHTML="";


    chatBox.classList.add("hidden");


    saveChatList();



    addBotMessage(

`✨ New Chat Created


${newName}


Start creating something new!`

    );


}



// =============================
// Rename Chat
// =============================

function renameChat(oldName,newName){


    if(!chatList[oldName]){

        return;

    }



    chatList[newName] =
    chatList[oldName];



    delete chatList[oldName];



    if(currentChat===oldName){

        currentChat=newName;

    }



    saveChatList();


}



// =============================
// Delete Chat
// =============================

function deleteChat(name){


    if(!chatList[name]){

        return;

    }



    delete chatList[name];



    let remaining =
    Object.keys(chatList);



    if(remaining.length===0){

        chatList["Chat 1"]="";

        currentChat="Chat 1";

    }
    else{

        currentChat=remaining[0];

    }



    saveChatList();



    loadChat(currentChat);


}



// =============================
// Show Chat History
// =============================

function showChatHistory(){


let history = `

📂 CHAT HISTORY


`;



Object.keys(chatList).forEach(
(name,index)=>{


history +=

`${index+1}. ${name}

`;


});



addBotMessage(history);


}



// =============================
// Auto Save When Chat Changes
// =============================

if(chatBox){


const chatObserver =
new MutationObserver(()=>{


    saveCurrentChat();


});



chatObserver.observe(
chatBox,
{
    childList:true,
    subtree:true
}
);


}



// =============================
// Load Current Chat On Start
// =============================

loadChat(currentChat);



// =============================
// Part 7 Loaded
// =============================

console.log(
"📂 ChatTBM V4.0 Multiple Chat System Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 8 - Voice + File Assistant
// =====================================


// =============================
// File Upload System
// =============================

if(uploadBtn && fileInput){


    uploadBtn.addEventListener(
        "click",
        ()=>{

            fileInput.click();

        }
    );



    fileInput.addEventListener(
        "change",
        ()=>{


            if(fileInput.files.length > 0){


                const file =
                fileInput.files[0];



                addBotMessage(

`📂 File Uploaded


Name:

${file.name}


I can help you:

📝 Summarize it

✍️ Create captions

🎬 Create scripts

📢 Turn it into content`

                );



                localStorage.setItem(
                    "ChatTBM_Last_File",
                    file.name
                );


            }


        }
    );


}



// =============================
// Voice Recognition
// =============================

if(
"webkitSpeechRecognition" in window ||
"SpeechRecognition" in window
){


const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



const recognition =
new SpeechRecognition();



recognition.lang =
"en-US";


recognition.continuous =
false;


recognition.interimResults =
false;



if(voiceBtn){


voiceBtn.addEventListener(
"click",
()=>{


    recognition.start();


    voiceBtn.textContent="🎙️";


}
);


}



recognition.onresult =
(event)=>{


    const voiceText =
    event.results[0][0].transcript;



    input.value =
    voiceText;



    voiceBtn.textContent="🎤";


};



recognition.onend =
()=>{


    voiceBtn.textContent="🎤";


};



}
else{


if(voiceBtn){


voiceBtn.addEventListener(
"click",
()=>{


alert(
"Voice input is not supported in this browser."
);


}
);


}


}



// =============================
// File Content Assistant
// =============================

function analyzeFileRequest(text){


const message =
text.toLowerCase();



if(
message.includes("summarize file")
){

return `

📄 FILE SUMMARY


I will analyze your uploaded file
and create a simple summary.


`;

}



if(
message.includes("create post from file")
){

return `

📱 CONTENT FROM FILE


I will transform your file into:

• Social media post

• Caption

• Hashtags

• Content ideas


`;

}



return null;


}



// =============================
// Creator Assistant Commands
// =============================

function detectAssistantCommand(text){


const message =
text.toLowerCase();



if(
message.includes("help me create")
||
message.includes("create content")
){


activateAssistant();


return true;


}



if(
message.includes("creator modes")
){


addBotMessage(
showCreatorModes()
);


return true;


}



return false;


}



// =============================
// V4.0 Tool Controller
// =============================

function runV4ToolCheck(text){


let result = null;



result =
analyzeFileRequest(text);



if(result){

return result;

}



if(
detectCreatorMode(text)
){

return "Creator mode activated.";

}



if(
detectAssistantCommand(text)
){

return "Assistant started.";

}



result =
runCreatorTool(text);



if(result){

return result;

}



return null;


}



// =============================
// Part 8 Loaded
// =============================

console.log(
"🎤 ChatTBM V4.0 Voice & File Assistant Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 9 - AI Brain Response Router
// =====================================


// =============================
// Main AI Brain
// =============================

function generateAIReply(message){


const text =
message.toLowerCase();


// Update memory

updateMemory(message);



// =============================
// Tool Check
// =============================

const toolResponse =
runV4ToolCheck(message);



if(toolResponse){

    return toolResponse;

}



// =============================
// Follow Up Memory
// =============================

const followUp =
handleFollowUp(message);



if(followUp){

    return followUp;

}



// =============================
// Greetings
// =============================

if(
text.includes("hello") ||
text.includes("hi") ||
text.includes("hey")
){


return `

👋 Welcome to ChatTBM V4.0


Your AI Creator Assistant.


I can create:


🎬 Video Scripts

🎙️ Voice Overs

🎥 Scene Breakdowns

🖼️ Image Prompts

✍️ Captions

#️⃣ Hashtags

📌 Titles

📅 Content Calendars


Tell me what you want to create.

`;

}



// =============================
// Start Creator Assistant
// =============================

if(
text.includes("create a video") ||
text.includes("help me create") ||
text.includes("make content")
){


activeAssistant = true;


startCreatorAssistant();


return "";

}



// =============================
// Complete Video Creation
// =============================

if(
text.includes("video") ||
text.includes("script") ||
text.includes("youtube") ||
text.includes("tiktok") ||
text.includes("reel")
){


let topic =
chatMemory.topic || message;



return createCompleteContent(topic);


}



// =============================
// Caption
// =============================

if(
text.includes("caption")
){


return generateCaption(
chatMemory.topic
);


}



// =============================
// Hashtags
// =============================

if(
text.includes("hashtag")
){


return generateHashtags(
chatMemory.topic
);


}



// =============================
// Hooks
// =============================

if(
text.includes("hook")
){


return generateHooks();


}



// =============================
// Titles
// =============================

if(
text.includes("title")
){


return generateTitles(
chatMemory.topic
);


}



// =============================
// Calendar
// =============================

if(
text.includes("calendar")
){


return generateCalendar();


}



// =============================
// Marketing
// =============================

if(
text.includes("marketing")
 ||
text.includes("business")
){


return generateMarketingIdeas(
chatMemory.topic
);


}



// =============================
// Image Prompt
// =============================

if(
text.includes("image") ||
text.includes("prompt")
){


return `

🖼️ AI IMAGE PROMPT


Subject:

${chatMemory.topic || "Creative idea"}


Camera:

Cinematic camera angle.


Lighting:

Professional dramatic lighting.


Style:

Ultra realistic,
high detail,
8K quality.


`;

}



// =============================
// Scene Breakdown
// =============================

if(
text.includes("scene")
){


return `

🎥 SCENE BREAKDOWN


Scene 1:
Opening introduction.


Scene 2:
Main problem.


Scene 3:
Action begins.


Scene 4:
Final result.


Scene 5:
CTA.


`;

}



// =============================
// Default Response
// =============================

return `

🤖 ChatTBM V4.0


I am ready to help you create.


Try:


"Create a video about a restaurant"


"Make a TikTok about fitness"


"Create a business advert"


"Generate captions"


"Give me creator ideas"


`;

}



// =============================
// Part 9 Loaded
// =============================

console.log(
"🧠 ChatTBM V4.0 AI Brain Loaded"
);

// =====================================
// ChatTBM V4.0
// Part 10 - Final Connection
// =====================================


// =============================
// Auto Save Chat
// =============================

function saveChat(){

    if(chatBox){

        localStorage.setItem(
            "ChatTBM_V4_CurrentChat",
            chatBox.innerHTML
        );

    }

}



// =============================
// Load Saved Chat
// =============================

function loadSavedChat(){

    const saved =
    localStorage.getItem(
        "ChatTBM_V4_CurrentChat"
    );


    if(saved && chatBox){

        chatBox.innerHTML = saved;

        showChat();

        scrollChat();

    }

}



// =============================
// New Chat
// =============================

function newChat(){


    if(chatBox){

        chatBox.innerHTML="";

        chatBox.classList.add("hidden");

    }



    chatMemory = {

        topic:"",
        lastRequest:"",
        style:"",
        platform:"",
        audience:""

    };


    saveMemory();



    addBotMessage(

`✨ New Chat Started


What would you like to create today?`

    );


}



// =============================
// Clear Chat
// =============================

function clearChat(){


    if(confirm("Clear this conversation?")){


        chatBox.innerHTML="";


        chatBox.classList.add("hidden");


        localStorage.removeItem(
            "ChatTBM_V4_CurrentChat"
        );


    }

}



// =============================
// Copy Latest Reply
// =============================

function copyLastReply(){


const replies =
chatBox.querySelectorAll(
".bg-gray-800"
);



if(replies.length===0){


alert(
"No ChatTBM response found."
);


return;


}



const latest =
replies[
replies.length-1
].innerText;



navigator.clipboard.writeText(
latest
);



alert(
"ChatTBM response copied!"
);


}



// =============================
// Chat Auto Save Observer
// =============================

if(chatBox){


const observer =
new MutationObserver(()=>{


saveChat();


});



observer.observe(
chatBox,
{
childList:true,
subtree:true
}
);


}



// =============================
// Load Chat On Start
// =============================

loadSavedChat();



// =============================
// Protection Checks
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


if(!chatBox){

console.log(
"Chat box not found"
);

}


if(!input){

console.log(
"Input box not found"
);

}


}
);



// =============================
// ChatTBM V4.0 Complete
// =============================

console.log(
"🚀 ChatTBM V4.0 AI Creator Assistant Ready"
);
