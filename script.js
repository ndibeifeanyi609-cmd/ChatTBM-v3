    /* ===================================
   ChatTBM - Core AI Assistant
   script.js
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
// SEND MESSAGE
// ===============================

sendBtn.addEventListener("click", sendMessage);


userInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        sendMessage();

    }

});





function sendMessage(){


    const message = userInput.value.trim();


    if(message === "") return;



    lastUserMessage = message;



    addMessage(message,"user");


    userInput.value = "";



    showLoading();



    setTimeout(()=>{


        removeLoading();


        const response = generateAIResponse(message);


        addMessage(response,"bot");


        saveChat();



    },1000);



}





// ===============================
// MESSAGE DISPLAY
// ===============================


function addMessage(text,sender){


    const messageDiv = document.createElement("div");


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

        `<button onclick="copyResponse(this)">
        Copy
        </button>
        <button onclick="regenerateResponse()">
        Regenerate
        </button>`

        :

        ""

        }

    `;



    chatBox.appendChild(messageDiv);


    chatBox.scrollTop = chatBox.scrollHeight;


}





// ===============================
// AI RESPONSE ENGINE
// ===============================


// ===============================
// CONNECT TO CHATTBM BACKEND
// ===============================


async function generateAIResponse(message) {


    try {


        const response = await fetch(
            "http://localhost:3000/api/chat",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    message: message

                })

            }

        );



        const data = await response.json();



        return data.reply;



    }


    catch(error){


        console.log(error);



        return "ChatTBM could not connect to the backend.";

    }


}


    const text = message.toLowerCase();



    if(text.includes("caption")){


        return `
        Here is a caption idea:

        🔥 Turning ideas into reality.
        Creating, improving and building every day.

        #Creator #AI #ContentCreation
        `;

    }



    if(text.includes("script")){


        return `
        Video Script:

        Hook:
        "You won't believe what happened next..."

        Body:
        Explain your story and add value.

        Ending:
        Ask viewers to follow for more.
        `;

    }




    if(text.includes("hashtag")){


        return `
        Suggested hashtags:

        #ChatTBM
        #ContentCreator
        #ViralVideos
        #AItools
        #DigitalCreator
        `;

    }




    if(text.includes("idea")){


        return `
        Viral Content Ideas:

        1. Behind the scenes
        2. Before and after transformation
        3. Storytelling videos
        4. AI challenge videos
        `;

    }




    if(text.includes("advert")){


        return `
        Advert Template:

        Attention grabbing headline.

        Explain the benefit.

        Add a strong call to action.
        `;

    }




    if(text.includes("calendar")){


        return `
        Weekly Content Calendar:

        Monday:
        Educational post

        Wednesday:
        Storytelling video

        Friday:
        Viral trend content
        `;

    }




    return `

    I am ChatTBM 🤖

    I can help you create:

    • Captions
    • Scripts
    • Hashtags
    • Viral ideas
    • Advert content
    • Content calendars

    Ask me anything.

    `;


}





// ===============================
// CREATOR TOOL BUTTONS
// ===============================


toolButtons.forEach(button=>{


    button.addEventListener("click",()=>{


        const tool = button.dataset.tool;


        userInput.value = 
        "Create " + tool;


        sendMessage();


    });


});






// ===============================
// LOADING
// ===============================


function showLoading(){


    const loading = document.createElement("div");


    loading.id="loading";


    loading.className="message bot-message";


    loading.innerHTML="ChatTBM is thinking... 🤖";


    chatBox.appendChild(loading);


}



function removeLoading(){


    const loading=document.getElementById("loading");


    if(loading){

        loading.remove();

    }


}






// ===============================
// COPY RESPONSE
// ===============================


function copyResponse(button){


    const text =
    button.parentElement.querySelector("p").innerText;



    navigator.clipboard.writeText(text);



    button.innerText="Copied!";


    setTimeout(()=>{

        button.innerText="Copy";

    },1500);



}






// ===============================
// REGENERATE
// ===============================


function regenerateResponse(){


    if(lastUserMessage){


        showLoading();


        setTimeout(()=>{


            removeLoading();


            addMessage(
            generateAIResponse(lastUserMessage),
            "bot"
            );


        },1000);


    }


}






// ===============================
// CHAT STORAGE
// ===============================


function saveChat(){


    localStorage.setItem(
        "ChatTBM_history",
        chatBox.innerHTML
    );


}





function loadChat(){


    const saved =
    localStorage.getItem("ChatTBM_history");


    if(saved){


        chatBox.innerHTML=saved;


    }


}



loadChat();

// ===============================
// SERVICE WORKER REGISTRATION
// ===============================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register(
            "service-worker.js"
        )

        .then(() => {

            console.log(
            "ChatTBM App Ready"
            );

        })

        .catch(error => {

            console.log(
            "Service Worker Error:",
            error
            );

        });

    });

}
