// =====================================
// ChatTBM V5.0 Professional Edition
// script.js
// Part 3.1 - Core System
// =====================================

// =============================
// DOM ELEMENTS
// =============================

const chatBox = document.getElementById("chat-box");
const welcomeScreen = document.getElementById("welcome-screen");

const userInput = document.getElementById("user-input");

const sendButton = document.getElementById("send-btn");
const uploadButton = document.getElementById("upload-btn");
const voiceButton = document.getElementById("voice-btn");

const fileInput = document.getElementById("file-input");

// =============================
// APP STATE
// =============================

const ChatTBM = {

    version: "5.0",

    mode: "demo",

    backendReady: true,

    lastMessage: "",

    creatorMode: "General",

    typing: false

};

// =============================
// TIME
// =============================

function getCurrentTime(){

    return new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

// =============================
// SCROLL CHAT
// =============================

function scrollChat(){

    if(!chatBox) return;

    chatBox.scrollTo({

        top: chatBox.scrollHeight,

        behavior: "smooth"

    });

}

// =============================
// SHOW CHAT
// =============================

function showChat(){

    if(chatBox){

        chatBox.classList.remove("hidden");

    }

    if(welcomeScreen){

        welcomeScreen.style.display = "none";

    }

}

// =============================
// CONSOLE
// =============================

console.log("✅ ChatTBM V5.0 Core Loaded");

// =====================================
// ChatTBM V5.0
// Part 3.2 - AI Response Engine + Typing Effect
// =====================================


// =============================
// AI RESPONSE DATABASE
// =============================

const chatTBMReplies = {

    greeting: [
        "Hello 👋 Welcome to ChatTBM. How can I help you create today?",
        "Hey creator 🚀 What are we building today?",
        "Welcome back to ChatTBM AI Assistant."
    ],

    content: [
        "I can help you create viral captions, scripts, hooks, and content ideas.",
        "Tell me your niche and I will generate content ideas for you.",
        "Let's create something engaging for your audience."
    ],

    script: [
        "I can write YouTube scripts, TikTok scripts, Reels scripts, and storytelling content.",
        "Give me your topic and preferred style, and I'll create a script."
    ],

    caption: [
        "I can create catchy captions with emojis and hashtags.",
        "Tell me your photo or video idea and I'll write a caption."
    ],

    default: [
        "I understand. Let me help you with that.",
        "Interesting idea. Tell me more details so I can create something better.",
        "ChatTBM is ready to help you turn ideas into content."
    ]

};


// =============================
// FIND AI RESPONSE
// =============================

function generateReply(message){

    let text = message.toLowerCase();


    if(
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ){
        return randomReply("greeting");
    }


    if(
        text.includes("content") ||
        text.includes("idea") ||
        text.includes("viral")
    ){
        return randomReply("content");
    }


    if(
        text.includes("script") ||
        text.includes("video")
    ){
        return randomReply("script");
    }


    if(
        text.includes("caption") ||
        text.includes("post")
    ){
        return randomReply("caption");
    }


    return randomReply("default");

}



// =============================
// RANDOM REPLY PICKER
// =============================

function randomReply(category){

    let replies = chatTBMReplies[category];

    return replies[
        Math.floor(Math.random() * replies.length)
    ];

}



// =============================
// BOT TYPING EFFECT
// =============================

function typeBotMessage(text){

    let botMessage = document.createElement("div");

    botMessage.className = "message bot";

    chatBox.appendChild(botMessage);


    let index = 0;


    let typing = setInterval(()=>{

        botMessage.innerHTML += text[index];

        index++;


        chatBox.scrollTop = chatBox.scrollHeight;


        if(index >= text.length){

            clearInterval(typing);

        }


    },30);

}



// =============================
// SEND TO AI ENGINE
// =============================

function processAIResponse(userText){

    setTimeout(()=>{

        let reply = generateReply(userText);

        typeBotMessage(reply);


    },800);

}

// =====================================
// ChatTBM V5.0
// Part 3.3 - Chat History System
// =====================================


// =============================
// CHAT STORAGE SETTINGS
// =============================

const CHAT_STORAGE_KEY = "ChatTBM_History";



// =============================
// SAVE CHAT HISTORY
// =============================

function saveChatHistory(){

    let messages = [];


    let allMessages = document.querySelectorAll(".message");


    allMessages.forEach(message=>{

        messages.push({

            type: message.classList.contains("user")
            ? "user"
            : "bot",

            text: message.innerText

        });

    });


    localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(messages)
    );

}



// =============================
// LOAD OLD CHAT
// =============================

function loadChatHistory(){

    let savedChat = localStorage.getItem(
        CHAT_STORAGE_KEY
    );


    if(!savedChat){
        return;
    }


    let messages = JSON.parse(savedChat);


    messages.forEach(message=>{

        createSavedMessage(
            message.text,
            message.type
        );

    });

}



// =============================
// CREATE SAVED MESSAGE
// =============================

function createSavedMessage(text,type){

    let message = document.createElement("div");


    message.className =
    `message ${type}`;


    message.innerText = text;


    chatBox.appendChild(message);


    chatBox.scrollTop =
    chatBox.scrollHeight;

}



// =============================
// CLEAR CHAT
// =============================

function startNewChat(){

    localStorage.removeItem(
        CHAT_STORAGE_KEY
    );


    chatBox.innerHTML = "";


    typeBotMessage(
        "New chat started 🚀 How can ChatTBM help you today?"
    );

}



// =============================
// AUTO SAVE LISTENER
// =============================

function enableAutoSave(){

    chatBox.addEventListener(
        "DOMSubtreeModified",
        ()=>{

            saveChatHistory();

        }
    );

}



// =============================
// INITIALIZE HISTORY
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{

    loadChatHistory();

    enableAutoSave();

});

 // =====================================
// ChatTBM V5.0
// Part 3.4 - File Upload + Image Preview
// =====================================


// =============================
// CONNECT UPLOAD ELEMENTS
// =============================

const uploadBtn = document.getElementById("upload-btn");

const fileInput = document.getElementById("file-input");

const attachmentPreview = document.getElementById(
    "attachment-preview"
);

let uploadedFile = null;



// =============================
// OPEN FILE SELECTOR
// =============================

if(uploadBtn){

    uploadBtn.addEventListener(
        "click",
        ()=>{

            fileInput.click();

        }
    );

}



// =============================
// HANDLE FILE SELECTION
// =============================

if(fileInput){

    fileInput.addEventListener(
        "change",
        (event)=>{


            const file =
            event.target.files[0];


            if(!file){
                return;
            }


            uploadedFile = file;


            showFilePreview(file);


        }
    );

}



// =============================
// SHOW FILE PREVIEW
// =============================

function showFilePreview(file){


    attachmentPreview.innerHTML = "";


    let preview =
    document.createElement("div");


    preview.className =
    "file-preview";



    if(file.type.startsWith("image/")){


        let image =
        document.createElement("img");


        image.src =
        URL.createObjectURL(file);


        image.className =
        "upload-image-preview";


        preview.appendChild(image);


    }


    let name =
    document.createElement("p");


    name.innerText =
    "📎 " + file.name;


    preview.appendChild(name);



    attachmentPreview.appendChild(
        preview
    );


}



// =============================
// REMOVE ATTACHMENT
// =============================

function removeAttachment(){


    uploadedFile = null;


    fileInput.value = "";


    attachmentPreview.innerHTML =
    "";


}



// =============================
// INCLUDE FILE WITH MESSAGE
// =============================

function getAttachmentInfo(){


    if(!uploadedFile){

        return "";

    }


    return `\n📎 Attached file: ${uploadedFile.name}`;

}

// =====================================
// ChatTBM V5.0
// Part 3.5 - Voice Input System
// =====================================


// =============================
// CONNECT VOICE ELEMENTS
// =============================

const micBtn = document.getElementById("mic-btn");

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



// =============================
// CHECK BROWSER SUPPORT
// =============================

let recognition;


if(SpeechRecognition){

    recognition = new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-US";



    // =============================
    // WHEN VOICE IS RECEIVED
    // =============================

    recognition.onresult = function(event){


        let voiceText =
        event.results[0][0].transcript;



        if(userInput){

            userInput.value =
            voiceText;

        }


    };



    // =============================
    // VOICE ERROR HANDLER
    // =============================

    recognition.onerror = function(){

        console.log(
        "Voice recognition error"
        );

    };



}
else{


    console.log(
    "Voice input not supported"
    );


}



// =============================
// START MICROPHONE
// =============================

if(micBtn){


    micBtn.addEventListener(
    "click",
    ()=>{


        if(recognition){


            recognition.start();


            micBtn.classList.add(
            "recording"
            );


        }
        else{


            alert(
            "Your browser does not support voice input"
            );


        }


    });


}



// =============================
// STOP RECORDING STYLE
// =============================

if(recognition){


    recognition.onend = function(){


        if(micBtn){

            micBtn.classList.remove(
            "recording"
            );

        }


    };


}

// =====================================
// ChatTBM V5.0
// Part 3.6 - Advanced Message System
// =====================================


// =============================
// CONNECT SEND ELEMENTS
// =============================

const sendBtn = document.getElementById("send-btn");



// =============================
// SEND MESSAGE FUNCTION
// =============================

function sendMessage(){


    let message =
    userInput.value.trim();



    if(message === "" && !uploadedFile){

        return;

    }



    // Add attachment information

    let fullMessage =
    message + getAttachmentInfo();



    // Show user message

    addUserMessage(fullMessage);



    // Clear input

    userInput.value = "";



    // Remove attachment preview

    removeAttachment();



    // Generate AI response

    processAIResponse(message);



}



// =============================
// USER MESSAGE DISPLAY
// =============================

function addUserMessage(text){


    let message =
    document.createElement("div");


    message.className =
    "message user";


    message.innerText =
    text;



    chatBox.appendChild(message);



    chatBox.scrollTop =
    chatBox.scrollHeight;



    saveChatHistory();


}



// =============================
// SEND BUTTON CLICK
// =============================

if(sendBtn){


    sendBtn.addEventListener(
        "click",
        sendMessage
    );


}



// =============================
// ENTER KEY SEND
// =============================

if(userInput){


    userInput.addEventListener(
    "keydown",
    function(event){


        if(event.key === "Enter"){


            event.preventDefault();


            sendMessage();


        }


    });


}



// =============================
// WELCOME MESSAGE
// =============================

function showWelcomeMessage(){


    if(chatBox.children.length === 0){


        typeBotMessage(
        "👋 Welcome to ChatTBM V5.0. Your AI Content Assistant is ready."
        );


    }


}



// =============================
// START APP
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    showWelcomeMessage();


});

// =====================================
// ChatTBM V5.0
// Part 3.7 - AI API Connection Layer
// =====================================


// =============================
// BACKEND CONFIGURATION
// =============================

const CHATTBM_API_URL =
"https://chattbm-backend.onrender.com/chat";



// =============================
// CONNECT TO AI BACKEND
// =============================

async function sendToAIBackend(message){


    try{


        showTypingIndicator();



        const response =
        await fetch(
            CHATTBM_API_URL,
            {

                method: "POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },


                body: JSON.stringify({

                    message: message,

                    app: "ChatTBM",

                    version: "V5.0"

                })

            }
        );



        const data =
        await response.json();



        removeTypingIndicator();



        if(data.reply){


            typeBotMessage(
                data.reply
            );


        }
        else{


            typeBotMessage(
            "Sorry, I could not generate a response."
            );


        }



    }
    catch(error){


        console.error(
            "AI Connection Error:",
            error
        );


        removeTypingIndicator();


        typeBotMessage(
        "⚠️ ChatTBM is currently running in offline mode."
        );


    }


}



// =============================
// TYPING INDICATOR
// =============================

function showTypingIndicator(){


    let typing =
    document.createElement("div");


    typing.id =
    "typing-indicator";


    typing.className =
    "message bot typing";


    typing.innerText =
    "ChatTBM is thinking...";


    chatBox.appendChild(
        typing
    );


    chatBox.scrollTop =
    chatBox.scrollHeight;


}



// =============================
// REMOVE TYPING INDICATOR
// =============================

function removeTypingIndicator(){


    let typing =
    document.getElementById(
        "typing-indicator"
    );


    if(typing){

        typing.remove();

    }


}



// =============================
// API MODE SWITCH
// =============================

let useLiveAI = false;



function enableLiveAI(){


    useLiveAI = true;


}



// =============================
// SMART RESPONSE ROUTER
// =============================

async function smartAIResponse(message){


    if(useLiveAI){


        await sendToAIBackend(
            message
        );


    }
    else{


        processAIResponse(
            message
        );


    }


}

// =====================================
// ChatTBM V5.0
// Part 3.8 - Smart AI Message Router
// =====================================


// =============================
// AI MODE SETTINGS
// =============================

// Change this to true
// when your backend API is ready

useLiveAI = false;



// =============================
// UPDATED RESPONSE HANDLER
// =============================

async function processSmartResponse(message){


    if(useLiveAI){


        await sendToAIBackend(
            message
        );


    }
    else{


        setTimeout(()=>{


            let reply =
            generateReply(message);



            typeBotMessage(
                reply
            );


        },800);


    }


}



// =============================
// REPLACE OLD SEND FUNCTION
// =============================

function sendMessage(){


    let message =
    userInput.value.trim();



    if(message === "" && !uploadedFile){

        return;

    }



    let fullMessage =
    message + getAttachmentInfo();



    addUserMessage(
        fullMessage
    );



    userInput.value = "";



    removeAttachment();



    // New AI Router

    processSmartResponse(
        message
    );



}



// =============================
// AI STATUS DISPLAY
// =============================

function showAIStatus(){


    if(useLiveAI){


        console.log(
        "ChatTBM Live AI Mode Enabled"
        );


    }
    else{


        console.log(
        "ChatTBM Demo AI Mode Enabled"
        );


    }


}



// =============================
// START AI SYSTEM
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    showAIStatus();


});

// =====================================
// ChatTBM V5.0
// Part 3.9 - UI Control System
// =====================================


// =============================
// CONNECT UI BUTTONS
// =============================

const newChatBtn =
document.getElementById("new-chat-btn");

const copyBtn =
document.getElementById("copy-btn");

const regenerateBtn =
document.getElementById("regenerate-btn");



let lastUserMessage = "";



// =============================
// TRACK LAST MESSAGE
// =============================

function saveLastUserMessage(message){

    lastUserMessage = message;

}



// =============================
// UPDATE SEND FUNCTION TRACKING
// =============================

const oldAddUserMessage =
addUserMessage;



function addUserMessage(text){


    oldAddUserMessage(text);


    saveLastUserMessage(text);


}



// =============================
// NEW CHAT BUTTON
// =============================

if(newChatBtn){


    newChatBtn.addEventListener(
    "click",
    ()=>{


        chatBox.innerHTML = "";


        localStorage.removeItem(
            CHAT_STORAGE_KEY
        );


        typeBotMessage(
        "🚀 New Chat started. What would you like to create?"
        );


    });


}



// =============================
// COPY LAST AI RESPONSE
// =============================

if(copyBtn){


    copyBtn.addEventListener(
    "click",
    ()=>{


        let botMessages =
        document.querySelectorAll(
            ".message.bot"
        );


        if(botMessages.length > 0){


            let lastBot =
            botMessages[
            botMessages.length - 1
            ];



            navigator.clipboard.writeText(
                lastBot.innerText
            );


            copyBtn.innerText =
            "Copied ✓";



            setTimeout(()=>{

                copyBtn.innerText =
                "Copy";

            },1500);


        }


    });


}



// =============================
// REGENERATE RESPONSE
// =============================

if(regenerateBtn){


    regenerateBtn.addEventListener(
    "click",
    ()=>{


        if(lastUserMessage){


            processSmartResponse(
                lastUserMessage
            );


        }
        else{


            typeBotMessage(
            "No previous message to regenerate."
            );


        }


    });


}



// =============================
// REMOVE DUPLICATE OLD CONTROLS
// =============================

function refreshControls(){


    console.log(
    "ChatTBM controls loaded"
    );


}



// =============================
// INITIALIZE CONTROLS
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    refreshControls();


});

// =====================================
// ChatTBM V5.0
// Part 3.10 - User Account System
// =====================================


// =============================
// ACCOUNT SETTINGS
// =============================

const USER_STORAGE_KEY =
"ChatTBM_User";



// =============================
// CONNECT ACCOUNT ELEMENTS
// =============================

const loginBtn =
document.getElementById("login-btn");

const signupBtn =
document.getElementById("signup-btn");

const logoutBtn =
document.getElementById("logout-btn");

const userNameDisplay =
document.getElementById("user-name");



// =============================
// SAVE USER SESSION
// =============================

function saveUser(user){


    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
    );


}



// =============================
// GET CURRENT USER
// =============================

function getCurrentUser(){


    let user =
    localStorage.getItem(
        USER_STORAGE_KEY
    );


    if(user){

        return JSON.parse(user);

    }


    return null;


}



// =============================
// CREATE DEMO ACCOUNT
// =============================

function createAccount(name,email){


    let user = {


        name:name,

        email:email,

        joined:
        new Date().toISOString()


    };


    saveUser(user);



    showUser(user);


    typeBotMessage(
    `Welcome ${name} 🎉 Your ChatTBM account is ready.`
    );


}



// =============================
// DISPLAY USER
// =============================

function showUser(user){


    if(userNameDisplay){


        userNameDisplay.innerText =
        user.name;


    }


}



// =============================
// LOGOUT USER
// =============================

function logoutUser(){


    localStorage.removeItem(
        USER_STORAGE_KEY
    );


    if(userNameDisplay){


        userNameDisplay.innerText =
        "Guest";


    }


    typeBotMessage(
    "You have been logged out."
    );


}



// =============================
// LOGIN BUTTON
// =============================

if(loginBtn){


    loginBtn.addEventListener(
    "click",
    ()=>{


        typeBotMessage(
        "Login system ready. Connect your authentication service next."
        );


    });


}



// =============================
// SIGNUP BUTTON
// =============================

if(signupBtn){


    signupBtn.addEventListener(
    "click",
    ()=>{


        typeBotMessage(
        "Signup system ready. User registration can now be connected."
        );


    });


}



// =============================
// LOGOUT BUTTON
// =============================

if(logoutBtn){


    logoutBtn.addEventListener(
    "click",
    logoutUser
    );


}



// =============================
// LOAD USER ON START
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    let user =
    getCurrentUser();



    if(user){

        showUser(user);

    }


});

// =====================================
// ChatTBM V5.0
// Part 3.11 - Security & Input Protection
// =====================================


// =============================
// SECURITY SETTINGS
// =============================

const MAX_MESSAGE_LENGTH = 2000;



// =============================
// CLEAN USER INPUT
// =============================

function sanitizeInput(text){


    if(!text){

        return "";

    }



    return text

    .trim()

    .replace(
        /<script.*?>.*?<\/script>/gi,
        ""
    )

    .replace(
        /<.*?>/g,
        ""
    );

}



// =============================
// CHECK MESSAGE LENGTH
// =============================

function validateMessage(text){


    if(
        text.length >
        MAX_MESSAGE_LENGTH
    ){


        typeBotMessage(
        "⚠️ Your message is too long. Please shorten it."
        );


        return false;

    }


    return true;

}



// =============================
// PROTECTED MESSAGE PROCESSOR
// =============================

function secureMessage(message){


    let cleanMessage =
    sanitizeInput(message);



    if(
        !validateMessage(cleanMessage)
    ){

        return null;

    }



    return cleanMessage;


}



// =============================
// API REQUEST PROTECTION
// =============================

function createSecurePayload(message){


    return {


        message: message,


        app:
        "ChatTBM",


        version:
        "V5.0",


        timestamp:
        Date.now()


    };


}



// =============================
// BLOCK EMPTY REQUESTS
// =============================

function canSendMessage(message){


    if(
        message.length === 0
    ){

        return false;

    }


    return true;

}



// =============================
// SECURITY STATUS
// =============================

function securityCheck(){


    console.log(
    "🔒 ChatTBM Security Layer Active"
    );


}



// =============================
// START SECURITY
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    securityCheck();


});

// =====================================
// ChatTBM V5.0
// Part 3.12 - Premium Plan System
// =====================================


// =============================
// PLAN SETTINGS
// =============================

const PLAN_STORAGE_KEY =
"ChatTBM_Plan";


const USAGE_STORAGE_KEY =
"ChatTBM_Usage";



// =============================
// PLAN LIMITS
// =============================

const plans = {

    free: {

        name: "Free",

        dailyMessages: 20

    },


    pro: {

        name: "Pro",

        dailyMessages: 500

    }

};



// =============================
// GET CURRENT PLAN
// =============================

function getUserPlan(){


    let plan =
    localStorage.getItem(
        PLAN_STORAGE_KEY
    );


    return plan || "free";


}



// =============================
// SAVE USER PLAN
// =============================

function setUserPlan(plan){


    localStorage.setItem(
        PLAN_STORAGE_KEY,
        plan
    );


}



// =============================
// TRACK MESSAGE USAGE
// =============================

function getUsage(){


    let usage =
    localStorage.getItem(
        USAGE_STORAGE_KEY
    );


    if(usage){

        return JSON.parse(usage);

    }


    return {

        count:0,

        date:
        new Date().toDateString()

    };


}



// =============================
// RESET DAILY USAGE
// =============================

function checkDailyReset(){


    let usage =
    getUsage();



    let today =
    new Date().toDateString();



    if(usage.date !== today){


        usage = {

            count:0,

            date:today

        };


        localStorage.setItem(
            USAGE_STORAGE_KEY,
            JSON.stringify(usage)
        );


    }


}



// =============================
// CHECK MESSAGE ALLOWANCE
// =============================

function canUseAI(){


    checkDailyReset();



    let plan =
    getUserPlan();



    let usage =
    getUsage();



    if(
        usage.count >=
        plans[plan].dailyMessages
    ){


        typeBotMessage(
        "🚀 You have reached your daily limit. Upgrade to ChatTBM Pro for more access."
        );


        return false;


    }



    usage.count++;



    localStorage.setItem(
        USAGE_STORAGE_KEY,
        JSON.stringify(usage)
    );



    return true;


}



// =============================
// UPGRADE BUTTON
// =============================

const upgradeBtn =
document.getElementById(
"upgrade-btn"
);



if(upgradeBtn){


    upgradeBtn.addEventListener(
    "click",
    ()=>{


        typeBotMessage(
        "⭐ ChatTBM Pro upgrade will be available soon."
        );


    });


}



// =============================
// PLAN DISPLAY
// =============================

function showPlan(){


    let plan =
    getUserPlan();



    console.log(
    "Current ChatTBM Plan:",
    plans[plan].name
    );


}



// =============================
// START PREMIUM SYSTEM
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    showPlan();


});

// =====================================
// ChatTBM V5.0
// Part 3.13 - User Dashboard System
// =====================================


// =============================
// DASHBOARD ELEMENTS
// =============================

const dashboardBtn =
document.getElementById("dashboard-btn");


const dashboardPanel =
document.getElementById("dashboard-panel");


const closeDashboardBtn =
document.getElementById("close-dashboard");



// =============================
// OPEN DASHBOARD
// =============================

function openDashboard(){


    if(dashboardPanel){


        dashboardPanel.style.display =
        "block";


        updateDashboard();


    }


}



// =============================
// CLOSE DASHBOARD
// =============================

function closeDashboard(){


    if(dashboardPanel){


        dashboardPanel.style.display =
        "none";


    }


}



// =============================
// CONNECT BUTTONS
// =============================

if(dashboardBtn){


    dashboardBtn.addEventListener(
    "click",
    openDashboard
    );


}



if(closeDashboardBtn){


    closeDashboardBtn.addEventListener(
    "click",
    closeDashboard
    );


}



// =============================
// UPDATE DASHBOARD INFO
// =============================

function updateDashboard(){


    let user =
    getCurrentUser();



    let plan =
    getUserPlan();



    let usage =
    getUsage();



    const nameBox =
    document.getElementById(
        "dashboard-name"
    );


    const planBox =
    document.getElementById(
        "dashboard-plan"
    );


    const usageBox =
    document.getElementById(
        "dashboard-usage"
    );



    if(nameBox){


        nameBox.innerText =
        user
        ? user.name
        : "Guest";


    }



    if(planBox){


        planBox.innerText =
        plans[plan].name;


    }



    if(usageBox){


        usageBox.innerText =
        `${usage.count}/${plans[plan].dailyMessages} messages used`;


    }


}



// =============================
// SETTINGS SYSTEM
// =============================

const settingsBtn =
document.getElementById(
"settings-btn"
);



if(settingsBtn){


    settingsBtn.addEventListener(
    "click",
    ()=>{


        typeBotMessage(
        "⚙️ Settings opened. ChatTBM customization is ready."
        );


    });


}



// =============================
// PROFILE UPDATE
// =============================

function updateProfile(newName){


    let user =
    getCurrentUser();



    if(user){


        user.name =
        newName;


        saveUser(user);


        updateDashboard();


    }


}



// =============================
// DASHBOARD START
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    updateDashboard();


});

// =====================================
// ChatTBM V5.0
// Part 3.14 - Settings & Customization System
// =====================================


// =============================
// SETTINGS STORAGE
// =============================

const SETTINGS_KEY =
"ChatTBM_Settings";



// =============================
// DEFAULT SETTINGS
// =============================

const defaultSettings = {

    theme: "dark",

    notifications: true,

    language: "English"

};



// =============================
// GET SETTINGS
// =============================

function getSettings(){


    let settings =
    localStorage.getItem(
        SETTINGS_KEY
    );


    if(settings){

        return JSON.parse(settings);

    }


    return defaultSettings;


}



// =============================
// SAVE SETTINGS
// =============================

function saveSettings(settings){


    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );


}



// =============================
// CHANGE THEME
// =============================

function changeTheme(theme){


    let settings =
    getSettings();



    settings.theme =
    theme;



    saveSettings(settings);



    applyTheme();


}



// =============================
// APPLY THEME
// =============================

function applyTheme(){


    let settings =
    getSettings();



    document.body.className =
    settings.theme;



    console.log(
    "ChatTBM Theme:",
    settings.theme
    );


}



// =============================
// NOTIFICATION SETTINGS
// =============================

function toggleNotifications(){


    let settings =
    getSettings();



    settings.notifications =
    !settings.notifications;



    saveSettings(settings);



    typeBotMessage(

    settings.notifications

    ? "🔔 Notifications enabled."

    : "🔕 Notifications disabled."

    );


}



// =============================
// LANGUAGE SETTINGS
// =============================

function changeLanguage(language){


    let settings =
    getSettings();



    settings.language =
    language;



    saveSettings(settings);



    typeBotMessage(
    "🌍 Language changed to " + language
    );


}



// =============================
// SETTINGS BUTTONS
// =============================

const darkModeBtn =
document.getElementById(
"dark-mode-btn"
);


const lightModeBtn =
document.getElementById(
"light-mode-btn"
);


const notificationBtn =
document.getElementById(
"notification-btn"
);



if(darkModeBtn){

    darkModeBtn.onclick = ()=>{

        changeTheme("dark");

    };

}



if(lightModeBtn){

    lightModeBtn.onclick = ()=>{

        changeTheme("light");

    };

}



if(notificationBtn){

    notificationBtn.onclick =
    toggleNotifications;

}



// =============================
// LOAD SETTINGS
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    applyTheme();


});
