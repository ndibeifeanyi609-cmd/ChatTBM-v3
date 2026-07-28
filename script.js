/* ===================================
   ChatTBM - Core AI Assistant
   CLEAN script.js

   PART 1/3
=================================== */



// ===============================
// CONNECT ELEMENTS
// ===============================

const chatBox = document.getElementById("chat-box");

const userInput = document.getElementById("user-input");

const sendBtn = document.getElementById("send-btn");

const toolButtons = document.querySelectorAll(".tool-btn");



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


    const message = userInput.value.trim();



    if(message === "") return;



    lastUserMessage = message;



    addMessage(
        message,
        "user"
    );



    userInput.value = "";



    showLoading();



    const response = await generateAIResponse(message);



    removeLoading();



    addMessage(
        response,
        "bot"
    );



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



    chatBox.appendChild(messageDiv);



    chatBox.scrollTop =
    chatBox.scrollHeight;



}








// ===============================
// CONNECT TO CHATTBM V5 BACKEND
// ===============================


// ===============================
// CREATE UNIQUE USER ID
// ===============================

function createUserId(){

    const id =
    "user-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 10000);


    localStorage.setItem(
        "ChatTBM_user",
        id
    );


    return id;

}



// ===============================
// CONNECT TO CHATTBM V5 BACKEND
// ===============================

async function generateAIResponse(message){


    try {


        const conversationId =
        localStorage.getItem("ChatTBM_user")
        || createUserId();


        const response =
        await fetch(

            "https://chattbm-backend.onrender.com/api/chat",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"

                },


                body: JSON.stringify({

                    message: message,

                    conversationId: conversationId

                })

            }

        );




        const data =
        await response.json();



        console.log(
            "ChatTBM AI:",
            data
        );



        return data.reply;




    }


    catch(error){


        console.log(

            "Backend Error:",
            error

        );



        return (

            "ChatTBM cannot connect " +
            "to the AI server right now."

        );


    }


}
/* ===================================
   ChatTBM - Core AI Assistant

   CLEAN script.js

   PART 2/3
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



    chatBox.appendChild(loading);



    chatBox.scrollTop =
    chatBox.scrollHeight;


}







function removeLoading(){


    const loading =
    document.getElementById("loading");



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




    navigator.clipboard.writeText(text);




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



    }


}

/* ===================================
   ChatTBM - Core AI Assistant

   CLEAN script.js

   PART 3/3
=================================== */





// ===============================
// CHAT HISTORY STORAGE
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







// Load previous conversations

loadChat();








// ===============================
// SERVICE WORKER REGISTRATION
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
