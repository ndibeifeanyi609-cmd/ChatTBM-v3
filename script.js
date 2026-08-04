// =====================================
// ChatTBM V7.2
// Frontend AI Assistant Bridge
//
// Connected:
// - Chat Interface
// - AI Gateway
// - AI Core
// - Voice Engine
// - Memory System
// =====================================



const chatBox =
document.getElementById("chat-box");


const userInput =
document.getElementById("user-input");


const sendBtn =
document.getElementById("send-btn");


const voiceBtn =
document.getElementById("voice-btn");





// =====================================
// ADD MESSAGE
// =====================================


function addMessage(message, type){


    const div =
    document.createElement("div");


    div.className =
    type === "user"
    ? "message user-message"
    : "message bot-message";



    const p =
    document.createElement("p");



    p.textContent =
    message;



    div.appendChild(p);


    chatBox.appendChild(div);



    chatBox.scrollTop =
    chatBox.scrollHeight;


}







// =====================================
// LOADING MESSAGE
// =====================================


function showLoading(){


    const div =
    document.createElement("div");



    div.id =
    "loading-message";



    div.className =
    "message bot-message";



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
// SEND MESSAGE
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


        let response;



        if(

            window.ChatTBM_AI &&

            window.ChatTBM_AI.askChatTBM

        ){


            response =

            await window.ChatTBM_AI.askChatTBM(

                message

            );


        }

        else{


            response =

            "ChatTBM AI system is loading...";

        }





        removeLoading();



        addMessage(

            response,

            "bot"

        );





        // Save conversation memory later

        if(

            window.ChatTBMMemory &&

            window.ChatTBMMemory.saveMemory

        ){


            window.ChatTBMMemory.saveMemory(

                "conversation",

                message

            );


        }



    }



    catch(error){



        removeLoading();



        console.error(

            error

        );



        addMessage(

            "ChatTBM had a problem processing that request.",

            "bot"

        );


    }



}









// =====================================
// VOICE INPUT
// =====================================


if(voiceBtn){


    voiceBtn.addEventListener(

        "click",

        function(){


            if(

                window.ChatTBMVoice &&

                window.ChatTBMVoice.startVoiceInput

            ){


                window.ChatTBMVoice.startVoiceInput();


            }


        }


    );


}









// =====================================
// BUTTON EVENTS
// =====================================


if(sendBtn){


    sendBtn.addEventListener(

        "click",

        sendMessage

    );


}





if(userInput){


    userInput.addEventListener(

        "keypress",

        function(event){


            if(event.key === "Enter"){


                sendMessage();


            }


        }


    );


}







console.log(

"🚀 ChatTBM V7.2 Frontend AI Bridge Loaded"

);
