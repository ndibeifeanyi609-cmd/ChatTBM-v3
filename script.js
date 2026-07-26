// =====================================
// ChatTBM V4.4
// Part 1A - Core System + AI Configuration
// =====================================


// =============================
// CONNECT HTML ELEMENTS
// =============================

const chatBox = document.getElementById("chat-box");

const userInput = document.getElementById("user-input");

const sendButton = document.getElementById("send-btn");

const uploadButton = document.getElementById("upload-btn");

const fileInput = document.getElementById("file-input");

const voiceButton = document.getElementById("voice-btn");




// =============================
// CHAT MEMORY
// =============================

let lastUserMessage = "";

let activeCreatorMode = "";




// =============================
// AI CONFIGURATION
// API READY STRUCTURE
// =============================

const AI_CONFIG = {

    mode:"demo",

    apiConnected:false,

    apiKey:"",

    model:"ChatTBM Engine"

};




// =============================
// TIME FUNCTION
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

        top:chatBox.scrollHeight,

        behavior:"smooth"

    });

}





// =============================
// SHOW NOTIFICATION
// =============================

function showNotice(message){


    const notice =
    document.createElement("div");



    notice.innerText = message;



    notice.style.position="fixed";

    notice.style.bottom="90px";

    notice.style.left="50%";

    notice.style.transform="translateX(-50%)";

    notice.style.background="#222";

    notice.style.color="#fff";

    notice.style.padding="12px 20px";

    notice.style.borderRadius="999px";

    notice.style.zIndex="9999";

    notice.style.fontSize="14px";



    document.body.appendChild(notice);



    setTimeout(()=>{

        notice.remove();

    },2000);


}





// =============================
// BASIC AI ENGINE
// API WILL REPLACE THIS LATER
// =============================

function generateAIReply(message){


    const text =
    message.toLowerCase();



    if(text.includes("caption")){


        return `

✍️ Viral Caption Idea:

"Your dream is waiting for your action.
Start today. Build tomorrow. 🚀"


Style:
Motivational + Creator focused

`;

    }




    if(text.includes("video")){


        return `

🎬 Video Script Idea:


HOOK:

"Nobody expected this result..."


SCENE 1:

Show the challenge.


SCENE 2:

Show the process.


SCENE 3:

Show the transformation.


ENDING:

Follow for more ideas 🚀

`;

    }





    if(text.includes("marketing")){


        return `

📢 Marketing Idea:


Problem → Solution → Result


Create a post that shows:

✅ The customer's problem

✅ Your solution

✅ Why they should choose you


`;

    }





    return `

🚀 ChatTBM V4.4


I can help you create:


✍️ Captions

🎬 Video scripts

📱 Social media posts

🔥 Viral ideas

📢 Marketing content


Creator Mode:

${activeCreatorMode || "General Creator Mode"}

`;

}





console.log(
"✅ ChatTBM V4.4 Part 1A Loaded"
);
