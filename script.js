// =====================================
// ChatTBM V4.2 FINAL
// Part 1A - Core Chat System
// =====================================


// =============================
// Core Elements
// =============================

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

let lastUserRequest = "";




// =============================
// Get Time
// =============================

function getTime(){

    return new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

}




// =============================
// User Message Bubble
// =============================

function addUserMessage(message){


    if(!chatBox) return;



    chatBox.classList.remove("hidden");



    lastUserRequest = message;



    chatBox.innerHTML += `

    <div class="flex justify-end mb-5">

        <div class="user-bubble">

            ${message.replace(/\n/g,"<br>")}


            <div style="
            font-size:11px;
            opacity:.6;
            margin-top:5px;
            text-align:right;
            ">

            ${getTime()}

            </div>


        </div>


    </div>

    `;



    chatBox.scrollTop =
    chatBox.scrollHeight;



    saveLastRequest();

    saveChat();


}





// =============================
// AI Message Bubble
// =============================

function addBotMessage(message){


    if(!chatBox) return;



    chatBox.classList.remove("hidden");



    const id =
    "chat_" + Date.now();




    chatBox.innerHTML += `


    <div class="ai-message mb-5" id="${id}">


        <div class="ai-bubble">


            <div class="ai-header">

            🤖 <strong>ChatTBM</strong>

            </div>



            <div class="ai-content">

            ${message.replace(/\n/g,"<br>")}

            </div>



            <div class="ai-time">

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



    chatBox.scrollTop =
    chatBox.scrollHeight;



    saveChat();


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

        🤖 <strong>ChatTBM</strong>

        </div>


        <div class="ai-content">

        Thinking<span class="dots">...</span>

        </div>


    </div>


    `;



    chatBox.appendChild(loader);



    chatBox.scrollTop =
    chatBox.scrollHeight;



    return loader;


}




console.log(
"✅ ChatTBM V4.2 Part 1A Loaded"
);

// =====================================
// ChatTBM V4.2 FINAL
// Part 1B - Copy Edit Regenerate System
// =====================================


// =============================
// Copy AI Response
// =============================

function copyResponse(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    const text =
    content.innerText;



    navigator.clipboard.writeText(text)
    .then(()=>{


        showNotice(
        "📋 Response copied"
        );


    })
    .catch(()=>{


        showNotice(
        "Copy failed"
        );


    });


}





// =============================
// Edit AI Response
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
// Regenerate AI Response
// =============================

function regenerateResponse(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;




    content.innerHTML =

    `
    ⏳ Creating a new version...
    `;



    setTimeout(()=>{


        let request =
        lastUserRequest ||
        "Create a viral content idea";



        let newReply;



        if(
        typeof generateAIReply === "function"
        ){


            newReply =
            generateAIReply(request);


        }

        else{


            newReply =

            `
            🚀 ChatTBM V4.2

            Here is another creative version:

            ${request}

            `;


        }




        content.innerHTML =
        newReply.replace(/\n/g,"<br>");



        saveChat();



        showNotice(
        "🔄 Response regenerated"
        );



    },1200);



}





// =============================
// Notification Popup
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
// ChatTBM V4.2 FINAL
// Part 2A - Memory + Chat History System
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
// Remember User Message
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
// New Chat
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


});






// =============================
// Restore Data On Start
// =============================

loadChat();

loadLastRequest();





console.log(
"✅ ChatTBM V4.2 Part 2A Memory Loaded"
);

// =====================================
// ChatTBM V4.2 FINAL
// Part 2B - Smart Send + Upload + Voice
// =====================================



// =============================
// Send Message System
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
🚀 ChatTBM V4.2 is ready.

Your AI engine is waiting for API connection.

For now, I can help you create:

✍️ Captions
🎬 Scripts
🔥 Viral ideas
📱 Social content

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
// Enter Key Support
// =============================

if(input){


    input.addEventListener(
    "keydown",
    function(event){


        if(
        event.key === "Enter" &&
        !event.shiftKey
        ){


            event.preventDefault();


            sendMessage();


        }


    });


}







// =============================
// File Upload System
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
            "📎 Uploaded file: " + file.name
            );



            addBotMessage(

`
📂 File received.

ChatTBM can process files after AI API connection is activated.

`

            );


        }


    };


}







// =============================
// Voice Input System
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



    voiceBtn.onclick = ()=>{


        recognition.start();



        voiceBtn.innerHTML =
        "🔴";


    };





    recognition.onresult =
    function(event){


        const text =
        event.results[0][0].transcript;



        input.value =
        text;



        voiceBtn.innerHTML =
        "🎤";


    };





    recognition.onerror =
    function(){


        voiceBtn.innerHTML =
        "🎤";


    };


}



else if(voiceBtn){


    voiceBtn.onclick = ()=>{


        showNotice(
        "🎤 Voice input is not supported on this browser"
        );


    };


}







console.log(
"✅ ChatTBM V4.2 Part 2B Loaded"
);

// =====================================
// ChatTBM V4.2 FINAL
// Part 3 - App Feel Upgrade
// Typing Effect + Smooth Experience
// =====================================



// =============================
// AI Typing Effect
// =============================

function typeAIResponse(element, text){


    let index = 0;



    element.innerHTML = "";



    const cleanText =
    text;



    const typing =
    setInterval(()=>{


        element.textContent +=
        cleanText.charAt(index);



        index++;



        if(index >= cleanText.length){


            clearInterval(typing);



            element.innerHTML =
            cleanText.replace(
            /\n/g,
            "<br>"
            );



            saveChat();


        }


    },15);



}







// =============================
// Smooth Chat Scroll
// =============================

function smoothChatScroll(){


    if(!chatBox) return;



    chatBox.scrollTo({

        top:chatBox.scrollHeight,

        behavior:"smooth"

    });


}







// =============================
// Button Press Animation
// =============================

document
.querySelectorAll(
".action-btn,.ai-btn,.icon-btn"
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



    });


});







// =============================
// Input Focus Effect
// =============================

const inputArea =
document.getElementById(
"user-input"
);



if(inputArea){


    inputArea.addEventListener(
    "focus",
    ()=>{


        inputArea.parentElement.style.border =
        "1px solid #2563eb";


    });





    inputArea.addEventListener(
    "blur",
    ()=>{


        inputArea.parentElement.style.border =
        "";


    });



}







// =============================
// Mobile App Feel
// =============================

document.body.style.webkitTapHighlightColor =
"transparent";







// =============================
// Online Status
// =============================

function showOnlineStatus(){


    console.log(
    "🟢 ChatTBM Online"
    );


}







// =============================
// Chat Visibility Check
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

showOnlineStatus();







console.log(
"✨ ChatTBM V4.2 Part 3 App Feel Loaded"
);

// =====================================
// ChatTBM V4.2 FINAL
// Part 4 - Final Polish
// Welcome + Startup + Final Checks
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


        addBotMessage(

`
👋 Welcome to ChatTBM

🚀 Your AI Content Assistant

I can help you create:

✍️ Viral captions

🎬 Video scripts

📱 Social media posts

🔥 Content ideas

🎯 Marketing strategies


What are we creating today?
`

        );



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



    addBotMessage(

`
🎨 Creator Mode Activated

${mode}


I will customize your content style for this mode.

Tell me what you want to create.
`

    );


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
// Chat History Check
// =============================

function showChatHistory(){


    const history =
    localStorage.getItem(
    "ChatTBM_Chat_History"
    );



    if(history){


        showNotice(
        "📂 Previous chat history available"
        );


    }

    else{


        showNotice(
        "No chat history yet"
        );


    }


}







// =============================
// Final System Check
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

    "AI Generator:",

    typeof generateAIReply === "function"

    ?
    "Connected ✅"

    :
    "Waiting for API"

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
// Start ChatTBM App
// =============================

loadCreatorMode();

showWelcome();

checkChatTBM();






console.log(
"🔥 ChatTBM V4.2 FINAL POLISH COMPLETE"
);
