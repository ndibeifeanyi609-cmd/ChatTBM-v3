// =====================================
// ChatTBM Backend
// Creator AI Response Engine
// =====================================


require("dotenv").config();

const express = require("express");
const cors = require("cors");


const app = express();


app.use(cors());

app.use(express.json());





// ===============================
// HEALTH CHECK
// ===============================


app.get("/", (req,res)=>{


    res.json({

        app:"ChatTBM Backend",

        status:"Running ✅"

    });


});








// ===============================
// CHATTBM AI RESPONSE ENGINE
// ===============================


function generateChatTBMResponse(message){


    const text = message.toLowerCase();





    if(text.includes("caption")){


        return `

🔥 Caption Idea:

"Building dreams one step at a time. 
Every idea starts with a simple thought."

#Creator #ContentCreation #ChatTBM

`;

    }







    if(text.includes("script")){


        return `

🎬 Video Script:

HOOK:
"Stop scrolling, you need to see this..."

BODY:
Explain your idea, show the process,
and give viewers something valuable.

ENDING:
"Follow for more creative ideas."

`;

    }







    if(text.includes("hashtag")){


        return `

#ChatTBM
#ContentCreator
#ViralContent
#AIContent
#DigitalCreator

`;

    }







    if(text.includes("idea")){


        return `

💡 Viral Content Ideas:

1. Before and after transformation

2. Behind the scenes

3. AI challenge videos

4. Storytelling videos

5. Reaction content

`;

    }







    if(text.includes("advert")){


        return `

📢 Advert Template:

Attention:
Grab the customer's interest.

Problem:
Show what needs solving.

Solution:
Explain your service.

Call To Action:
Tell people what to do next.

`;

    }







    if(text.includes("calendar")){


        return `

📅 Weekly Content Calendar:

Monday:
Educational post

Wednesday:
Storytelling video

Friday:
Trending content

Sunday:
Audience engagement post

`;

    }








    return `

Hello 👋 I am ChatTBM.

I help creators with:

✍️ Captions
🎬 Scripts
#️⃣ Hashtags
💡 Viral ideas
📢 Advert creation
📅 Content planning

Tell me what you want to create.

`;

}









// ===============================
// CHAT API
// ===============================


app.post("/api/chat",(req,res)=>{


    const message = req.body.message;



    const reply = generateChatTBMResponse(message);



    res.json({

        reply:reply

    });



});







// ===============================
// START SERVER
// ===============================


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{


    console.log(

        `🚀 ChatTBM Backend running on port ${PORT}`

    );


});
