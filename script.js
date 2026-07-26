// =====================================
// ChatTBM V5.0 Professional Edition
// Clean script.js
// Part 1 - Core System + AI Engine
// =====================================


// =============================
// DOM ELEMENTS
// =============================

const chatBox = document.getElementById("chat-box");

const welcomeScreen = document.getElementById("welcome-screen");

const userInput = document.getElementById("user-input");

const sendButton = document.getElementById("send-btn");



// =============================
// APP STATE
// =============================

const ChatTBM = {

    version: "5.0",

    mode: "demo",

    lastMessage: "",

    typing: false

};



// =============================
// SHOW CHAT AREA
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
// SCROLL CHAT
// =============================

function scrollChat(){

    if(chatBox){

        chatBox.scrollTop =
        chatBox.scrollHeight;

    }

}



// =============================
// AI RESPONSE DATABASE
// =============================

const chatTBMReplies = {


    greeting:[

        "Hello 👋 Welcome to ChatTBM. How can I help you create today?",

        "Hey creator 🚀 What are we building today?",

        "Welcome back to ChatTBM AI Assistant."

    ],



    content:[

        "I can help you create viral captions, scripts, hooks, and content ideas.",

        "Tell me your niche and I will generate content ideas for you.",

        "Let's create something engaging for your audience."

    ],



    script:[

        "I can write YouTube scripts, TikTok scripts, and Reels scripts.",

        "Give me your topic and I will create a powerful script."

    ],



    caption:[

        "I can create catchy captions with emojis and hashtags.",

        "Describe your photo or video and I will create a caption."

    ],



    default:[

        "ChatTBM is ready to help you turn ideas into content.",

        "Tell me more details and I will help you improve it.",

        "I understand. Let's build something creative."

    ]


};



// =============================
// RANDOM RESPONSE
// =============================

function randomReply(type){


    let replies =
    chatTBMReplies[type];


    return replies[
        Math.floor(
            Math.random() * replies.length
        )
    ];

}



// =============================
// AI UNDERSTANDING
// =============================

function generateReply(message){


    let text =
    message.toLowerCase();



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
// BOT TYPING EFFECT
// =============================

function typeBotMessage(text){


    if(!chatBox) return;



    let botMessage =
    document.createElement("div");


    botMessage.className =
    "message bot";


    chatBox.appendChild(
        botMessage
    );



    let index = 0;



    let typing =
    setInterval(()=>{


        botMessage.innerHTML +=
        text[index];



        index++;


        scrollChat();



        if(index >= text.length){


            clearInterval(
                typing
            );


        }


    },30);


}



// =============================
// OFFLINE AI RESPONSE
// =============================

function processAIResponse(message){


    setTimeout(()=>{


        let reply =
        generateReply(message);



        typeBotMessage(
            reply
        );


    },800);


}



console.log(
"✅ ChatTBM V5.0 Part 1 Loaded"
);

// =====================================
// ChatTBM V5.0 Professional Edition
// Part 2 - Chat History + File Upload
// =====================================


// =============================
// CHAT HISTORY STORAGE
// =============================

const CHAT_STORAGE_KEY =
"ChatTBM_History";



// =============================
// SAVE CHAT HISTORY
// =============================

function saveChatHistory(){


    if(!chatBox) return;



    let messages = [];



    let allMessages =
    chatBox.querySelectorAll(
        ".message"
    );



    allMessages.forEach(message=>{


        messages.push({

            type:
            message.classList.contains("user")
            ? "user"
            : "bot",


            text:
            message.innerText


        });


    });



    localStorage.setItem(

        CHAT_STORAGE_KEY,

        JSON.stringify(messages)

    );


}



// =============================
// LOAD CHAT HISTORY
// =============================

function loadChatHistory(){


    let saved =
    localStorage.getItem(
        CHAT_STORAGE_KEY
    );



    if(!saved) return;



    let messages =
    JSON.parse(saved);



    messages.forEach(message=>{


        createMessage(

            message.text,

            message.type

        );


    });


}



// =============================
// CREATE SAVED MESSAGE
// =============================

function createMessage(text,type){


    if(!chatBox) return;



    let message =
    document.createElement(
        "div"
    );



    message.className =
    "message " + type;



    message.innerText =
    text;



    chatBox.appendChild(
        message
    );



    scrollChat();


}



// =============================
// NEW CHAT
// =============================

function startNewChat(){


    if(chatBox){

        chatBox.innerHTML =
        "";

    }



    localStorage.removeItem(
        CHAT_STORAGE_KEY
    );



    typeBotMessage(
    "🚀 New Chat started. How can ChatTBM help you today?"
    );


}



// =============================
// FILE UPLOAD SYSTEM
// =============================


const uploadButton =
document.getElementById(
    "upload-btn"
);


const fileInput =
document.getElementById(
    "file-input"
);


const attachmentPreview =
document.getElementById(
    "attachment-preview"
);



let uploadedFile = null;



// =============================
// OPEN FILE PICKER
// =============================

if(uploadButton){


    uploadButton.addEventListener(

        "click",

        ()=>{


            if(fileInput){

                fileInput.click();

            }


        }

    );


}



// =============================
// FILE SELECTED
// =============================

if(fileInput){


    fileInput.addEventListener(

        "change",

        (event)=>{


            let file =
            event.target.files[0];



            if(!file) return;



            uploadedFile =
            file;



            showFilePreview(file);



        }

    );


}



// =============================
// SHOW FILE PREVIEW
// =============================

function showFilePreview(file){


    if(!attachmentPreview)
    return;



    attachmentPreview.innerHTML =
    "";



    let preview =
    document.createElement(
        "div"
    );



    preview.className =
    "file-preview";



    if(
        file.type.startsWith(
            "image/"
        )
    ){


        let image =
        document.createElement(
            "img"
        );



        image.src =
        URL.createObjectURL(
            file
        );



        image.className =
        "upload-image-preview";



        preview.appendChild(
            image
        );


    }



    let name =
    document.createElement(
        "p"
    );



    name.innerText =
    "📎 " + file.name;



    preview.appendChild(
        name
    );



    attachmentPreview.appendChild(
        preview
    );


}



// =============================
// REMOVE FILE
// =============================

function removeAttachment(){


    uploadedFile =
    null;



    if(fileInput){

        fileInput.value =
        "";

    }



    if(attachmentPreview){

        attachmentPreview.innerHTML =
        "";

    }


}



// =============================
// ATTACHMENT INFO
// =============================

function getAttachmentInfo(){


    if(!uploadedFile){

        return "";

    }



    return "\n📎 Attached: "
    + uploadedFile.name;


}



console.log(
"✅ ChatTBM V5.0 Part 2 Loaded"
);

// =====================================
// ChatTBM V5.0 Professional Edition
// Part 3 - Voice Input + Message System
// =====================================


// =============================
// VOICE INPUT SYSTEM
// =============================

const voiceButton =
document.getElementById(
    "voice-btn"
);



const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



let recognition = null;



if(SpeechRecognition){


    recognition =
    new SpeechRecognition();



    recognition.continuous =
    false;



    recognition.interimResults =
    false;



    recognition.lang =
    "en-US";



    recognition.onresult =
    function(event){


        let voiceText =
        event.results[0][0].transcript;



        if(userInput){


            userInput.value =
            voiceText;


        }


    };



    recognition.onerror =
    function(){


        console.log(
        "Voice input error"
        );


    };


}



// =============================
// START VOICE
// =============================

if(voiceButton){


    voiceButton.addEventListener(

        "click",

        ()=>{


            if(recognition){


                recognition.start();



                voiceButton.classList.add(
                    "recording"
                );


            }
            else{


                alert(
                "Voice input is not supported on this browser."
                );


            }


        }

    );


}



// =============================
// STOP VOICE ANIMATION
// =============================

if(recognition){


    recognition.onend =
    function(){


        if(voiceButton){


            voiceButton.classList.remove(
                "recording"
            );


        }


    };


}



// =============================
// ADD USER MESSAGE
// =============================

function addUserMessage(text){


    if(!chatBox) return;



    let message =
    document.createElement(
        "div"
    );



    message.className =
    "message user";



    message.innerText =
    text;



    chatBox.appendChild(
        message
    );



    ChatTBM.lastMessage =
    text;



    scrollChat();



    saveChatHistory();


}



// =============================
// SEND MESSAGE
// =============================

function sendMessage(){


    if(!userInput)
    return;



    let message =
    userInput.value.trim();



    if(
        message === "" &&
        !uploadedFile
    ){

        return;

    }



    let fullMessage =
    message + getAttachmentInfo();



    addUserMessage(
        fullMessage
    );



    userInput.value =
    "";



    removeAttachment();



    showChat();



    processAIResponse(
        message
    );


}



// =============================
// SEND BUTTON
// =============================

if(sendButton){


    sendButton.addEventListener(

        "click",

        sendMessage

    );


}



// =============================
// ENTER TO SEND
// =============================

if(userInput){


    userInput.addEventListener(

        "keydown",

        (event)=>{


            if(event.key === "Enter"){


                event.preventDefault();



                sendMessage();


            }


        }

    );


}



// =============================
// WELCOME MESSAGE
// =============================

function showWelcomeMessage(){


    if(
        chatBox &&
        chatBox.children.length === 0
    ){


        typeBotMessage(

        "👋 Welcome to ChatTBM V5.0. Your AI Content Assistant is ready."

        );


    }


}



console.log(
"✅ ChatTBM V5.0 Part 3 Loaded"
);

 // =====================================
// ChatTBM V5.0 Professional Edition
// Part 4 - AI Backend + Smart Router + Controls
// =====================================


// =============================
// BACKEND SETTINGS
// =============================

const CHATTBM_API_URL =
"https://chattbm-backend.onrender.com/chat";


let useLiveAI = false;



// =============================
// ENABLE LIVE AI
// =============================

function enableLiveAI(){

    useLiveAI = true;

}



// =============================
// SEND TO AI BACKEND
// =============================

async function sendToAIBackend(message){


    try{


        showTypingIndicator();



        const response =
        await fetch(
            CHATTBM_API_URL,
            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    message:message,

                    app:"ChatTBM",

                    version:"5.0"

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
            "I could not generate a response."
            );


        }


    }
    catch(error){


        removeTypingIndicator();



        console.log(
        "Backend error:",
        error
        );



        typeBotMessage(
        "⚠️ ChatTBM is currently using offline mode."
        );


    }


}



// =============================
// SMART AI ROUTER
// =============================

function smartAIResponse(message){


    if(useLiveAI){


        sendToAIBackend(
            message
        );


    }
    else{


        processAIResponse(
            message
        );


    }


}



// =============================
// TYPING INDICATOR
// =============================

function showTypingIndicator(){


    if(!chatBox)
    return;



    let typing =
    document.createElement(
        "div"
    );



    typing.id =
    "typing-indicator";



    typing.className =
    "message bot";



    typing.innerText =
    "ChatTBM is thinking...";



    chatBox.appendChild(
        typing
    );



    scrollChat();


}



// =============================
// REMOVE TYPING
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
// COPY RESPONSE
// =============================

const copyButton =
document.getElementById(
    "copy-btn"
);



if(copyButton){


    copyButton.addEventListener(

        "click",

        ()=>{


            let bots =
            document.querySelectorAll(
                ".message.bot"
            );



            if(bots.length){


                let lastBot =
                bots[
                    bots.length - 1
                ];



                navigator.clipboard.writeText(
                    lastBot.innerText
                );



                copyButton.innerText =
                "Copied ✓";



                setTimeout(()=>{


                    copyButton.innerText =
                    "Copy";


                },1500);


            }


        }

    );


}



// =============================
// REGENERATE RESPONSE
// =============================

const regenerateButton =
document.getElementById(
    "regenerate-btn"
);



if(regenerateButton){


    regenerateButton.addEventListener(

        "click",

        ()=>{


            if(ChatTBM.lastMessage){


                smartAIResponse(
                    ChatTBM.lastMessage
                );


            }


        }

    );


}



// =============================
// NEW CHAT BUTTON
// =============================

const newChatButton =
document.getElementById(
    "new-chat-btn"
);



if(newChatButton){


    newChatButton.addEventListener(

        "click",

        ()=>{


            startNewChat();


        }

    );


}



// =============================
// UPDATE MESSAGE ROUTING
// =============================

// Override response call safely

const originalProcess =
processAIResponse;



processAIResponse =
function(message){


    smartAIResponse(
        message
    );


};



console.log(
"✅ ChatTBM V5.0 Part 4 Loaded"
);

// =====================================
// ChatTBM V5.0 Professional Edition
// Part 5 - Account System + Security
// =====================================


// =============================
// USER STORAGE
// =============================

const USER_STORAGE_KEY =
"ChatTBM_User";



// =============================
// ACCOUNT BUTTONS
// =============================

const loginButton =
document.getElementById(
    "login-btn"
);


const signupButton =
document.getElementById(
    "signup-btn"
);


const logoutButton =
document.getElementById(
    "logout-btn"
);


const userNameDisplay =
document.getElementById(
    "user-name"
);



// =============================
// SAVE USER
// =============================

function saveUser(user){


    localStorage.setItem(

        USER_STORAGE_KEY,

        JSON.stringify(user)

    );


}



// =============================
// GET USER
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
// DISPLAY USER
// =============================

function showUser(user){


    if(userNameDisplay){


        userNameDisplay.innerText =
        user.name;


    }


}



// =============================
// CREATE ACCOUNT DEMO
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
// LOGOUT
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

if(loginButton){


    loginButton.addEventListener(

        "click",

        ()=>{


            typeBotMessage(
            "Login system is ready. Connect your authentication service here."
            );


        }

    );


}



// =============================
// SIGNUP BUTTON
// =============================

if(signupButton){


    signupButton.addEventListener(

        "click",

        ()=>{


            typeBotMessage(
            "Signup system is ready. User registration can be connected."
            );


        }

    );


}



// =============================
// LOGOUT BUTTON
// =============================

if(logoutButton){


    logoutButton.addEventListener(

        "click",

        logoutUser

    );


}



// =============================
// SECURITY SETTINGS
// =============================

const MAX_MESSAGE_LENGTH =
2000;



// =============================
// CLEAN INPUT
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
// MESSAGE CHECK
// =============================

function validateMessage(text){


    if(
        text.length >
        MAX_MESSAGE_LENGTH
    ){


        typeBotMessage(
        "⚠️ Your message is too long."
        );


        return false;


    }



    return true;


}



// =============================
// SECURE MESSAGE
// =============================

function secureMessage(message){


    let clean =
    sanitizeInput(message);



    if(
        !validateMessage(clean)
    ){

        return null;

    }



    return clean;


}



// =============================
// LOAD USER SESSION
// =============================

function loadUserSession(){


    let user =
    getCurrentUser();



    if(user){

        showUser(user);

    }


}



console.log(
"✅ ChatTBM V5.0 Part 5 Loaded"
);

// =====================================
// ChatTBM V5.0 Professional Edition
// Part 6 - Premium + Dashboard + Settings
// =====================================


// =============================
// PREMIUM PLAN SYSTEM
// =============================

const PLAN_STORAGE_KEY =
"ChatTBM_Plan";


const USAGE_STORAGE_KEY =
"ChatTBM_Usage";



const plans = {


    free:{

        name:"Free",

        dailyMessages:20

    },


    pro:{

        name:"Pro",

        dailyMessages:500

    }


};



// =============================
// GET PLAN
// =============================

function getUserPlan(){


    return localStorage.getItem(
        PLAN_STORAGE_KEY
    ) || "free";


}



// =============================
// SAVE PLAN
// =============================

function setUserPlan(plan){


    localStorage.setItem(
        PLAN_STORAGE_KEY,
        plan
    );


}



// =============================
// MESSAGE USAGE
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
// CHECK LIMIT
// =============================

function canUseAI(){


    let plan =
    getUserPlan();



    let usage =
    getUsage();



    let today =
    new Date().toDateString();



    if(usage.date !== today){


        usage = {

            count:0,

            date:today

        };


    }



    if(
        usage.count >=
        plans[plan].dailyMessages
    ){


        typeBotMessage(
        "🚀 Daily limit reached. Upgrade to ChatTBM Pro."
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
// DASHBOARD
// =============================

const dashboardButton =
document.getElementById(
    "dashboard-btn"
);


const dashboardPanel =
document.getElementById(
    "dashboard-panel"
);


const closeDashboard =
document.getElementById(
    "close-dashboard"
);



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

function closeDashboardPanel(){


    if(dashboardPanel){


        dashboardPanel.style.display =
        "none";


    }


}



// =============================
// DASHBOARD UPDATE
// =============================

function updateDashboard(){


    let user =
    getCurrentUser();



    let plan =
    getUserPlan();



    let usage =
    getUsage();



    let name =
    document.getElementById(
        "dashboard-name"
    );


    let planBox =
    document.getElementById(
        "dashboard-plan"
    );


    let usageBox =
    document.getElementById(
        "dashboard-usage"
    );



    if(name){

        name.innerText =
        user ? user.name : "Guest";

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
// DASHBOARD BUTTONS
// =============================

if(dashboardButton){


    dashboardButton.addEventListener(

        "click",

        openDashboard

    );


}



if(closeDashboard){


    closeDashboard.addEventListener(

        "click",

        closeDashboardPanel

    );


}



// =============================
// SETTINGS SYSTEM
// =============================

const SETTINGS_KEY =
"ChatTBM_Settings";



const defaultSettings = {


    theme:"dark",

    notifications:true,

    language:"English"


};



// =============================
// GET SETTINGS
// =============================

function getSettings(){


    let settings =
    localStorage.getItem(
        SETTINGS_KEY
    );



    return settings
    ? JSON.parse(settings)
    : defaultSettings;


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
// THEME CHANGE
// =============================

function changeTheme(theme){


    let settings =
    getSettings();



    settings.theme =
    theme;



    saveSettings(settings);



    document.body.className =
    theme;


}



// =============================
// NOTIFICATION TOGGLE
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
// UPGRADE BUTTON
// =============================

const upgradeButton =
document.getElementById(
    "upgrade-btn"
);



if(upgradeButton){


    upgradeButton.addEventListener(

        "click",

        ()=>{


            typeBotMessage(
            "⭐ ChatTBM Pro upgrade will be available soon."
            );


        }

    );


}



console.log(
"✅ ChatTBM V5.0 Part 6 Loaded"
);

// =====================================
// ChatTBM V5.0 Professional Edition
// Part 7 - Final Startup + App Initializer
// =====================================


// =============================
// SETTINGS BUTTONS
// =============================

const darkModeButton =
document.getElementById(
    "dark-mode-btn"
);


const lightModeButton =
document.getElementById(
    "light-mode-btn"
);


const notificationButton =
document.getElementById(
    "notification-btn"
);



// =============================
// DARK MODE
// =============================

if(darkModeButton){

    darkModeButton.addEventListener(
        "click",
        ()=>{

            changeTheme("dark");

        }
    );

}



// =============================
// LIGHT MODE
// =============================

if(lightModeButton){

    lightModeButton.addEventListener(
        "click",
        ()=>{

            changeTheme("light");

        }
    );

}



// =============================
// NOTIFICATIONS
// =============================

if(notificationButton){

    notificationButton.addEventListener(
        "click",
        toggleNotifications
    );

}



// =============================
// APPLY SAVED SETTINGS
// =============================

function applySavedSettings(){


    let settings =
    getSettings();



    if(settings.theme){


        document.body.className =
        settings.theme;


    }


}



// =============================
// APP START FUNCTION
// =============================

function startChatTBM(){


    console.log(
    "🚀 Starting ChatTBM V5.0..."
    );

