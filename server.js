// =====================================
// ChatTBM Backend
// Conversation Memory System
// PART 1/3
// =====================================


require("dotenv").config();


const express = require("express");

const cors = require("cors");



const app = express();



app.use(cors());

app.use(express.json());





// =====================================
// CONVERSATION MEMORY
// =====================================


// Temporary memory storage
// Later we can move this to a database


const conversations = {};





// Create new conversation memory


function createConversation(id){


    if(!conversations[id]){


        conversations[id] = [];


    }


}






// Save message to memory


function saveMessage(id, role, message){


    createConversation(id);



    conversations[id].push({


        role: role,


        message: message,


        time: new Date()


    });


}






// Get previous conversation


function getConversation(id){


    createConversation(id);



    return conversations[id];


}








// =====================================
// HEALTH CHECK
// =====================================


app.get("/", (req,res)=>{


    res.json({


        app:"ChatTBM Backend",


        status:"Running ✅",


        memory:"Active 🧠"


    });


});

// =====================================
// CHATTBM RESPONSE ENGINE
// PART 2/3
// =====================================


function generateChatTBMResponse(message, history){


    const text = message.toLowerCase();




    // Check previous conversation context


    let previousContext = "";



    if(history.length > 1){


        previousContext = history
        .slice(-3)
        .map(item => item.message)
        .join(" ");

    }






    // ===============================
    // CAPTION GENERATOR
    // ===============================


    if(text.includes("caption")){


        return `

✍️ ChatTBM Caption Idea:

"Turning ideas into reality, one creation at a time.

Your story matters. Your content can inspire."

#Creator
#ContentCreation
#ChatTBM

${previousContext ? 
"I used our previous conversation to make this more personal." 
: ""}

`;

    }








    // ===============================
    // SCRIPT GENERATOR
    // ===============================


    if(text.includes("script")){


        return `

🎬 ChatTBM Video Script:

HOOK:
"Stop scrolling, this will change how you create content."

BODY:
Explain the problem, show your solution,
and provide value to your audience.

ENDING:
"Follow ChatTBM for more creator ideas."

`;

    }








    // ===============================
    // HASHTAGS
    // ===============================


    if(text.includes("hashtag")){


        return `

#ChatTBM
#AIContent
#ContentCreator
#ViralIdeas
#DigitalCreator
#CreatorLife

`;

    }








    // ===============================
    // VIRAL IDEAS
    // ===============================


    if(text.includes("idea")){


        return `

💡 Viral Content Ideas:

1. Behind the scenes of your work

2. Before and after transformation

3. Your biggest mistake and lesson

4. AI challenge videos

5. Customer success stories

`;

    }








    // ===============================
    // ADVERT CREATION
    // ===============================


    if(text.includes("advert")){


        return `

📢 Advert Structure:

Headline:
Grab attention immediately.

Problem:
Explain what people struggle with.

Solution:
Show how your product/service helps.

Action:
Tell customers what to do next.

`;

    }








    // ===============================
    // CONTENT CALENDAR
    // ===============================


    if(text.includes("calendar")){


        return `

📅 Weekly Content Calendar:

Monday:
Educational content

Wednesday:
Storytelling

Friday:
Trending topic

Sunday:
Community engagement

`;

    }








    // ===============================
    // DEFAULT CHAT
    // ===============================


    return `

Hello 👋 I am ChatTBM.

I remember our conversation during this session.

I can help you create:

✍️ Captions
🎬 Scripts
#️⃣ Hashtags
💡 Viral ideas
📢 Adverts
📅 Content calendars

Tell me what you want to create.

`;

}

// =====================================
// CHAT API
// PART 3/3
// =====================================


app.post("/api/chat", (req,res)=>{


    const message = req.body.message;


    const conversationId = 
    req.body.conversationId || "default-user";





    if(!message){


        return res.json({


            reply:"Please enter a message."


        });


    }






    // Save user message


    saveMessage(

        conversationId,

        "user",

        message

    );







    // Get conversation history


    const history = getConversation(

        conversationId

    );







    // Generate ChatTBM answer


    const reply = generateChatTBMResponse(

        message,

        history

    );







    // Save AI response


    saveMessage(

        conversationId,

        "assistant",

        reply

    );







    res.json({


        reply: reply,


        conversationId: conversationId


    });



});








// =====================================
// START SERVER
// =====================================


const PORT = process.env.PORT || 3000;



app.listen(PORT, ()=>{


    console.log(

        `🚀 ChatTBM Backend running on port ${PORT}`

    );


});
