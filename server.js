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


// =====================================
// CHATTBM BETTER RESPONSE ENGINE
// =====================================


function generateChatTBMResponse(message, history){


    const text = message.toLowerCase();



    // Remember recent conversation

    let context = "";


    if(history.length > 1){


        context = history
        .slice(-4)
        .map(item => item.message)
        .join(" ");


    }





    // ===============================
    // GREETING
    // ===============================


    if(
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ){


        return `

Hello 👋 Welcome to ChatTBM.

I am your AI Content Assistant.

I can help you create:

✍️ Captions
🎬 Video Scripts
#️⃣ Hashtags
💡 Viral Content Ideas
📢 Advert Concepts
📅 Content Plans

What are we creating today?

`;

    }





    // ===============================
    // BRAND / BUSINESS QUESTIONS
    // ===============================


    if(
        text.includes("brand") ||
        text.includes("business") ||
        text.includes("company")
    ){


        return `

Great! I can help you build content for your brand.

Tell me:

1. What is your business about?
2. Who is your target audience?
3. What platform are you creating for?

Then I can create captions, scripts and marketing ideas.

`;

    }





    // ===============================
    // CAPTION
    // ===============================


    if(text.includes("caption")){


        return `

✍️ Here is a content caption:

"Your ideas deserve attention.
Create. Improve. Share your story with the world."

Suggested hashtags:

#ChatTBM
#ContentCreator
#DigitalCreator
#CreativeIdeas

`;

    }





    // ===============================
    // VIDEO SCRIPT
    // ===============================


    if(text.includes("script") || text.includes("video")){


        return `

🎬 Video Script:

HOOK:
"Most people don't know this..."

BODY:
Explain the problem.
Show your solution.
Give viewers valuable information.

ENDING:
"Follow for more content ideas."

`;

    }





    // ===============================
    // VIRAL IDEAS
    // ===============================


    if(
        text.includes("viral") ||
        text.includes("idea")
    ){


        return `

💡 Viral Content Ideas:

1. Tell your story

2. Show behind the scenes

3. Share your biggest lesson

4. Make a before and after video

5. Answer common audience questions

`;

    }





    // ===============================
    // ADVERT
    // ===============================


    if(
        text.includes("advert") ||
        text.includes("marketing")
    ){


        return `

📢 Advert Formula:

Attention:
Create a powerful first line.

Problem:
Show the customer's challenge.

Solution:
Explain your offer.

Action:
Tell them what to do next.

`;

    }





    // ===============================
    // CONTENT PLAN
    // ===============================


    if(
        text.includes("calendar") ||
        text.includes("plan")
    ){


        return `

📅 Content Plan:

Monday:
Educational content

Tuesday:
Behind the scenes

Wednesday:
Storytelling

Friday:
Promotion

Sunday:
Community engagement

`;

    }





    // ===============================
    // FOLLOW UP MEMORY
    // ===============================


    if(context){


        return `

I remember our previous discussion.

Based on what you shared:

"${context.substring(0,150)}..."

I can help you improve that idea.

What would you like to create next?

`;

    }





    // ===============================
    // DEFAULT CHAT
    // ===============================


    return `

I understand.

I can help you turn your idea into content.

Tell me:

- What are you creating?
- Who is your audience?
- Which platform are you using?

I will help you build it.

`;

}


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
