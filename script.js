// =====================================
// ChatTBM V4.4
// Part 1A - Core System + AI Configuration
// =====================================


// =============================
// CONNECT HTML ELEMENTS
// =============================

const chatBox = document.getElementById("chat-box");

const userInput = document.getElementById("user-input");

const sendButton = document.getElementById("send-btn");

const uploadButton = document.getElementById("upload-btn");

const fileInput = document.getElementById("file-input");

const voiceButton = document.getElementById("voice-btn");




// =============================
// CHAT MEMORY
// =============================

let lastUserMessage = "";

let activeCreatorMode = "";




// =============================
// AI CONFIGURATION
// API READY STRUCTURE
// =============================

const AI_CONFIG = {

    mode:"demo",

    apiConnected:false,

    apiKey:"",

    model:"ChatTBM Engine"

};




// =============================
// TIME FUNCTION
// =============================

function getTime(){

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

        top:chatBox.scrollHeight,

        behavior:"smooth"

    });

}





// =============================
// SHOW NOTIFICATION
// =============================

function showNotice(message){


    const notice =
    document.createElement("div");



    notice.innerText = message;



    notice.style.position="fixed";

    notice.style.bottom="90px";

    notice.style.left="50%";

    notice.style.transform="translateX(-50%)";

    notice.style.background="#222";

    notice.style.color="#fff";

    notice.style.padding="12px 20px";

    notice.style.borderRadius="999px";

    notice.style.zIndex="9999";

    notice.style.fontSize="14px";



    document.body.appendChild(notice);



    setTimeout(()=>{

        notice.remove();

    },2000);


}





// =============================
// BASIC AI ENGINE
// API WILL REPLACE THIS LATER
// =============================

function generateAIReply(message){


    const text =
    message.toLowerCase();



    if(text.includes("caption")){


        return `

✍️ Viral Caption Idea:

"Your dream is waiting for your action.
Start today. Build tomorrow. 🚀"


Style:
Motivational + Creator focused

`;

    }




    if(text.includes("video")){


        return `

🎬 Video Script Idea:


HOOK:

"Nobody expected this result..."


SCENE 1:

Show the challenge.


SCENE 2:

Show the process.


SCENE 3:

Show the transformation.


ENDING:

Follow for more ideas 🚀

`;

    }





    if(text.includes("marketing")){


        return `

📢 Marketing Idea:


Problem → Solution → Result


Create a post that shows:

✅ The customer's problem

✅ Your solution

✅ Why they should choose you


`;

    }





    return `

🚀 ChatTBM V4.4


I can help you create:


✍️ Captions

🎬 Video scripts

📱 Social media posts

🔥 Viral ideas

📢 Marketing content


Creator Mode:

${activeCreatorMode || "General Creator Mode"}

`;

}





console.log(
"✅ ChatTBM V4.4 Part 1A Loaded"
);

// =====================================
// ChatTBM V4.4
// Part 1B - Chat Messages + Typing Animation
// =====================================


// =============================
// ADD USER MESSAGE
// =============================

function addUserMessage(message){


    if(!chatBox) return;



    lastUserMessage = message;



    chatBox.classList.remove("hidden");



    const div =
    document.createElement("div");



    div.className =
    "flex justify-end mb-5";



    div.innerHTML = `

    <div class="user-bubble">

        ${message.replace(/\n/g,"<br>")}


        <div class="message-time">

        ${getTime()}

        </div>


    </div>

    `;



    chatBox.appendChild(div);



    scrollChat();



}





// =============================
// ADD AI MESSAGE
// WITH TYPING EFFECT
// =============================

function addBotMessage(message){


    if(!chatBox) return;



    chatBox.classList.remove("hidden");



    const id =
    "ai_" + Date.now();



    const div =
    document.createElement("div");



    div.className =
    "ai-message mb-5";



    div.id = id;



    div.innerHTML = `


    <div class="ai-bubble">


        <div class="ai-header">

        🤖 ChatTBM

        </div>



        <div class="ai-content">

        </div>



        <div class="message-time">

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


    `;



    chatBox.appendChild(div);



    const content =
    div.querySelector(".ai-content");



    typeAIResponse(
        content,
        message
    );



}





// =============================
// AI TYPING EFFECT
// =============================

function typeAIResponse(element,text){


    if(!element) return;



    let index = 0;



    element.innerHTML = "";



    const typing =
    setInterval(()=>{


        element.innerHTML +=
        text.charAt(index);



        index++;



        scrollChat();



        if(index >= text.length){


            clearInterval(typing);



            element.innerHTML =
            text.replace(
                /\n/g,
                "<br>"
            );


        }



    },25);



}





// =============================
// THINKING MESSAGE
// =============================

function showThinking(){


    if(!chatBox) return null;



    const div =
    document.createElement("div");



    div.className =
    "ai-message mb-5";



    div.innerHTML = `


    <div class="ai-bubble">


        <div class="ai-header">

        🤖 ChatTBM

        </div>



        <div class="ai-content thinking">

        Thinking...

        </div>



    </div>


    `;



    chatBox.appendChild(div);



    scrollChat();



    return div;


}





console.log(
"✅ ChatTBM V4.4 Part 1B Loaded"
);

// =====================================
// ChatTBM V4.4
// Part 2A - Send + Upload + Voice System
// =====================================


// =============================
// SEND MESSAGE
// =============================

function sendMessage(){


    if(!userInput) return;



    const message =
    userInput.value.trim();



    if(message === "") return;



    addUserMessage(message);



    userInput.value = "";



    const loader =
    showThinking();



    setTimeout(()=>{


        if(loader){

            loader.remove();

        }



        askChatTBM(message)
.then(reply=>{

    addBotMessage(reply);

})
.catch(error=>{


    addBotMessage(

    "❌ ChatTBM AI connection error."

    );


    console.error(error);


});



        addBotMessage(reply);



    },1000);



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
// ENTER KEY SEND
// =============================

if(userInput){


    userInput.addEventListener(

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
// FILE UPLOAD
// =============================

if(
uploadButton &&
fileInput
){



    uploadButton.addEventListener(

        "click",

        ()=>{

            fileInput.click();

        }

    );





    fileInput.addEventListener(

        "change",

        ()=>{


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


ChatTBM is ready to analyze files after AI API connection is added.

`);

                },700);



            }



        }


    );



}








// =============================
// VOICE INPUT
// =============================

if(
voiceButton &&
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




    voiceButton.addEventListener(

        "click",

        ()=>{


            recognition.start();


            voiceButton.innerHTML =
            "🔴";


        }


    );





    recognition.onresult =

    function(event){



        const text =
        event.results[0][0].transcript;



        userInput.value =
        text;



        voiceButton.innerHTML =
        "🎤";


    };





    recognition.onerror =

    function(){


        voiceButton.innerHTML =
        "🎤";


    };



}

else if(voiceButton){



    voiceButton.addEventListener(

        "click",

        ()=>{


            showNotice(
            "🎤 Voice is not supported here"
            );


        }


    );



}





console.log(
"✅ ChatTBM V4.4 Part 2A Loaded"
);

// =====================================
// ChatTBM V4.4
// Part 2B - Smart Response Actions
// =====================================


// =============================
// COPY RESPONSE
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

    );



    showNotice(
        "📋 Copied ✅"
    );


}







// =============================
// EDIT RESPONSE
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



    content.innerHTML = `


    <textarea

    class="edit-box"

    style="

    width:100%;

    min-height:120px;

    background:#222;

    color:white;

    border:1px solid #444;

    border-radius:15px;

    padding:12px;

    resize:vertical;

    "

    >${oldText}</textarea>



    <button

    class="ai-btn"

    onclick="saveEdit('${id}')"

    >

    💾 Save Edit

    </button>


    `;



}







// =============================
// SAVE EDIT
// =============================

function saveEdit(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const textarea =
    box.querySelector("textarea");



    const content =
    box.querySelector(".ai-content");



    if(
        !textarea ||
        !content
    ) return;



    content.innerHTML =

    textarea.value.replace(
        /\n/g,
        "<br>"
    );



    saveChat();



    showNotice(
        "✅ Edited"
    );


}







// =============================
// REGENERATE RESPONSE
// =============================

function regenerateResponse(id){



    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(".ai-content");



    if(!content) return;




    content.innerHTML =

    "⏳ Creating a new version...";





    setTimeout(()=>{


        const newReply =

        generateAIReply(

            lastUserMessage +

            " create another version"

        );



        content.innerHTML =

        newReply.replace(
            /\n/g,
            "<br>"
        );



        saveChat();



        showNotice(
            "🔄 Regenerated"
        );



    },1200);



}







console.log(
"✅ ChatTBM V4.4 Part 2B Loaded"
);

// =====================================
// ChatTBM V4.4
// Part 3 - Creator Tools + Video Studio + Modes
// =====================================


// =============================
// CREATOR TOOLS
// =============================

function creatorTool(type){


    let request = "";



    switch(type){


        case "ideas":

            request =
            "Create viral content ideas";

        break;



        case "captionTemplates":

            request =
            "Create caption templates";

        break;



        case "hashtags":

            request =
            "Generate trending hashtags";

        break;



        case "hooks":

            request =
            "Create powerful content hooks";

        break;



        case "cta":

            request =
            "Create marketing call to action";

        break;



        case "bio":

            request =
            "Create creator bio";

        break;



        case "username":

            request =
            "Generate username ideas";

        break;



        case "calendar":

            request =
            "Create content calendar";

        break;



        default:

            request =
            "Create amazing content";

    }





    addUserMessage(request);



    setTimeout(()=>{


        addBotMessage(`


🚀 ChatTBM Creator Assistant


${request}


I will help you create:


✍️ Better ideas

🔥 Viral hooks

📱 Social media content

🎯 Audience-focused posts


Tell me your niche and target audience.


`);


    },700);



}







// =============================
// VIDEO TOOLS
// =============================

function videoTool(type){


    let request = "";



    switch(type){


        case "create":

            request =
            "Create AI video concept";

        break;



        case "script":

            request =
            "Create video script";

        break;



        case "image":

            request =
            "Create image generation prompt";

        break;



        case "scene":

            request =
            "Create cinematic scenes";

        break;



        case "voice":

            request =
            "Create voice-over script";

        break;



        case "youtube":

            request =
            "Create YouTube script";

        break;



        case "reels":

            request =
            "Create TikTok/Reels script";

        break;



        default:

            request =
            "Create video content";

    }





    addUserMessage(
        "🎥 " + request
    );




    setTimeout(()=>{


        addBotMessage(`


🎬 AI Video Studio


${request}



Structure:


🔥 Hook (first 3 seconds)


🎥 Main scenes


🎙️ Voice-over


🚀 Ending CTA



`);


    },700);



}







// =============================
// CREATOR MODES
// =============================

function activateCreatorMode(mode){



    activeCreatorMode = mode;



    localStorage.setItem(

        "ChatTBM_Mode",

        mode

    );



    addBotMessage(`


🎨 Creator Mode Activated


${mode}



ChatTBM will now customize ideas for this style.



What are we creating today?


`);



}







// =============================
// LOAD CREATOR MODE
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







console.log(
"✅ ChatTBM V4.4 Part 3 Loaded"
);

// =====================================
// ChatTBM V4.4
// Part 4 - Memory + History + Startup
// =====================================


// =============================
// SAVE CHAT HISTORY
// =============================

function saveChat(){


    if(!chatBox) return;



    localStorage.setItem(

        "ChatTBM_History",

        chatBox.innerHTML

    );


}







// =============================
// LOAD CHAT HISTORY
// =============================

function loadChat(){


    const saved =

    localStorage.getItem(

        "ChatTBM_History"

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


        scrollChat();


    }


}







// =============================
// NEW CHAT
// =============================

function createNewChat(){


    if(!chatBox) return;



    const confirmNew =

    confirm(

    "Start a new ChatTBM conversation?"

    );



    if(!confirmNew) return;



    chatBox.innerHTML = "";



    chatBox.classList.add(

        "hidden"

    );



    localStorage.removeItem(

        "ChatTBM_History"

    );



    lastUserMessage = "";



    showNotice(

        "🆕 New Chat Started"

    );


}







// =============================
// SHOW CHAT HISTORY
// =============================

function showChatHistory(){


    const history =

    localStorage.getItem(

        "ChatTBM_History"

    );



    if(history){


        addBotMessage(`


📂 Chat History Found


Your previous ChatTBM conversation has been restored.



`);

    }

    else{


        addBotMessage(`


📂 No Chat History Yet


Start creating with ChatTBM 🚀



`);

    }


}







// =============================
// SAVE BEFORE EXIT
// =============================

window.addEventListener(

"beforeunload",

()=>{


    saveChat();


}

);







// =============================
// LOAD SAVED MODE
// =============================

loadCreatorMode();







// =============================
// FIRST VISIT WELCOME
// =============================

function showWelcome(){


    const visited =

    localStorage.getItem(

        "ChatTBM_Welcome"

    );



    if(visited) return;



    setTimeout(()=>{


        addBotMessage(`


👋 Welcome to ChatTBM


🚀 Your AI Content Assistant



I can help you create:


✍️ Viral captions

🎬 Video scripts

📱 Social media posts

🔥 Content ideas

📢 Marketing content



What are we creating today?



`);




        localStorage.setItem(

            "ChatTBM_Welcome",

            "true"

        );



    },1000);



}







// =============================
// SYSTEM CHECK
// =============================

function checkChatTBM(){


    console.log(

    "🚀 ChatTBM V4.4 System Check"

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

    userInput
    ?
    "Connected ✅"
    :
    "Missing ❌"

    );



    console.log(

    "API Mode:",

    AI_CONFIG.mode

    );



    console.log(

    "Version:",

    "ChatTBM V4.4"

    );


}







// =============================
// START APP
// =============================

loadChat();

showWelcome();

checkChatTBM();





console.log(

"🔥 ChatTBM V4.4 FULL SCRIPT LOADED"

);
