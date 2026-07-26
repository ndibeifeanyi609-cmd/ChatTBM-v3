// =====================================
// ChatTBM V4.2
// Part 1A - Core AI Chat System
// =====================================


// =============================
// Core Elements
// =============================

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");


// Memory

let lastUserRequest = "";




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

            ${message}

            <div style="
            font-size:11px;
            opacity:.7;
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


    saveChat();

    saveLastRequest();

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


            <button
            class="ai-btn"
            onclick="copyResponse('${id}')">

            📋 Copy

            </button>



            <button
            class="ai-btn"
            onclick="editResponse('${id}')">

            ✏️ Edit

            </button>



            <button
            class="ai-btn"
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
// Time Display
// =============================

function getTime(){

    return new Date()
    .toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

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

        <span class="thinking">

        Thinking<span class="dots">...</span>

        </span>


        </div>


    </div>


    `;



    chatBox.appendChild(loader);



    chatBox.scrollTop =
    chatBox.scrollHeight;



    return loader;


}



console.log(
"✅ ChatTBM V4.2 Core System Loaded"
);

// =====================================
// ChatTBM V4.2
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



    // Modern copy

    if(
        navigator.clipboard &&
        window.isSecureContext
    ){


        navigator.clipboard.writeText(text);


    }

    else{


        const temp =
        document.createElement("textarea");


        temp.value = text;


        document.body.appendChild(temp);


        temp.select();


        document.execCommand("copy");


        temp.remove();


    }



    showNotice(
    "📋 Response copied"
    );


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
// Regenerate Response
// =============================

function regenerateResponse(id){



    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    content.innerHTML = `

    ⏳ Creating a better version...

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

            Here is a fresh version for:

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
// App Notification
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


    document.body.appendChild(notice);



    setTimeout(()=>{


        notice.remove();


    },2000);


}




console.log(
"✅ ChatTBM V4.2 Copy Edit Regenerate Loaded"
);

// =====================================
// ChatTBM V4.2
// Part 2A - Memory + Chat Storage Upgrade
// =====================================


// =============================
// User Memory
// =============================

let lastUserRequest = "";

let activeCreatorMode = "";




// =============================
// Remember User Request
// =============================

function rememberUserRequest(message){


    lastUserRequest = message;


    localStorage.setItem(

        "ChatTBM_Last_Request",

        lastUserRequest

    );


}





// =============================
// Load User Memory
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
// Clear Conversation
// =============================

function clearChat(){



    const confirmClear =
    confirm(
    "Delete ChatTBM conversation?"
    );



    if(!confirmClear) return;



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
// New Chat Button
// =============================

function createNewChat(){


    clearChat();



    console.log(
    "🆕 New Chat Started"
    );


}





// =============================
// Save Before Closing
// =============================

window.addEventListener(

"beforeunload",

()=>{


    saveChat();


    localStorage.setItem(

    "ChatTBM_Last_Request",

    lastUserRequest

    );


}

);





// =============================
// Restore Data
// =============================

loadChat();

loadLastRequest();





console.log(
"✅ ChatTBM V4.2 Memory System Loaded"
);

// =====================================
// ChatTBM V4.2
// Part 2B - Smart Send System Upgrade
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

            For now, I can help you design content workflows.
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


        if(event.key === "Enter"){


            sendMessage();


        }


    });


}







// =============================
// Better Thinking Animation
// =============================


function showThinking(){


    if(!chatBox) return;




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

        <span class="thinking">

        Thinking<span class="dots">...</span>

        </span>


        </div>


    </div>

    `;




    chatBox.appendChild(loader);



    chatBox.scrollTop =
    chatBox.scrollHeight;



    return loader;


}







// =============================
// Small App Notification
// =============================


function showNotice(text){


    const notice =
    document.createElement("div");



    notice.className =
    "fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 px-5 py-3 rounded-full text-sm";



    notice.innerText =
    text;



    document.body.appendChild(
    notice
    );



    setTimeout(()=>{


        notice.remove();


    },2000);



}







// =============================
// File Upload Upgrade
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
        "📎 Uploaded: " + file.name
        );



        addBotMessage(

        "📂 File received. File analysis will activate after ChatTBM API connection."

        );


    }



};



}







console.log(
"✅ ChatTBM V4.2 Send System Loaded"
);

// =====================================
// ChatTBM V4.2
// Part 3 - App Feel Upgrade
// Typing Effect + Smooth AI Experience
// =====================================



// =============================
// AI Typing Effect
// =============================


function typeAIResponse(element, text){


    let index = 0;



    element.innerHTML = "";



    const timer = setInterval(()=>{


        element.innerHTML +=
        text.charAt(index);



        index++;



        if(index >= text.length){


            clearInterval(timer);



            element.innerHTML =
            text.replace(/\n/g,"<br>");



            saveChat();


        }



    },15);



}







// =============================
// Upgrade AI Message Animation
// =============================


function addBotMessage(message){


    if(!chatBox) return;



    chatBox.classList.remove(
    "hidden"
    );



    const id =
    "chat_" + Date.now();




    chatBox.innerHTML += `

    <div class="ai-message mb-5" id="${id}">


        <div class="ai-bubble">


            <div class="ai-header">

            🤖 <strong>ChatTBM</strong>

            </div>



            <div class="ai-content">

            </div>



            <div class="ai-actions">


                <button 
                class="ai-btn"
                onclick="copyResponse('${id}')">

                📋 Copy

                </button>




                <button
                class="ai-btn"
                onclick="editResponse('${id}')">

                ✏️ Edit

                </button>




                <button
                class="ai-btn"
                onclick="regenerateResponse('${id}')">

                🔄 Regenerate

                </button>


            </div>


        </div>


    </div>

    `;




    const box =
    document.getElementById(id);



    const content =
    box.querySelector(
    ".ai-content"
    );



    typeAIResponse(
    content,
    message
    );




    chatBox.scrollTop =
    chatBox.scrollHeight;



}







// =============================
// Button Press Animation
// =============================


document.querySelectorAll(
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
// Auto Hide Empty Chat Space
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







// =============================
// Mobile App Feel
// =============================


document.body.style.webkitTapHighlightColor =
"transparent";



console.log(
"✨ ChatTBM V4.2 App Feel Loaded"
);

// =====================================
// ChatTBM V4.2
// Part 4 - Final Polish
// Mobile App Feel + Better UX
// =====================================



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
// Improve User Message Display
// =============================


function addUserMessage(message){


    if(!chatBox) return;



    chatBox.classList.remove(
    "hidden"
    );



    chatBox.innerHTML += `


    <div class="flex justify-end mb-5">


        <div class="user-bubble">


            ${message.replace(/\n/g,"<br>")}


        </div>


    </div>


    `;



    smoothChatScroll();



    saveChat();



}







// =============================
// Enter Key Mobile Friendly
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
// Welcome Message
// =============================


function showWelcome(){



    if(
    localStorage.getItem(
    "ChatTBM_Visited"
    )
    ){

        return;

    }




    setTimeout(()=>{


        addBotMessage(

`
👋 Welcome to ChatTBM

Your AI Content Assistant 🚀

I can help you create:

✍️ Viral captions
🎬 Video scripts
📱 Social media ideas
🔥 Content strategies

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
// Input Focus Effect
// =============================


const inputArea =
document.querySelector(
"#user-input"
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
    "none";



});


}







// =============================
// Online Status
// =============================


function showOnlineStatus(){



console.log(
"🟢 ChatTBM Online"
);



}





// =============================
// Start App
// =============================


showWelcome();

showOnlineStatus();




console.log(
"🚀 ChatTBM V4.2 Final Polish Loaded"
);
