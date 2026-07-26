// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
// Part 1A - Core System + Chat Display
// =====================================


// =============================
// CONNECT ELEMENTS
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


    const wrapper = document.createElement("div");


    wrapper.className =
    "flex justify-end mb-5";



    wrapper.innerHTML = `

        <div class="user-bubble">

            ${message.replace(/\n/g,"<br>")}


            <div class="message-time">

                ${getTime()}

            </div>


        </div>

    `;



    chatBox.appendChild(wrapper);



    saveChat();



    scrollChat();

}





// =============================
// ADD AI MESSAGE
// =============================

function addBotMessage(message){


    if(!chatBox) return;


    chatBox.classList.remove("hidden");



    const id =
    "ai_" + Date.now();



    const wrapper =
    document.createElement("div");



    wrapper.className =
    "ai-message mb-5";



    wrapper.id = id;




    wrapper.innerHTML = `

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


                <button class="ai-btn" onclick="copyResponse('${id}')">

                    📋 Copy

                </button>



                <button class="ai-btn" onclick="editResponse('${id}')">

                    ✏️ Edit

                </button>



                <button class="ai-btn" onclick="regenerateResponse('${id}')">

                    🔄 Regenerate

                </button>


            </div>


        </div>

    `;



    chatBox.appendChild(wrapper);



    saveChat();



    scrollChat();

}





// =============================
// THINKING EFFECT
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





console.log(
"✅ ChatTBM V4.3 Part 1A Loaded"
);

// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
// Part 1B - Send System + AI Reply
// =====================================



// =============================
// AI REPLY ENGINE
// =============================

function getAIReply(message){


    const text =
    message.toLowerCase();



    if(text.includes("caption")){


        return `

✍️ Viral Caption Idea:


"Every creator starts with zero.
The difference is who keeps going 🚀"


Add your own style and story.

`;

    }




    if(text.includes("video")){


        return `

🎬 Video Idea:


Hook:

"Nobody expected this result..."


Scene:

1. Show the problem

2. Show the process

3. Reveal the final result


Perfect for Reels, TikTok and YouTube Shorts.

`;

    }




    if(text.includes("idea")){


        return `

💡 Content Ideas:


• Behind the scenes

• Before and after transformation

• Day in my life

• Educational tips

• Storytelling videos


`;

    }





    return `

🚀 ChatTBM received:


"${message}"


I can help you create:


✍️ Captions

🎬 Video scripts

📱 Social media posts

🔥 Viral ideas

🎯 Marketing content


`;

}






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



        const reply =
        getAIReply(message);



        addBotMessage(reply);



    },1000);



}






// =============================
// SEND BUTTON
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
// ENTER KEY
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





console.log(
"✅ ChatTBM V4.3 Part 1B Loaded"
);

// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
// Part 2A - Creator Tools + Video Tools + Modes
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


I can help you with:


${request}


Tell me your niche and target audience,
and I will customize it.

`);


    },800);



}






// =============================
// AI VIDEO STUDIO
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
            "Create voice-over script";

        break;



        case "youtube":

            request =
            "Create YouTube script";

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


ChatTBM can help create:


• Hooks

• Scenes

• Scripts

• Prompts

• Story ideas


`);

    },800);



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


ChatTBM will customize your ideas
for this style.


What would you like to create?

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

        activeCreatorMode =
        saved;

    }


}





console.log(
"✅ ChatTBM V4.3 Part 2A Loaded"
);

// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
// Part 2B - Upload + Voice System
// =====================================



// =============================
// FILE UPLOAD
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


ChatTBM has received:

${file.name}


AI file analysis will be activated after API connection.

`);

                },700);


            }


        }
    );


}






// =============================
// VOICE INPUT
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
    (event)=>{


        const voiceText =
        event.results[0][0].transcript;



        if(userInput){

            userInput.value =
            voiceText;

        }



        voiceButton.innerHTML =
        "🎤";


    };







    recognition.onerror =
    ()=>{


        voiceButton.innerHTML =
        "🎤";


    };



}

else if(voiceButton){



    voiceButton.addEventListener(
        "click",
        ()=>{


            addBotMessage(`

🎤 Voice input is not supported on this browser.

`);

        }
    );



}





console.log(
"✅ ChatTBM V4.3 Part 2B Loaded"
);

// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
// Part 3 - Memory + History + Actions
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


    const confirmDelete =
    confirm(
        "Start a new ChatTBM chat?"
    );



    if(!confirmDelete) return;



    if(chatBox){


        chatBox.innerHTML = "";


        chatBox.classList.add(
            "hidden"
        );


    }



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

📂 Chat History Found


Your previous ChatTBM conversation
has been restored.


`);

    }

    else{


        addBotMessage(`

📂 No chat history yet.


Start creating with ChatTBM.

`);

    }


}






// =============================
// COPY RESPONSE
// =============================

function copyResponse(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(
        ".ai-content"
    );



    if(!content) return;



    navigator.clipboard.writeText(
        content.innerText
    );



    alert(
        "📋 Response copied"
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
    box.querySelector(
        ".ai-content"
    );



    if(!content) return;




    const edited =
    prompt(
        "Edit ChatTBM response:",
        content.innerText
    );



    if(
        edited &&
        edited.trim() !== ""
    ){


        content.innerHTML =
        edited.replace(
            /\n/g,
            "<br>"
        );


        saveChat();


    }


}






// =============================
// REGENERATE RESPONSE
// =============================

function regenerateResponse(id){


    const box =
    document.getElementById(id);



    if(!box) return;



    const content =
    box.querySelector(
        ".ai-content"
    );



    if(!content) return;



    content.innerHTML =
    "⏳ Creating new version...";




    setTimeout(()=>{


        const newReply =
        getAIReply(
            lastUserMessage
        );



        content.innerHTML =
        newReply.replace(
            /\n/g,
            "<br>"
        );



        saveChat();



    },1000);



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





console.log(
"✅ ChatTBM V4.3 Part 3 Loaded"
);

// =====================================
// ChatTBM V4.3 CLEAN SCRIPT
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

🔥 Viral content ideas

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
        "🚀 ChatTBM V4.3 System Check"
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
        document.getElementById("send-btn")
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Upload Button:",
        document.getElementById("upload-btn")
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Voice Button:",
        document.getElementById("voice-btn")
        ?
        "Connected ✅"
        :
        "Missing ❌"
    );



    console.log(
        "Version:",
        "ChatTBM V4.3"
    );


}







// =============================
// START APP
// =============================

document.addEventListener(
"DOMContentLoaded",
()=>{


    loadCreatorMode();


    showWelcome();


    checkChatTBM();



});






console.log(
"🔥 ChatTBM V4.3 FINAL LOADED"
);
