// =====================================
// ChatTBM V6.8.5
// Frontend Bridge
//
// Connected:
// - Chat Interface
// - Node Backend API
// - Conversation Memory
// - Response Display
// =====================================


const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");



const API_URL = "/api/chat";





// =====================================
// ADD MESSAGE
// =====================================


function addMessage(message, type){

    const div = document.createElement("div");

    div.className =
    type === "user"
    ? "message user-message"
    : "message bot-message";


    const p = document.createElement("p");

    p.textContent = message;


    div.appendChild(p);

    chatBox.appendChild(div);


    chatBox.scrollTop =
    chatBox.scrollHeight;

}





// =====================================
// LOADING MESSAGE
// =====================================


function showLoading(){

    const div = document.createElement("div");

    div.id = "loading-message";

    div.className = "message bot-message";


    div.innerHTML =
    "<p>ChatTBM is thinking...</p>";


    chatBox.appendChild(div);

    chatBox.scrollTop =
    chatBox.scrollHeight;

}



function removeLoading(){

    const loading =
    document.getElementById(
        "loading-message"
    );


    if(loading){

        loading.remove();

    }

}





// =====================================
// SEND MESSAGE TO BACKEND
// =====================================


async function sendMessage(){


    const message =
    userInput.value.trim();



    if(!message){

        return;

    }



    addMessage(
        message,
        "user"
    );


    userInput.value = "";



    showLoading();



    try{


        const response =
        await fetch(
            API_URL,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    userId:"guest",

                    message

                })

            }
        );



        const data =
        await response.json();



        removeLoading();



        if(data.success){


            addMessage(

                data.response,

                "bot"

            );


        }

        else{


            addMessage(

                "Sorry, I could not process that request.",

                "bot"

            );


        }



    }

    catch(error){


        removeLoading();



        console.error(
            error
        );



        addMessage(

            "ChatTBM connection error. Check your backend server.",

            "bot"

        );


    }


}





// =====================================
// BUTTON EVENTS
// =====================================


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





console.log(
"🚀 ChatTBM V6.8.5 Frontend Bridge Loaded"
);
