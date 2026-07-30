/* ===================================
   ChatTBM V6.0.1

   script.js

   Upgrade:
   - Offline Brain First
   - Creator Brain Support
   - Creator Memory Connection
   - Context Engine Support
   - Backend Backup
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
// SEND EVENTS
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



    if(message === "") return;



    lastUserMessage =
    message;



    addMessage(
        message,
        "user"
    );




    if(window.conversationManager){

        window.conversationManager.addMessage(
            "user",
            message
        );

    }




    userInput.value = "";



    showLoading();




    const response =
    await generateAIResponse(message);




    removeLoading();




    addMessage(
        response,
        "bot"
    );





    if(window.conversationManager){

        window.conversationManager.addMessage(
            "assistant",
            response
        );

    }



    saveChat();


}









// ===============================
// AI RESPONSE ENGINE
// ===============================


async function generateAIResponse(message){



    // ===============================
    // OFFLINE BRAIN FIRST
    // ===============================


    if(
        typeof window.offlineBrain === "function"
    ){


        const offlineResponse =

        window.offlineBrain(
            message
        );



        if(offlineResponse){

            return offlineResponse;

        }


    }








    // ===============================
    // BACKEND BACKUP
    // ===============================


    try{


        const conversationId =

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

                message:message,

                conversationId:
                conversationId

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

            "Offline mode:",

            error

        );


    }






    return (

        "ChatTBM is ready to help you create content 🤖"

    );


}









// ===============================
// DISPLAY MESSAGE
// ===============================


function addMessage(text,sender){


    const messageDiv =
    document.createElement("div");



    messageDiv.classList.add(

        "message",

        sender === "user"

        ? "user-message"

        : "bot-message"

    );





    messageDiv.innerHTML = `

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





    chatBox.appendChild(
        messageDiv
    );



    chatBox.scrollTop =
    chatBox.scrollHeight;


}









// ===============================
// CREATOR TOOLS
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


    if(lastUserMessage){


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

);


}

);


}
