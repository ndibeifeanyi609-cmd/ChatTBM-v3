/* ===================================
   ChatTBM V5.9.3

   script.js
   Part 4A

   Upgrade:
   - Offline Brain Connection
   - Backend + Offline fallback
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
// SEND BUTTON
// ===============================


sendBtn.addEventListener(
    "click",
    sendMessage
);







// ===============================
// ENTER KEY
// ===============================


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

   if (window.conversationManager) {
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

   if (window.conversationManager) {
    window.conversationManager.addMessage(
        "assistant",
        response
    );
}



    saveChat();


}









// ===============================
// MESSAGE DISPLAY
// ===============================


function addMessage(text, sender){


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
// USER ID
// ===============================


function createUserId(){


    const id =

    "user-" +

    Date.now() +

    "-" +

    Math.floor(
        Math.random()*10000
    );



    localStorage.setItem(
        "ChatTBM_user",
        id
    );



    return id;


}









// ===============================
// AI RESPONSE ENGINE
// ===============================


async function generateAIResponse(message){


    try {


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

        }

        );





        if(!response.ok){

            throw new Error(
                "Backend unavailable"
            );

        }






        const data =
        await response.json();





        if(
            data.reply
        ){

            console.log(
                "ChatTBM Backend:",
                data
            );


            return data.reply;

        }



        throw new Error(
            "No backend reply"
        );



    }



    catch(error){


        console.log(

            "Switching to Offline Brain:",

            error

        );




        if(
            typeof window.offlineBrain === "function"
        ){


            return window.offlineBrain(
                message
            );


        }




        return (

            "ChatTBM offline brain " +

            "is loading..."

        );



    }



}

/* ===================================
   ChatTBM V5.9.3

   script.js
   Part 4B

   - Tool buttons
   - Loading
   - Copy
   - Regenerate
   - History
   - Service Worker
=================================== */



// ===============================
// CREATOR TOOL BUTTONS
// ===============================


toolButtons.forEach(button => {


    button.addEventListener(

        "click",

        function(){


            const tool =
            button.dataset.tool;



            userInput.value =

            "Create " + tool;



            sendMessage();



        }

    );


});









// ===============================
// LOADING ANIMATION
// ===============================


function showLoading(){


    const loading =
    document.createElement("div");



    loading.id =
    "loading";



    loading.className =
    "message bot-message";



    loading.innerHTML = `

        <p>
        ChatTBM is thinking... 🤖
        </p>

    `;



    chatBox.appendChild(
        loading
    );



    chatBox.scrollTop =
    chatBox.scrollHeight;


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
// REGENERATE RESPONSE
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



        saveChat();


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


    const savedChat =

    localStorage.getItem(

        "ChatTBM_history"

    );



    if(savedChat){


        chatBox.innerHTML =
        savedChat;


    }


}






// Load old conversations

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


            navigator.serviceWorker

            .register(
                "service-worker.js"
            )


            .then(()=>{


                console.log(

                    "ChatTBM App Ready 🚀"

                );


            })


            .catch(error=>{


                console.log(

                    "Service Worker Error:",

                    error

                );


            });



        }

    );


}
