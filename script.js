// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 1A - CORE CHAT SYSTEM
// =====================================


// =============================
// HTML CONNECTIONS
// =============================

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

let lastUserRequest = "";




// =============================
// TIME
// =============================

function getTime(){

    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}




// =============================
// SCROLL CHAT
// =============================

function scrollChat(){

    if(!chatBox) return;

    chatBox.scrollTop = chatBox.scrollHeight;

}





// =============================
// ADD USER MESSAGE
// =============================

function addUserMessage(message){

    if(!chatBox) return;


    chatBox.classList.remove("hidden");


    lastUserRequest = message;


    chatBox.innerHTML += `

    <div class="flex justify-end mb-5">

        <div class="user-bubble">

            ${message.replace(/\n/g,"<br>")}


            <div class="message-time">

                ${getTime()}

            </div>


        </div>

    </div>

    `;


    scrollChat();

}





// =============================
// ADD AI MESSAGE
// =============================

function addBotMessage(message){

    if(!chatBox) return;


    chatBox.classList.remove("hidden");


    chatBox.innerHTML += `

    <div class="ai-message mb-5">

        <div class="ai-bubble">


            <div class="ai-header">

                🤖 ChatTBM

            </div>



            <div class="ai-content">

                ${message.replace(/\n/g,"<br>")}

            </div>



            <div class="message-time">

                ${getTime()}

            </div>


        </div>

    </div>

    `;


    scrollChat();

}





// =============================
// THINKING LOADER
// =============================

function showThinking(){

    if(!chatBox) return null;


    const loader = document.createElement("div");


    loader.className =
    "ai-message mb-5";


    loader.innerHTML = `

    <div class="ai-bubble">


        <div class="ai-header">

            🤖 ChatTBM

        </div>



        <div class="ai-content">

            Thinking...

        </div>


    </div>

    `;


    chatBox.appendChild(loader);


    scrollChat();


    return loader;

}





console.log(
"✅ ChatTBM V4.2 Part 1A Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 1B - RESPONSE ACTIONS
// =====================================



// =============================
// COPY RESPONSE
// =============================

function copyResponse(element){


    const box = document.getElementById(element);


    if(!box) return;



    const text =
    box.querySelector(".ai-content");



    if(!text) return;



    navigator.clipboard.writeText(
        text.innerText
    )
    .then(()=>{

        showNotice("📋 Response copied");

    })
    .catch(()=>{

        showNotice("❌ Copy failed");

    });


}







// =============================
// EDIT RESPONSE
// =============================

function editResponse(element){


    const box =
    document.getElementById(element);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    const newText =
    prompt(
        "Edit ChatTBM response:",
        content.innerText
    );



    if(
        newText &&
        newText.trim() !== ""
    ){


        content.innerHTML =
        newText.replace(/\n/g,"<br>");



        showNotice(
            "✅ Response updated"
        );


    }


}







// =============================
// REGENERATE RESPONSE
// =============================

function regenerateResponse(element){


    const box =
    document.getElementById(element);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    content.innerHTML =
    "⏳ Creating new version...";



    setTimeout(()=>{


        let reply = `

🚀 ChatTBM V4.2

Here is another version:

${lastUserRequest}

I can help improve this into a stronger caption, script, or content idea.

`;



        content.innerHTML =
        reply.replace(/\n/g,"<br>");



        showNotice(
            "🔄 New version created"
        );



    },1000);


}







// =============================
// NOTICE POPUP
// =============================

function showNotice(message){


    const notice =
    document.createElement("div");



    notice.innerText =
    message;



    notice.style.position =
    "fixed";


    notice.style.bottom =
    "90px";


    notice.style.left =
    "50%";


    notice.style.transform =
    "translateX(-50%)";


    notice.style.background =
    "#222";


    notice.style.color =
    "#fff";


    notice.style.padding =
    "12px 20px";


    notice.style.borderRadius =
    "999px";


    notice.style.zIndex =
    "9999";


    notice.style.fontSize =
    "14px";



    document.body.appendChild(notice);



    setTimeout(()=>{


        notice.remove();


    },2000);


}





console.log(
"✅ ChatTBM V4.2 Part 1B Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 2A - MEMORY + CHAT STORAGE
// =====================================



// =============================
// SAVE LAST REQUEST
// =============================

function saveLastRequest(){

    localStorage.setItem(
        "ChatTBM_Last_Request",
        lastUserRequest
    );

}





// =============================
// LOAD LAST REQUEST
// =============================

function loadLastRequest(){

    const saved =
    localStorage.getItem(
        "ChatTBM_Last_Request"
    );


    if(saved){

        lastUserRequest = saved;

    }

}





// =============================
// REMEMBER USER MESSAGE
// =============================

function rememberUserRequest(message){

    lastUserRequest = message;

    saveLastRequest();

}





// =============================
// SAVE CHAT HISTORY
// =============================

function saveChat(){

    if(!chatBox) return;


    localStorage.setItem(

        "ChatTBM_Chat_History",

        chatBox.innerHTML

    );

}





// =============================
// LOAD CHAT HISTORY
// =============================

function loadChat(){

    const saved =
    localStorage.getItem(
        "ChatTBM_Chat_History"
    );



    if(
        saved &&
        chatBox
    ){

        chatBox.innerHTML = saved;


        chatBox.classList.remove(
            "hidden"
        );


        scrollChat();

    }

}





// =============================
// CLEAR CHAT
// =============================

function clearChat(){


    const confirmDelete =
    confirm(
        "Delete ChatTBM conversation?"
    );



    if(!confirmDelete) return;



    if(chatBox){

        chatBox.innerHTML = "";


        chatBox.classList.add(
            "hidden"
        );

    }



    localStorage.removeItem(
        "ChatTBM_Chat_History"
    );



    localStorage.removeItem(
        "ChatTBM_Last_Request"
    );



    lastUserRequest = "";



    showNotice(
        "🗑️ Chat cleared"
    );


}





// =============================
// NEW CHAT BUTTON
// =============================

function createNewChat(){

    clearChat();


    console.log(
        "🆕 New Chat Started"
    );

}





// =============================
// SAVE BEFORE EXIT
// =============================

window.addEventListener(
    "beforeunload",
    ()=>{

        saveChat();

        saveLastRequest();

    }
);







// =============================
// RESTORE DATA
// =============================

loadChat();

loadLastRequest();







console.log(
"✅ ChatTBM V4.2 Part 2A Memory Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 2B - SEND + UPLOAD + VOICE
// =====================================



// =============================
// SEND MESSAGE
// =============================

function sendMessage(){


    if(!input) return;



    const message =
    input.value.trim();



    if(message === "") return;



    rememberUserRequest(message);



    addUserMessage(message);



    input.value = "";



    const loader =
    showThinking();




    setTimeout(()=>{


        if(loader){

            loader.remove();

        }



        const reply = `

🚀 ChatTBM V4.2

I received your request:

"${message}"


I can help you create:

✍️ Viral captions

🎬 Video scripts

📱 Social media posts

🔥 Content ideas

🎯 Marketing plans


API connection can be added later for advanced AI responses.

`;



        addBotMessage(reply);



        saveChat();



    },1200);



}







// =============================
// SEND BUTTON
// =============================

const sendBtn =
document.getElementById(
"send-btn"
);



if(sendBtn){


    sendBtn.addEventListener(
        "click",
        sendMessage
    );


}







// =============================
// ENTER KEY SEND
// =============================

if(input){


    input.addEventListener(
        "keydown",
        (event)=>{


            if(
                event.key === "Enter"
                &&
                !event.shiftKey
            ){


                event.preventDefault();


                sendMessage();


            }


        }
    );


}







// =============================
// FILE UPLOAD
// =============================

const uploadBtn =
document.getElementById(
"upload-btn"
);



const fileInput =
document.getElementById(
"file-input"
);





if(
uploadBtn &&
fileInput
){


    uploadBtn.onclick = ()=>{


        fileInput.click();


    };





    fileInput.onchange = ()=>{


        const file =
        fileInput.files[0];



        if(file){


            addUserMessage(
                "📎 Uploaded file: "
                +
                file.name
            );



            setTimeout(()=>{


                addBotMessage(`

📂 File received.

ChatTBM can process this file after AI API connection is added.

`);


            },700);



        }


    };


}







// =============================
// VOICE INPUT
// =============================

const voiceBtn =
document.getElementById(
"voice-btn"
);





if(
voiceBtn &&
"webkitSpeechRecognition" in window
){


    const recognition =
    new webkitSpeechRecognition();



    recognition.lang =
    "en-US";



    recognition.continuous =
    false;



    recognition.interimResults =
    false;



    voiceBtn.onclick = ()=>{


        recognition.start();



        voiceBtn.innerHTML =
        "🔴";


    };





    recognition.onresult =
    (event)=>{


        const text =
        event.results[0][0].transcript;



        input.value =
        text;



        voiceBtn.innerHTML =
        "🎤";


    };





    recognition.onerror =
    ()=>{


        voiceBtn.innerHTML =
        "🎤";


    };



}

else if(voiceBtn){


    voiceBtn.onclick = ()=>{


        showNotice(
            "🎤 Voice input not supported"
        );


    };


}







console.log(
"✅ ChatTBM V4.2 Part 2B Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 3 - CREATOR TOOLS + VIDEO STUDIO
// =====================================



// =============================
// CREATOR TOOLS
// =============================

function creatorTool(type){


    let request = "";



    switch(type){


        case "ideas":

            request =
            "💡 Create viral content ideas";

        break;



        case "captionTemplates":

            request =
            "✍️ Create viral caption templates";

        break;



        case "hashtags":

            request =
            "#️⃣ Generate trending hashtags";

        break;



        case "hooks":

            request =
            "🎯 Create powerful content hooks";

        break;



        case "cta":

            request =
            "📢 Create a strong call to action";

        break;



        case "bio":

            request =
            "👤 Create a creator bio";

        break;



        case "username":

            request =
            "🔥 Generate username ideas";

        break;



        case "calendar":

            request =
            "📅 Create a content calendar";

        break;



        default:

            request =
            "Create amazing content ideas";

    }



    addUserMessage(request);



    rememberUserRequest(request);



    setTimeout(()=>{


        addBotMessage(`

🚀 ChatTBM Creator Assistant


I will help you with:

${request}


Tell me your niche and target audience,
and I will create something powerful.

`);


        saveChat();


    },700);


}







// =============================
// VIDEO TOOLS
// =============================

function videoTool(type){


    let videoRequest = "";



    switch(type){


        case "create":

            videoRequest =
            "Create an AI video concept";

        break;



        case "script":

            videoRequest =
            "Create a video script";

        break;



        case "image":

            videoRequest =
            "Create an image generation prompt";

        break;



        case "scene":

            videoRequest =
            "Create cinematic video scenes";

        break;



        case "voice":

            videoRequest =
            "Create a voice-over script";

        break;



        case "youtube":

            videoRequest =
            "Create a YouTube script";

        break;



        case "reels":

            videoRequest =
            "Create TikTok/Reels content";

        break;



        default:

            videoRequest =
            "Create video ideas";

    }



    addUserMessage(
        "🎥 " + videoRequest
    );



    rememberUserRequest(
        videoRequest
    );



    setTimeout(()=>{


        addBotMessage(`

🎬 AI Video Studio


Request:

${videoRequest}


ChatTBM will help you create:

• Story ideas
• Scenes
• Scripts
• Prompts
• Hooks
• Voice-over plans


`);

        saveChat();


    },700);


}







// =============================
// CREATOR MODES
// =============================

let activeCreatorMode = "";



function activateCreatorMode(mode){


    activeCreatorMode = mode;



    localStorage.setItem(
        "ChatTBM_Mode",
        mode
    );



    addBotMessage(`

🎨 Creator Mode Activated


${mode}


Your future ideas will follow this style.


What do you want to create?

`);

}





// =============================
// LOAD CREATOR MODE
// =============================

function loadCreatorMode(){


    const saved =
    localStorage.getItem(
        "ChatTBM_Mode"
    );



    if(saved){


        activeCreatorMode = saved;


    }


}





// =============================
// CHAT HISTORY BUTTON
// =============================

function showChatHistory(){


    const history =
    localStorage.getItem(
        "ChatTBM_Chat_History"
    );



    if(history){


        showNotice(
            "📂 Chat history found"
        );


    }

    else{


        showNotice(
            "No chat history yet"
        );


    }


}







loadCreatorMode();



console.log(
"✅ ChatTBM V4.2 Part 3 Creator System Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// PART 4 - STARTUP + FINAL POLISH
// =====================================



// =============================
// FIRST VISIT WELCOME
// =============================

function showWelcome(){


    const visited =
    localStorage.getItem(
        "ChatTBM_Visited"
    );



    if(visited){

        return;

    }



    setTimeout(()=>{


        addBotMessage(`

👋 Welcome to ChatTBM


🚀 Your AI Content Assistant


I can help you create:


✍️ Viral captions

🎬 Video scripts

📱 Social media posts

🔥 Content ideas

🎯 Marketing plans


What are we creating today?


`);



        localStorage.setItem(
            "ChatTBM_Visited",
            "true"
        );


    },800);


}







// =============================
// SYSTEM CHECK
// =============================

function checkChatTBM(){


    console.log(
        "🚀 ChatTBM V4.2 System Check"
    );



    console.log(
        "Chat Box:",
        chatBox
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Input:",
        input
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Send Button:",
        document.getElementById("send-btn")
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Upload:",
        document.getElementById("upload-btn")
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Version:",
        "ChatTBM V4.2"
    );


}







// =============================
// MOBILE APP FEEL
// =============================

document.body.style.webkitTapHighlightColor =
"transparent";







// =============================
// START CHATTBM
// =============================

showWelcome();


checkChatTBM();







console.log(
"🔥 ChatTBM V4.2 FINAL SCRIPT LOADED"
);
