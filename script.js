// =====================================
// ChatTBM V4.1
// Part 1 - Modern AI Message Cards
// =====================================


function addBotMessage(message){


chatBox.classList.remove("hidden");



const id =
"msg_" + Date.now();



chatBox.innerHTML += `

<div class="ai-message mb-5" id="${id}">


<div class="ai-bubble">


<div class="ai-header">

🤖 <strong>ChatTBM</strong>

</div>



<div class="ai-content">

${message.replace(/\n/g,"<br>")}

</div>



<div class="ai-actions">


<button

onclick="copyResponse('${id}')"

class="ai-btn">

📋 Copy

</button>




<button

onclick="editResponse('${id}')"

class="ai-btn">

✏️ Edit

</button>




<button

onclick="regenerateResponse('${id}')"

class="ai-btn">

🔄 Regenerate

</button>



</div>



</div>


</div>


`;



chatBox.scrollTop =
chatBox.scrollHeight;


saveChat();


}

// =====================================
// ChatTBM V4.1
// Part 2 - Edit, Copy & Regenerate
// =====================================



// =============================
// Copy Response
// =============================

function copyResponse(id){


const box =
document.getElementById(id);



if(!box){

return;

}



const text =
box.querySelector(".ai-content").innerText;



navigator.clipboard.writeText(text);



alert(
"✅ ChatTBM response copied!"
);


}




// =============================
// Edit Response
// =============================

function editResponse(id){


const box =
document.getElementById(id);



if(!box){

return;

}



const content =
box.querySelector(".ai-content");



const oldText =
content.innerText;



const edited =
prompt(
"Edit your ChatTBM response:",
oldText
);



if(edited){


content.innerHTML =
edited.replace(/\n/g,"<br>");



saveChat();


}


}




// =============================
// Regenerate Response
// =============================

function regenerateResponse(id){



const box =
document.getElementById(id);



if(!box){

return;

}



const content =
box.querySelector(".ai-content");



content.innerHTML =

`
⏳ ChatTBM is creating a new version...
`;




setTimeout(()=>{


let topic =
chatMemory.topic ||
"your idea";



let newResponse =
createCompleteContent(topic);



content.innerHTML =
newResponse.replace(/\n/g,"<br>");



saveChat();



},1200);



}



// =============================
// Save Chat After Actions
// =============================

function saveAfterEdit(){


if(typeof saveChat === "function"){

saveChat();

}


}


// =============================
// Part 2 Loaded
// =============================

console.log(
"✏️ ChatTBM V4.1 Edit, Copy & Regenerate Loaded"
);

// =====================================
// ChatTBM V4.1
// Part 3 - Modern AI Chat Bubble Style
// =====================================


.ai-message{

    width:100%;

}



.ai-bubble{

    background:#111;

    border:1px solid #2a2a2a;

    border-radius:24px;

    padding:18px;

    box-shadow:
    0 10px 30px rgba(0,0,0,.35);

}



.ai-header{

    font-size:16px;

    margin-bottom:14px;

    color:#fff;

}



.ai-content{

    color:#e5e5e5;

    line-height:1.7;

    font-size:15px;

    white-space:normal;

}




.ai-actions{

    display:flex;

    gap:10px;

    margin-top:18px;

    flex-wrap:wrap;

}



.ai-btn{

    background:#222;

    color:white;

    border:1px solid #333;

    padding:8px 14px;

    border-radius:999px;

    font-size:13px;

    cursor:pointer;

    transition:.2s;

}



.ai-btn:hover{

    background:#2563eb;

    border-color:#2563eb;

}




/* User Message Upgrade */


.user-bubble{

    background:#2563eb;

    color:white;

    padding:14px 18px;

    border-radius:22px 22px 5px 22px;

    max-width:80%;

    margin-left:auto;

    line-height:1.5;

}




/* Smooth Chat Animation */


.ai-message,
.user-bubble{

    animation:
    messageAppear .25s ease;

}



@keyframes messageAppear{


from{

opacity:0;

transform:translateY(10px);

}


to{

opacity:1;

transform:translateY(0);

}


}

// =====================================
// ChatTBM V4.1
// Part 4 - Better Memory + User Bubbles
// =====================================



// =============================
// Last Request Memory
// =============================

let lastUserRequest = "";





// =============================
// Upgrade User Message
// =============================

function addUserMessage(message){


chatBox.classList.remove("hidden");



lastUserRequest = message;



chatBox.innerHTML += `

<div class="flex justify-end mb-5">


<div class="user-bubble">

${message}

</div>


</div>

`;



chatBox.scrollTop =
chatBox.scrollHeight;



saveChat();


}




// =============================
// Save Last Request
// =============================

function saveLastRequest(){


localStorage.setItem(

"ChatTBM_Last_Request",

lastUserRequest

);


}




// =============================
// Load Last Request
// =============================

function loadLastRequest(){


const saved =

localStorage.getItem(
"ChatTBM_Last_Request"
);



if(saved){

lastUserRequest = saved;

}


}





// =============================
// Improved Regenerate
// =============================

function regenerateResponse(id){



const box =
document.getElementById(id);



if(!box){

return;

}



const content =
box.querySelector(".ai-content");



content.innerHTML =

`
⏳ Creating a new version...
`;



setTimeout(()=>{


let request =

lastUserRequest ||

chatMemory.topic ||

"Create a new idea";



let newReply;



if(typeof generateAIReply === "function"){


newReply =
generateAIReply(request);


}
else{


newReply =
createCompleteContent(request);


}



content.innerHTML =

newReply.replace(/\n/g,"<br>");



saveChat();



},1200);



}




// =============================
// Load Memory On Start
// =============================

loadLastRequest();




// =============================
// Part 4 Loaded
// =============================

console.log(
"💬 ChatTBM V4.1 Memory Upgrade Loaded"
);

// =====================================
// ChatTBM V4.1
// Part 5 - Final Connection
// =====================================



// =============================
// Better Loading Message
// =============================

function showThinking(){


const loader =
document.createElement("div");



loader.className =
"ai-message mb-5";



loader.innerHTML = `

<div class="ai-bubble">


<div class="ai-header">

🤖 <strong>ChatTBM</strong>

</div>


<div class="ai-content">

<span class="thinking">

Thinking...

</span>


</div>


</div>

`;



chatBox.appendChild(loader);



chatBox.scrollTop =
chatBox.scrollHeight;



return loader;


}





// =============================
// Safe Edit Mode
// =============================

function editResponse(id){


const box =
document.getElementById(id);



if(!box) return;



const content =
box.querySelector(".ai-content");



const current =
content.innerText;



const edited =
prompt(
"✏️ Edit ChatTBM response:",
current
);



if(
edited &&
edited.trim() !== ""
){


content.innerHTML =
edited
.replace(/\n/g,"<br>");



saveChat();



}


}





// =============================
// Save Before Leaving
// =============================

window.addEventListener(
"beforeunload",
()=>{


saveChat();

saveLastRequest();


}

);






// =============================
// V4.1 Feature Check
// =============================

function checkV41Features(){



console.log(
"Checking ChatTBM V4.1..."
);



if(
typeof copyResponse === "function"
){

console.log(
"✅ Copy system ready"
);

}



if(
typeof editResponse === "function"
){

console.log(
"✅ Edit system ready"
);

}



if(
typeof regenerateResponse === "function"
){

console.log(
"✅ Regenerate system ready"
);

}



console.log(
"🚀 ChatTBM V4.1 Ready"
);



}





checkV41Features();




// =============================
// END V4.1
// =============================
