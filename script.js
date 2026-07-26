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
