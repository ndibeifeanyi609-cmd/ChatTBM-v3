// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 1A - Core Chat Engine
// =====================================


// =============================
// CONNECT HTML ELEMENTS
// =============================

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let lastUserMessage = "";




// =============================
// TIME
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

        top: chatBox.scrollHeight,

        behavior:"smooth"

    });

}





// =============================
// ADD USER MESSAGE
// =============================

function addUserMessage(message){

    if(!chatBox) return;


    lastUserMessage = message;


    chatBox.classList.remove("hidden");


    const userMessage = document.createElement("div");


    userMessage.className =
    "flex justify-end mb-5";


    userMessage.innerHTML = `

        <div class="user-bubble">

            ${message.replace(/\n/g,"<br>")}

            <div class="message-time">
                ${getTime()}
            </div>

        </div>

    `;


    chatBox.appendChild(userMessage);


    scrollChat();

}





// =============================
// ADD AI MESSAGE
// =============================

function addBotMessage(message){

    if(!chatBox) return;


    chatBox.classList.remove("hidden");


    const aiMessage =
    document.createElement("div");


    aiMessage.className =
    "ai-message mb-5";


    aiMessage.innerHTML = `

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

    `;


    chatBox.appendChild(aiMessage);


    scrollChat();

}





// =============================
// THINKING MESSAGE
// =============================

function showThinking(){

    if(!chatBox) return null;


    const thinking =
    document.createElement("div");


    thinking.className =
    "ai-message mb-5";


    thinking.innerHTML = `

        <div class="ai-bubble">

            <div class="ai-header">
                🤖 ChatTBM
            </div>


            <div class="ai-content thinking">
                Thinking...
            </div>

        </div>

    `;


    chatBox.appendChild(thinking);


    scrollChat();


    return thinking;

}





console.log("✅ ChatTBM Part 1A Loaded");

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 1B - Send System
// =====================================



// =============================
// AI REPLY ENGINE
// =============================

function getAIReply(message){


    const text = message.toLowerCase();



    if(text.includes("caption")){

        return `
✍️ Here is a viral caption idea:

"Building my dream one step at a time 🚀
The journey is the story."

Add your style and make it yours.
`;

    }



    if(text.includes("video")){

        return `
🎬 Video idea:

Create a 30-second transformation video.

Hook:
"Nobody believed this would work..."

Show:
• The problem
• The process
• The final result

`;

    }



    if(text.includes("idea")){

        return `
💡 Content idea:

Create a behind-the-scenes video showing how you create your work.

People love seeing the process.
`;

    }



    return `

🚀 ChatTBM received your request:

"${message}"


I can help you create:

✍️ Captions

🎬 Video scripts

📱 Social media posts

🔥 Viral ideas

`;

}





// =============================
// SEND MESSAGE FUNCTION
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



        const reply =
        getAIReply(message);



        addBotMessage(reply);



    },1000);



}







// =============================
// SEND BUTTON CONNECTION
// =============================

const sendButton =
document.getElementById("send-btn");



if(sendButton){


    sendButton.addEventListener(
        "click",
        sendMessage
    );


}







// =============================
// ENTER KEY SUPPORT
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





console.log("✅ ChatTBM Part 1B Loaded");

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 2A - Upload + Voice System
// =====================================



// =============================
// FILE UPLOAD SYSTEM
// =============================

const uploadButton =
document.getElementById("upload-btn");


const fileInput =
document.getElementById("file-input");




if(uploadButton && fileInput){


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
                    "📎 Uploaded file: " + file.name
                );



                setTimeout(()=>{


                    addBotMessage(`

📂 File received.


ChatTBM can read and analyze files after AI API connection is added.

`);

                },700);


            }


        }
    );


}







// =============================
// VOICE INPUT SYSTEM
// =============================

const voiceButton =
document.getElementById("voice-btn");





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


        const voiceText =
        event.results[0][0].transcript;



        userInput.value =
        voiceText;



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


            addBotMessage(
                "🎤 Voice input is not supported on this browser."
            );


        }
    );


}





console.log("✅ ChatTBM Part 2A Loaded");

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 2B - Creator Tools + Video Studio
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
            "Create viral caption templates";

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
            "Create a strong call to action";

        break;



        case "bio":

            request =
            "Create a creator bio";

        break;



        case "username":

            request =
            "Generate username ideas";

        break;



        case "calendar":

            request =
            "Create a content calendar";

        break;



        default:

            request =
            "Create amazing content";

    }




    addUserMessage(request);



    setTimeout(()=>{


        addBotMessage(`

🚀 ChatTBM Creator Assistant


I can help you create:

${request}


Tell me your niche and audience,
and I will customize it.

`);


    },800);



}







// =============================
// VIDEO TOOLS
// =============================

function videoTool(type){


    let request = "";



    switch(type){


        case "create":

            request =
            "Create an AI video concept";

        break;



        case "script":

            request =
            "Create a video script";

        break;



        case "image":

            request =
            "Create an image prompt";

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
            "Create a YouTube script";

        break;



        case "reels":

            request =
            "Create TikTok and Reels ideas";

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


ChatTBM can help with:

• Hooks
• Scenes
• Scripts
• Prompts
• Story ideas

`);

    },800);



}





console.log("✅ ChatTBM Part 2B Loaded");

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 3 - Memory + History + Modes
// =====================================



// =============================
// SAVE CHAT
// =============================

function saveChat(){


    if(!chatBox) return;



    localStorage.setItem(

        "ChatTBM_History",

        chatBox.innerHTML

    );


}







// =============================
// LOAD CHAT
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



    const confirmClear =
    confirm(
        "Start a new ChatTBM conversation?"
    );



    if(!confirmClear) return;



    chatBox.innerHTML = "";



    chatBox.classList.add(
        "hidden"
    );



    localStorage.removeItem(
        "ChatTBM_History"
    );



    lastUserMessage = "";



}







// =============================
// CHAT HISTORY
// =============================

function showChatHistory(){


    const history =
    localStorage.getItem(
        "ChatTBM_History"
    );



    if(history){


        addBotMessage(`

📂 Chat history restored.

Your previous ChatTBM conversation is available.

`);


    }

    else{


        addBotMessage(`

📂 No chat history found yet.

Start creating with ChatTBM.

`);

    }


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


ChatTBM will adjust ideas for this style.

What do you want to create?

`);

}





// =============================
// LOAD MODE
// =============================

function loadCreatorMode(){


    const saved =
    localStorage.getItem(
        "ChatTBM_Mode"
    );



    if(saved){

        activeCreatorMode =
        saved;

    }


}







// =============================
// AUTO SAVE
// =============================

window.addEventListener(

"beforeunload",

()=>{


    saveChat();


}

);







// =============================
// START MEMORY
// =============================

loadChat();

loadCreatorMode();







console.log(
"✅ ChatTBM Part 3 Loaded"
);

// =====================================
// ChatTBM V4.2 CLEAN SCRIPT
// Part 4 - Final Startup System
// =====================================



// =============================
// WELCOME MESSAGE
// =============================

function showWelcome(){


    const visited =
    localStorage.getItem(
        "ChatTBM_Welcome"
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

        userInput
        ?
        "Connected ✅"
        :
        "Missing ❌"

    );



    console.log(

        "Send Button:",

        document.getElementById(
            "send-btn"
        )
        ?
        "Connected ✅"
        :
        "Missing ❌"

    );



    console.log(

        "Upload Button:",

        document.getElementById(
            "upload-btn"
        )
        ?
        "Connected ✅"
        :
        "Missing ❌"

    );



    console.log(

        "ChatTBM Version:",
        "V4.2 Clean"

    );


}







// =============================
// START APPLICATION
// =============================

showWelcome();


checkChatTBM();





console.log(
"🔥 ChatTBM V4.2 FULL SCRIPT READY"
);
