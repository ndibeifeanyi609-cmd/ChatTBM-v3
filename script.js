/* ===================================
   ChatTBM V6.0.2

   Main Application Engine

   Upgrade:
   - Offline Brain First
   - Backend Backup
   - Creator Brain Support
   - Creator Memory Support
   - Context Engine Support
   - Chat History
   - Creator Tools
=================================== */


// ===============================
// CONNECT ELEMENTS
// ===============================

const chatBox =
document.getElementById("chat-box");

const userInput =
document.getElementById("user-input");

const sendBtn =
document.getElementById("send-btn");

const toolButtons =
document.querySelectorAll(".tool-btn");


let lastUserMessage = "";




// ===============================
// EVENTS
// ===============================


sendBtn.addEventListener(
    "click",
    sendMessage
);


userInput.addEventListener(
    "keypress",
    function(event){

        if(event.key === "Enter"){

            sendMessage();

        }

    }
);




// ===============================
// SEND MESSAGE
// ===============================


async function sendMessage(){


    const message =
    userInput.value.trim();



    if(!message) return;



    lastUserMessage =
    message;



    addMessage(
        message,
        "user"
    );



    saveConversation(
        "user",
        message
    );



    userInput.value = "";



    showLoading();



    const response =
    await generateAIResponse(
        message
    );



    removeLoading();



    addMessage(
        response,
        "bot"
    );



    saveConversation(
        "assistant",
        response
    );


    saveChat();


}








// ===============================
// AI RESPONSE ENGINE
// ===============================


async function generateAIResponse(message){



    // ===============================
    // OFFLINE INTELLIGENCE FIRST
    // ===============================


    if(
        typeof window.offlineBrain === "function"
    ){


        const offlineReply =

        window.offlineBrain(
            message
        );



        if(offlineReply){

            return offlineReply;

        }

    }






    // ===============================
    // BACKEND FALLBACK
    // ===============================


    try{


        const userId =

        localStorage.getItem(
            "ChatTBM_user"
        )

        ||

        createUserId();




        const response =

        await fetch(

        "https://chattbm-backend.onrender.com/api/chat",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:JSON.stringify({

                message,

                conversationId:userId

            })


        });



        const data =
        await response.json();




        if(data.reply){

            return data.reply;

        }


    }


    catch(error){


        console.log(
            "Backend unavailable",
            error
        );


    }





    return (

        "I'm ready to help you create content 🤖"

    );


}









// ===============================
// MESSAGE DISPLAY
// ===============================


function addMessage(text, sender){


    const div =
    document.createElement("div");



    div.className =

    sender === "user"

    ?

    "message user-message"

    :

    "message bot-message";





    div.innerHTML = `

        <p>${text}</p>

        ${
            sender === "bot"

            ?

            `
            <button onclick="copyResponse(this)">
            Copy
            </button>

            <button onclick="regenerateResponse()">
            Regenerate
            </button>
            `

            :

            ""

        }

    `;



    chatBox.appendChild(div);



    chatBox.scrollTop =
    chatBox.scrollHeight;


}









// ===============================
// CREATOR TOOL BUTTONS
// ===============================


toolButtons.forEach(button=>{


    button.addEventListener(

        "click",

        ()=>{


            const tool =
            button.dataset.tool;



            userInput.value =
            "Create " + tool;



            sendMessage();


        }

    );


});









// ===============================
// LOADING
// ===============================


function showLoading(){


    const loading =
    document.createElement("div");



    loading.id =
    "loading";



    loading.className =
    "message bot-message";



    loading.innerHTML =

    "<p>ChatTBM is thinking... 🤖</p>";



    chatBox.appendChild(
        loading
    );


}





function removeLoading(){


    const loading =
    document.getElementById(
        "loading"
    );



    if(loading){

        loading.remove();

    }


}









// ===============================
// COPY RESPONSE
// ===============================


function copyResponse(button){


    const text =

    button.parentElement

    .querySelector("p")

    .innerText;



    navigator.clipboard.writeText(
        text
    );



    button.innerText =
    "Copied!";



    setTimeout(()=>{


        button.innerText =
        "Copy";


    },1500);


}









// ===============================
// REGENERATE
// ===============================


async function regenerateResponse(){


    if(!lastUserMessage)
    return;



    showLoading();



    const response =

    await generateAIResponse(
        lastUserMessage
    );



    removeLoading();



    addMessage(
        response,
        "bot"
    );


}









// ===============================
// USER ID
// ===============================


function createUserId(){


    const id =

    "user-" +

    Date.now();



    localStorage.setItem(

        "ChatTBM_user",

        id

    );



    return id;


}









// ===============================
// CONVERSATION MEMORY
// ===============================


function saveConversation(
role,
message
){


    if(

        window.conversationManager &&

        typeof window.conversationManager.addMessage === "function"

    ){

        window.conversationManager.addMessage(

            role,

            message

        );

    }


}









// ===============================
// CHAT HISTORY
// ===============================


function saveChat(){


    localStorage.setItem(

        "ChatTBM_history",

        chatBox.innerHTML

    );


}





function loadChat(){


    const saved =

    localStorage.getItem(

        "ChatTBM_history"

    );



    if(saved){

        chatBox.innerHTML =
        saved;

    }


}



loadChat();









// ===============================
// SERVICE WORKER
// ===============================


if(
"serviceWorker" in navigator
){


window.addEventListener(

"load",

()=>{


navigator.serviceWorker.register(

"service-worker.js"

)

.then(()=>{

console.log(
"ChatTBM PWA Ready 🚀"
);


})

.catch(error=>{


console.log(
"Service Worker Error",
error
);


});


}

);


}
