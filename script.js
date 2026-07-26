// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 1A - Core Chat System
// =====================================


const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

let lastUserRequest = "";



// =============================
// Time
// =============================

function getTime(){

    return new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

}





// =============================
// Smooth Scroll
// =============================

function smoothChatScroll(){

    if(!chatBox) return;


    chatBox.scrollTo({

        top: chatBox.scrollHeight,

        behavior:"smooth"

    });

}





// =============================
// Add User Message
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


    saveChat();

    saveLastRequest();


    smoothChatScroll();

}





// =============================
// Add AI Message
// =============================

function addBotMessage(message){

    if(!chatBox) return;



    chatBox.classList.remove("hidden");



    const id =
    "ai_" + Date.now();



    chatBox.innerHTML += `

    <div class="ai-message mb-5" id="${id}">


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



            <div class="ai-actions">


                <button class="ai-btn"
                onclick="copyResponse('${id}')">

                📋 Copy

                </button>



                <button class="ai-btn"
                onclick="editResponse('${id}')">

                ✏️ Edit

                </button>



                <button class="ai-btn"
                onclick="regenerateResponse('${id}')">

                🔄 Regenerate

                </button>


            </div>


        </div>


    </div>

    `;



    saveChat();


    smoothChatScroll();

}





// =============================
// Thinking Animation
// =============================

function showThinking(){

    if(!chatBox) return null;



    const loader =
    document.createElement("div");



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


    smoothChatScroll();


    return loader;

}





console.log(
"✅ ChatTBM V4.2 Part 1A Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 1B - Response Actions
// =====================================



// =============================
// Copy Response
// =============================

function copyResponse(id){

    const box =
    document.getElementById(id);


    if(!box) return;



    const content =
    box.querySelector(".ai-content");


    if(!content) return;



    navigator.clipboard.writeText(
        content.innerText
    )
    .then(()=>{

        showNotice(
            "📋 Response copied"
        );

    })
    .catch(()=>{

        showNotice(
            "❌ Copy failed"
        );

    });

}





// =============================
// Edit Response
// =============================

function editResponse(id){

    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    const oldText =
    content.innerText;



    const edited =
    prompt(
        "✏️ Edit ChatTBM response:",
        oldText
    );



    if(
        edited &&
        edited.trim() !== ""
    ){

        content.innerHTML =
        edited.replace(/\n/g,"<br>");



        saveChat();



        showNotice(
            "✅ Response updated"
        );

    }

}





// =============================
// Regenerate Response
// =============================

function regenerateResponse(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    content.innerHTML =
    "⏳ Creating new version...";



    setTimeout(()=>{


        let reply;



        if(
            typeof generateAIReply === "function"
        ){

            reply =
            generateAIReply(
                lastUserRequest
            );


        }

        else{


            reply = `

🚀 ChatTBM V4.2

Here is another creative version:

${lastUserRequest}

`;

        }



        content.innerHTML =
        reply.replace(/\n/g,"<br>");



        saveChat();



        showNotice(
            "🔄 Response regenerated"
        );



    },1000);


}





// =============================
// Notification
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
    "white";


    notice.style.padding =
    "12px 20px";


    notice.style.borderRadius =
    "999px";


    notice.style.zIndex =
    "9999";


    notice.style.fontSize =
    "14px";



    document.body.appendChild(
        notice
    );



    setTimeout(()=>{

        notice.remove();

    },2000);


}





console.log(
"✅ ChatTBM V4.2 Part 1B Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 2A - Memory + Chat Storage
// =====================================



// =============================
// Save Last User Request
// =============================

function saveLastRequest(){

    localStorage.setItem(
        "ChatTBM_Last_Request",
        lastUserRequest
    );

}





// =============================
// Load Last User Request
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
// Remember User Request
// =============================

function rememberUserRequest(message){

    lastUserRequest = message;

    saveLastRequest();

}





// =============================
// Save Chat History
// =============================

function saveChat(){

    if(!chatBox) return;


    localStorage.setItem(
        "ChatTBM_Chat_History",
        chatBox.innerHTML
    );

}





// =============================
// Load Chat History
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

        chatBox.innerHTML =
        saved;


        chatBox.classList.remove(
            "hidden"
        );


        chatBox.scrollTop =
        chatBox.scrollHeight;

    }

}





// =============================
// Clear Chat
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
// Create New Chat
// =============================

function createNewChat(){

    clearChat();


    console.log(
        "🆕 New Chat Started"
    );

}





// =============================
// Save Before Leaving
// =============================

window.addEventListener(
    "beforeunload",
    ()=>{

        saveChat();

        saveLastRequest();

    }
);






// =============================
// Restore Data On Start
// =============================

loadChat();

loadLastRequest();






console.log(
"✅ ChatTBM V4.2 Part 2A Memory Loaded"
);

 // =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 2B - Smart Send + Upload + Voice
// =====================================



// =============================
// Send Message
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



        let reply;



        if(
            typeof generateAIReply === "function"
        ){


            reply =
            generateAIReply(message);


        }

        else{


            reply =

`
🚀 ChatTBM V4.2

Your AI engine is ready for API connection.

I can help you create:

✍️ Viral captions

🎬 Video scripts

📱 Social media posts

🔥 Content ideas

🎯 Marketing plans

`;

        }



        addBotMessage(reply);



    },1200);



}






// =============================
// Send Button
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
// Enter Key
// =============================

if(input){


    input.addEventListener(
        "keydown",
        function(event){


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
// Upload System
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



            addBotMessage(

`
📂 File received.

ChatTBM will analyze files after AI API connection is added.

`

            );


        }


    };


}






// =============================
// Voice Input
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
// Part 3 - App Feel Upgrade
// Smooth Mobile Experience
// =====================================



// =============================
// Typing Effect
// =============================

function typeAIResponse(element, text){

    if(!element) return;


    let index = 0;


    element.innerHTML = "";


    const typing = setInterval(()=>{


        element.textContent +=
        text.charAt(index);


        index++;


        if(index >= text.length){


            clearInterval(typing);


            element.innerHTML =
            text.replace(
                /\n/g,
                "<br>"
            );


            saveChat();


        }


    },20);


}





// =============================
// Smooth Chat Scroll
// =============================

function smoothChatScroll(){


    if(!chatBox) return;



    chatBox.scrollTo({

        top: chatBox.scrollHeight,

        behavior:"smooth"

    });


}





// =============================
// Button Animation
// =============================

document
.querySelectorAll(
    ".action-btn, .ai-btn, .icon-btn"
)
.forEach(button=>{


    button.addEventListener(
        "click",
        ()=>{


            button.style.transform =
            "scale(.96)";


            setTimeout(()=>{


                button.style.transform =
                "";


            },120);


        }
    );


});






// =============================
// Input Focus Effect
// =============================

const inputBox =
document.getElementById(
    "user-input"
);



if(inputBox){


    inputBox.addEventListener(
        "focus",
        ()=>{


            const parent =
            inputBox.parentElement;


            if(parent){

                parent.style.border =
                "1px solid #2563eb";

            }


        }
    );





    inputBox.addEventListener(
        "blur",
        ()=>{


            const parent =
            inputBox.parentElement;


            if(parent){

                parent.style.border =
                "";

            }


        }
    );


}







// =============================
// Mobile App Feel
// =============================

document.body.style.webkitTapHighlightColor =
"transparent";






// =============================
// Check Chat Visibility
// =============================

function checkChatVisibility(){


    if(
        chatBox &&
        chatBox.innerHTML.trim() !== ""
    ){


        chatBox.classList.remove(
            "hidden"
        );


    }


}





checkChatVisibility();






console.log(
"✨ ChatTBM V4.2 Part 3 App Experience Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 4 - Final Polish
// Welcome + Creator Mode + Startup Checks
// =====================================



// =============================
// Welcome Message
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

🎯 Marketing strategies


What are we creating today?

        `);



        localStorage.setItem(
            "ChatTBM_Visited",
            "true"
        );


    },800);


}







// =============================
// Creator Mode Memory
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


ChatTBM will customize your ideas for this style.

Tell me what you want to create.

    `);


}







// =============================
// Load Creator Mode
// =============================

function loadCreatorMode(){


    const savedMode =
    localStorage.getItem(
        "ChatTBM_Mode"
    );



    if(savedMode){


        activeCreatorMode =
        savedMode;


    }


}







// =============================
// Chat History Button
// =============================

function showChatHistory(){


    const history =
    localStorage.getItem(
        "ChatTBM_Chat_History"
    );



    if(history){


        showNotice(
            "📂 Previous chat history found"
        );


    }

    else{


        showNotice(
            "No chat history yet"
        );


    }


}







// =============================
// Creator Tools Backup
// =============================

function creatorTool(type){


    let message = "";



    switch(type){


        case "ideas":

        message =
        "💡 Give me viral content ideas";

        break;



        case "captionTemplates":

        message =
        "✍️ Create viral caption templates";

        break;



        case "hashtags":

        message =
        "#️⃣ Generate trending hashtags";

        break;



        case "hooks":

        message =
        "🎯 Create powerful content hooks";

        break;



        case "cta":

        message =
        "📢 Create a strong call to action";

        break;



        case "bio":

        message =
        "👤 Create a creator bio";

        break;



        case "username":

        message =
        "🔥 Generate username ideas";

        break;



        case "calendar":

        message =
        "📅 Create a content calendar";

        break;



        default:

        message =
        "Create something amazing";


    }



    addUserMessage(message);



    setTimeout(()=>{


        addBotMessage(

        "🚀 ChatTBM is preparing your creator idea..."

        );


    },700);



}







// =============================
// Video Tools Backup
// =============================

function videoTool(type){


    addUserMessage(
        "🎥 Create " + type + " content"
    );



    setTimeout(()=>{


        addBotMessage(

        `
🎬 Video Studio Activated

I will help you create:

• Video ideas
• Scripts
• Scenes
• Prompts
• Voice-over concepts

        `

        );


    },700);



}







// =============================
// System Check
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
        "Memory:",
        typeof saveChat === "function"
        ?
        "Active ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Version:",
        "ChatTBM V4.2"
    );


}







// =============================
// Start App
// =============================

loadCreatorMode();


showWelcome();


checkChatTBM();






console.log(
"🔥 ChatTBM V4.2 FINAL POLISH LOADED"
);
