// =====================================
// ChatTBM V4.1
// Part 1A - Modern Message System
// =====================================


// Core Elements

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");



// =============================
// User Message
// =============================


function addUserMessage(message){

    if(!chatBox) return;


    chatBox.classList.remove("hidden");


    chatBox.innerHTML += `

    <div class="flex justify-end mb-5">

        <div class="user-bubble">

            ${message}

        </div>

    </div>

    `;


    chatBox.scrollTop = chatBox.scrollHeight;


    saveChat();

}



// =============================
// AI Message
// =============================


function addBotMessage(message){


    if(!chatBox) return;


    chatBox.classList.remove("hidden");


    const id = "chat_" + Date.now();



    chatBox.innerHTML += `

    <div class="ai-message mb-5" id="${id}">


        <div class="ai-bubble">


            <div class="ai-header">

                🤖 <strong>ChatTBM</strong>

            </div>



            <div class="ai-content">

                ${message.replace(/\n/g,"<br>")}

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



    chatBox.scrollTop = chatBox.scrollHeight;


    saveChat();


}



// =============================
// Loading Message
// =============================


function showThinking(){


    const loader = document.createElement("div");


    loader.className = "ai-message mb-5";



    loader.innerHTML = `

    <div class="ai-bubble">

        <div class="ai-header">

        🤖 <strong>ChatTBM</strong>

        </div>


        <div class="ai-content">

        ⏳ Thinking...

        </div>


    </div>

    `;



    chatBox.appendChild(loader);


    chatBox.scrollTop = chatBox.scrollHeight;


    return loader;


}



console.log("✅ ChatTBM V4.1 Message System Loaded");

// =====================================
// ChatTBM V4.1
// Part 1B - Copy Edit Regenerate System
// =====================================



// =============================
// Copy AI Response
// =============================


function copyResponse(id){


    const box = document.getElementById(id);


    if(!box) return;



    const content = 
    box.querySelector(".ai-content");



    if(!content) return;



    navigator.clipboard.writeText(
        content.innerText
    );



    alert("✅ ChatTBM response copied!");



}





// =============================
// Edit AI Response
// =============================


function editResponse(id){


    const box = document.getElementById(id);


    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;



    const oldText =
    content.innerText;



    const editedText =
    prompt(
        "✏️ Edit ChatTBM response:",
        oldText
    );



    if(
        editedText &&
        editedText.trim() !== ""
    ){


        content.innerHTML =
        editedText.replace(/\n/g,"<br>");



        saveChat();


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
    ⏳ ChatTBM is creating a new version...
    `;



    setTimeout(()=>{


        let request = 
        lastUserRequest ||
        chatMemory?.topic ||
        "Create a new content idea";



        let newReply;



        if(
            typeof generateAIReply === "function"
        ){


            newReply =
            generateAIReply(request);


        }

        else{


            newReply =
            "ChatTBM is ready. Tell me what you want to create.";


        }




        content.innerHTML =
        newReply.replace(/\n/g,"<br>");



        saveChat();



    },1200);



}





// =============================
// Save Helper
// =============================


function saveAfterEdit(){


    if(
        typeof saveChat === "function"
    ){

        saveChat();

    }


}




console.log(
"✅ ChatTBM V4.1 Copy Edit Regenerate Loaded"
);

// =====================================
// ChatTBM V4.1
// Part 2A - Memory + Chat Storage
// =====================================



// =============================
// User Request Memory
// =============================


let lastUserRequest = "";





// =============================
// Save Last Request
// =============================


function saveLastRequest(){


    localStorage.setItem(
        "ChatTBM_Last_Request",
        lastUserRequest
    );


}





// =============================
// Load Last Request
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
// Update User Request
// =============================


function rememberUserRequest(message){


    lastUserRequest = message;


    saveLastRequest();


}





// =============================
// Chat Save System
// =============================


function saveChat(){


    if(!chatBox) return;



    localStorage.setItem(

        "ChatTBM_Chat",

        chatBox.innerHTML

    );


}





// =============================
// Load Previous Chat
// =============================


function loadChat(){



    const saved =

    localStorage.getItem(
        "ChatTBM_Chat"
    );



    if(saved && chatBox){


        chatBox.innerHTML = saved;


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



    if(
        confirm(
        "Clear this conversation?"
        )
    ){


        if(chatBox){

            chatBox.innerHTML = "";

            chatBox.classList.add(
                "hidden"
            );

        }



        localStorage.removeItem(
            "ChatTBM_Chat"
        );



        localStorage.removeItem(
            "ChatTBM_Last_Request"
        );



        lastUserRequest = "";

    }


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





// Load Data When Opened

loadChat();

loadLastRequest();



console.log(
"✅ ChatTBM V4.1 Memory System Loaded"
);

// =====================================
// ChatTBM V4.1
// Part 2B - Input Controls Connection
// =====================================



// =============================
// Main Send Function
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
            "I am ready to help you create content. 🚀";


        }



        addBotMessage(reply);



    },1200);



}







// =============================
// Send Button
// =============================


const sendBtn =
document.getElementById("send-btn");



if(sendBtn){


    sendBtn.addEventListener(
    "click",
    sendMessage
    );


}





// =============================
// Enter Key Send
// =============================


if(input){


    input.addEventListener(
    "keypress",
    function(event){


        if(event.key === "Enter"){


            sendMessage();


        }


    });


}







// =============================
// File Upload System
// =============================


const uploadBtn =
document.getElementById("upload-btn");



const fileInput =
document.getElementById("file-input");




if(uploadBtn && fileInput){


    uploadBtn.addEventListener(
    "click",
    ()=>{


        fileInput.click();


    });


}





if(fileInput){


    fileInput.addEventListener(
    "change",
    function(){



        const file =
        this.files[0];



        if(file){


            addUserMessage(
            "📎 Uploaded file: "
            + file.name
            );



            addBotMessage(
            "I received your file. File analysis will be available when ChatTBM AI connection is activated."
            );


        }



    });


}







// =============================
// Voice Button
// =============================


const voiceBtn =
document.getElementById("voice-btn");



if(
voiceBtn &&
"webkitSpeechRecognition" in window
){



    const recognition =
    new webkitSpeechRecognition();



    recognition.continuous = false;

    recognition.lang = "en-US";




    voiceBtn.addEventListener(
    "click",
    ()=>{


        recognition.start();


        voiceBtn.innerHTML =
        "🔴";


    });





    recognition.onresult =
    function(event){


        const text =
        event.results[0][0].transcript;



        input.value = text;



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


    voiceBtn.addEventListener(
    "click",
    ()=>{


        alert(
        "🎤 Voice input is not supported on this browser yet."
        );


    });


}






console.log(
"✅ ChatTBM V4.1 Controls Connected"
);

// =====================================
// ChatTBM V4.1
// Part 3 - Creator Tools + AI Modes
// =====================================



// =============================
// Creator Tools
// =============================


function creatorTool(tool){



    let promptText = "";



    switch(tool){


        case "captionTemplates":

            promptText =
            "Create a viral caption";

            break;



        case "hashtags":

            promptText =
            "Generate viral hashtags";

            break;



        case "hooks":

            promptText =
            "Create viral hooks";

            break;



        case "cta":

            promptText =
            "Create a strong call to action";

            break;



        case "bio":

            promptText =
            "Create a professional creator bio";

            break;



        case "username":

            promptText =
            "Generate username ideas";

            break;



        case "ideas":

            promptText =
            "Generate viral content ideas";

            break;



        case "calendar":

            promptText =
            "Create a content calendar";

            break;



        default:

            promptText =
            "Help me create content";


    }



    if(input){


        input.value = promptText;


        sendMessage();


    }



}







// =============================
// AI Video Studio
// =============================


function videoTool(tool){



    let request = "";



    switch(tool){



        case "create":

            request =
            "Create a complete AI video script";

            break;



        case "script":

            request =
            "Create a professional video script";

            break;



        case "image":

            request =
            "Create an AI image prompt";

            break;



        case "scene":

            request =
            "Create cinematic scenes";

            break;



        case "voice":

            request =
            "Create a voice-over script";

            break;



        case "youtube":

            request =
            "Create a YouTube video package";

            break;



        case "reels":

            request =
            "Create a TikTok/Reels viral script";

            break;



        default:

            request =
            "Create content";


    }



    if(input){


        input.value = request;


        sendMessage();


    }



}








// =============================
// Creator Modes
// =============================


let activeCreatorMode = "";



function activateCreatorMode(mode){



    activeCreatorMode = mode;



    addBotMessage(

`
🎨 ChatTBM Mode Activated

${mode}

I will now customize your content style for this mode.

Tell me what you want to create.
`

    );



}







// =============================
// Chat History
// =============================


function showChatHistory(){


    const saved =
    localStorage.getItem(
        "ChatTBM_Chat"
    );



    if(saved){


        alert(
        "📂 Previous Chat Found"
        );


    }

    else{


        alert(
        "No chat history yet."
        );


    }


}







// =============================
// Quick Buttons
// =============================


const captionBtn =
document.getElementById("caption-btn");


const videoBtn =
document.getElementById("video-btn");


const postBtn =
document.getElementById("post-btn");





if(captionBtn){


    captionBtn.onclick = ()=>{


        creatorTool(
        "captionTemplates"
        );


    };


}




if(videoBtn){


    videoBtn.onclick = ()=>{


        videoTool(
        "create"
        );


    };


}




if(postBtn){


    postBtn.onclick = ()=>{


        creatorTool(
        "ideas"
        );


    };


}







// =============================
// Final Safety Check
// =============================


function checkChatTBM(){



console.log(
"🚀 ChatTBM V4.1 System Check"
);



console.log(
"AI Engine:",
typeof generateAIReply === "function"
?
"Connected ✅"
:
"Waiting"
);



console.log(
"Memory:",
typeof saveChat === "function"
?
"Active ✅"
:
"Missing"
);



console.log(
"Creator Tools: Active ✅"
);



}



checkChatTBM();





console.log(
"🔥 ChatTBM V4.1 Fully Loaded"
);
