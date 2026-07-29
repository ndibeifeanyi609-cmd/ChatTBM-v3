// =====================================
// ChatTBM V5.9.2
// Personal AI Brain Edition
// Frontend Core Connection
// =====================================


// =====================================
// BACKEND CONNECTION
// =====================================

// Local testing backend
const BACKEND_URL = "http://localhost:3000";


// =====================================
// CHAT STORAGE
// =====================================

const STORAGE_KEY = "ChatTBM_V5.9.2_HISTORY";

let chatHistory = [];

let isSending = false;


// =====================================
// USER ID
// =====================================

const USER_ID = "guest";


// =====================================
// CONNECT HTML ELEMENTS
// =====================================

const chatBox =

document.getElementById("chat-box");


const userInput =

document.getElementById("user-input");


const sendButton =

document.getElementById("send-button");


// =====================================
// LOAD SAVED CHAT
// =====================================

function loadChatHistory(){

    const saved =

    localStorage.getItem(STORAGE_KEY);


    if(saved){

        chatHistory = JSON.parse(saved);


        chatHistory.forEach(message=>{

            addMessage(

                message.role,

                message.content

            );

        });

    }

}


// =====================================
// SAVE CHAT
// =====================================

function saveChatHistory(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(chatHistory)

    );

}


// =====================================
// ADD MESSAGE TO MEMORY
// =====================================

function storeMessage(role, content){


    chatHistory.push({

        role,

        content,

        timestamp:

        new Date().toISOString()

    });


    saveChatHistory();

}


// =====================================
// INITIAL START
// =====================================

loadChatHistory();

// =====================================
// SEND MESSAGE TO CHATTBM AI
// =====================================


async function sendMessage(){


    if(isSending) return;


    const message =

    userInput.value.trim();



    if(!message) return;



    // Show user message

    addMessage(

        "user",

        message

    );



    storeMessage(

        "user",

        message

    );



    userInput.value = "";



    isSending = true;



    showTyping();




    try{


        const response =

        await fetch(

            `${BACKEND_URL}/chat`,

            {

                method:"POST",


                headers:{


                    "Content-Type":

                    "application/json"


                },


                body:JSON.stringify({


                    userId:USER_ID,


                    message:message


                })


            }

        );





        const data =

        await response.json();





        removeTyping();




        if(data.success){


            addMessage(

                "assistant",

                data.response

            );



            storeMessage(

                "assistant",

                data.response

            );


        }

        else{


            addMessage(

                "assistant",

                "I received your message but could not generate a response."

            );


        }



    }

    catch(error){


        console.error(

            "ChatTBM Connection Error:",

            error

        );


        removeTyping();



        addMessage(

            "assistant",

            "ChatTBM cannot connect to the AI server right now."

        );


    }



    isSending = false;


}




// =====================================
// ENTER KEY SUPPORT
// =====================================


if(userInput){


    userInput.addEventListener(

        "keydown",

        function(event){


            if(

                event.key === "Enter"

            ){


                sendMessage();


            }


        }

    );


}




// =====================================
// SEND BUTTON
// =====================================


if(sendButton){


    sendButton.addEventListener(

        "click",

        sendMessage

    );


}

// =====================================
// CHAT MESSAGE DISPLAY
// =====================================


function addMessage(role, content){


    if(!chatBox) return;



    const messageDiv =

    document.createElement("div");



    messageDiv.className =

    role === "user"

    ? "user-message"

    : "bot-message";



    messageDiv.innerText = content;



    chatBox.appendChild(

        messageDiv

    );



    chatBox.scrollTop =

    chatBox.scrollHeight;


}




// =====================================
// TYPING INDICATOR
// =====================================


let typingElement = null;



function showTyping(){


    if(!chatBox) return;



    typingElement =

    document.createElement("div");



    typingElement.className =

    "bot-message typing";



    typingElement.innerText =

    "ChatTBM is thinking... 🧠";



    chatBox.appendChild(

        typingElement

    );



    chatBox.scrollTop =

    chatBox.scrollHeight;


}





function removeTyping(){


    if(typingElement){


        typingElement.remove();


        typingElement = null;


    }


}




// =====================================
// CLEAR CHAT
// =====================================


function clearChat(){


    chatHistory = [];


    localStorage.removeItem(

        STORAGE_KEY

    );



    if(chatBox){


        chatBox.innerHTML = "";


    }


}

// =====================================
// QUICK ACTION BUTTONS
// =====================================


function sendQuickMessage(text){


    if(userInput){


        userInput.value = text;


        sendMessage();


    }


}




// =====================================
// NEW CHAT
// =====================================


const newChatButton =

document.getElementById("new-chat");



if(newChatButton){


    newChatButton.addEventListener(

        "click",

        ()=>{


            clearChat();


            addMessage(

                "assistant",

                "New conversation started. 👋\n\nWhat are we creating today?"

            );


        }

    );


}




// =====================================
// COPY AI RESPONSE
// =====================================


function copyResponse(text){


    navigator.clipboard.writeText(

        text

    );


}




// =====================================
// ADD COPY BUTTON TO RESPONSE
// =====================================


function addCopyButton(element, text){


    const button =

    document.createElement("button");



    button.innerText =

    "Copy";



    button.className =

    "copy-button";



    button.onclick = ()=>{


        copyResponse(text);


        button.innerText =

        "Copied ✓";


        setTimeout(()=>{


            button.innerText =

            "Copy";


        },1500);


    };



    element.appendChild(button);


}




// =====================================
// REGENERATE LAST RESPONSE
// =====================================


function regenerateResponse(){


    let lastUserMessage = null;



    for(

        let i = chatHistory.length - 1;

        i >= 0;

        i--

    ){


        if(

            chatHistory[i].role === "user"

        ){


            lastUserMessage =

            chatHistory[i].content;


            break;


        }


    }




    if(lastUserMessage){


        userInput.value =

        lastUserMessage;


        sendMessage();


    }


}

// =====================================
// CHATTBM CREATOR TOOLS
// =====================================


// Send creator request

function creatorRequest(type){


    const prompts = {


        script:

        "Create a video script. Ask me for topic, duration, platform and style.",



        caption:

        "Create a social media caption. Ask me for post details, platform and tone.",



        ideas:

        "Give me viral content ideas for my niche and platform.",



        advert:

        "Create an advert for my product or service. Ask me for details.",



        calendar:

        "Create a content calendar for my social media growth."

    };




    if(prompts[type]){


        if(userInput){


            userInput.value =

            prompts[type];


            sendMessage();


        }


    }


}




// =====================================
// CONNECT BUTTONS
// =====================================


const creatorButtons = {


    "script-btn":"script",

    "caption-btn":"caption",

    "ideas-btn":"ideas",

    "advert-btn":"advert",

    "calendar-btn":"calendar"


};




Object.keys(creatorButtons)

.forEach(id=>{


    const button =

    document.getElementById(id);



    if(button){


        button.addEventListener(

            "click",

            ()=>{


                creatorRequest(

                    creatorButtons[id]

                );


            }

        );


    }


});




// =====================================
// WELCOME MESSAGE
// =====================================


function showWelcome(){


    if(chatBox && chatBox.children.length === 0){


        addMessage(

            "assistant",

`Welcome to ChatTBM AI Creator Assistant 👋


I can help you create:

🎬 Video Scripts

✍️ Captions

💡 Viral Ideas

📢 Advertisements

📅 Content Plans


What are we creating today?`

        );


    }


}




showWelcome();

// =====================================
// CHATTBM V5.9.2
// BACKEND AI CONNECTION
// =====================================


// Your backend URL

const BACKEND_URL =

"https://chattbm-backend.onrender.com/chat";




// =====================================
// SEND MESSAGE TO AI SERVER
// =====================================


async function sendToAI(message){


    try {


        const response =

        await fetch(

            BACKEND_URL,

            {

                method:"POST",


                headers:{


                    "Content-Type":

                    "application/json"


                },


                body:JSON.stringify({


                    userId:"guest",


                    message:message


                })


            }

        );




        const data =

        await response.json();




        if(data.success){


            return data.response;


        }




        return "AI server returned no response.";



    }


    catch(error){


        console.error(

            "AI Connection Error:",

            error

        );



        return (

            "ChatTBM cannot connect to the AI server right now."

        );


    }


}




// =====================================
// UPDATE SEND MESSAGE FUNCTION
// =====================================


async function processAIMessage(message){


    showTyping();



    const aiResponse =

    await sendToAI(

        message

    );



    hideTyping();



    addMessage(

        "assistant",

        aiResponse

    );



}

// =====================================
// CHATTBM V5.9.2
// MAIN MESSAGE HANDLER
// AI BRAIN CONNECTED
// =====================================


async function sendMessage(){


    const message =

    userInput.value.trim();



    if(!message){

        return;

    }




    // Show user message

    addMessage(

        "user",

        message

    );



    userInput.value = "";




    // Save local history

    chatHistory.push({

        role:"user",

        message:message,

        time:new Date().toISOString()

    });



    saveChatHistory();




    // Show loading

    showTyping();




    // Send to ChatTBM Brain

    const response =

    await sendToAI(

        message

    );




    // Remove loading

    hideTyping();




    // Show AI response

    addMessage(

        "assistant",

        response

    );




    // Save AI reply

    chatHistory.push({

        role:"assistant",

        message:response,

        time:new Date().toISOString()

    });



    saveChatHistory();




    // Scroll down

    chatBox.scrollTop =

    chatBox.scrollHeight;


}

// =====================================
// CHATTBM V5.9.2
// TYPING ANIMATION SYSTEM
// =====================================


let typingMessage = null;



function showTyping(){


    if(!chatBox) return;



    typingMessage =

    document.createElement("div");



    typingMessage.className =

    "bot-message typing";



    typingMessage.innerHTML =

    "ChatTBM is thinking 🧠...";



    chatBox.appendChild(

        typingMessage

    );



    chatBox.scrollTop =

    chatBox.scrollHeight;


}




function hideTyping(){


    if(typingMessage){


        typingMessage.remove();


        typingMessage = null;


    }


}




// =====================================
// CONNECTION STATUS CHECK
// =====================================


async function checkServer(){


    try{


        const response =

        await fetch(

            "http://localhost:3000/"

        );



        if(response.ok){


            console.log(

                "✅ ChatTBM AI Server Online"

            );


            return true;


        }



    }

    catch(error){


        console.log(

            "❌ ChatTBM AI Server Offline"

        );


    }



    return false;


}




// =====================================
// BETTER ERROR MESSAGE
// =====================================


function connectionError(error){


    console.error(

        "ChatTBM Error:",

        error

    );



    return `

⚠️ ChatTBM connection problem.


Check:

1. Is server.js running?

2. Is backend URL correct?

3. Is your AI server reachable?


Error:
${error.message || error}

`;

}

// =====================================
// STARTUP CHECK
// =====================================

window.addEventListener(

    "load",

    ()=>{


        console.log(

            "🚀 ChatTBM V5.9.2 Frontend Loaded"

        );


        checkServer();


    }

);
