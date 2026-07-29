// =====================================
// ChatTBM V5.9.1
// Smart Response Engine
// AI Personality + Memory + Context
// =====================================


const {
    handleContextRequest

} = require("./contextEngine");




// =====================================
// MAIN RESPONSE GENERATOR
// =====================================


function generateResponse(

    intent,

    message,

    memory = {},

    history = [],

    facts = {},

    timeline = [],

    aiContext = {},

    longTermMemory = []

){


    let response = "";

    const text =

    message.trim().toLowerCase();





    // =====================================
    // CONTEXT ENGINE
    // =====================================


    const contextResult =

    handleContextRequest(

        message,

        history

    );


    if(contextResult.matched){

        return contextResult.response;

    }






    // =====================================
    // GREETINGS
    // =====================================


    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ){


        return `Hello 👋

Welcome back to ChatTBM.

I'm your AI Content Assistant.

I can help you create:

✍️ Captions
🎬 Video Scripts
💡 Viral Ideas
📢 Marketing Content
📅 Content Plans
🏷️ Hashtags

What are we creating today?`;

    }







    // =====================================
    // THANK YOU
    // =====================================


    if(text.includes("thank")){


        return `You're welcome 😊

I'm always ready to help you create better content and develop your ideas.`;

    }







    // =====================================
    // IDENTITY
    // =====================================


    if(text.includes("who are you")){


        return `I'm ChatTBM 🤖

Your AI Content Assistant designed to help with content creation, ideas, scripts, marketing, and personalized assistance.

I can learn your preferences and remember important information to improve future conversations.`;

    }







    // =====================================
    // EMPTY MESSAGE
    // =====================================


    if(text.length === 0){


        return "Please type a message.";

    }







    // =====================================
    // INTENT RESPONSE
    // =====================================


    switch(intent){



        case "content_creation":


            response =

`I can help you create content.

Tell me:

• Topic
• Platform
• Audience
• Goal

I'll create something customized for you.`;


        break;





        case "script_generation":


            response =

`Let's create your script 🎬

Tell me:

• Video topic
• Duration
• Platform
• Style

I'll help structure the full script.`;


        break;





        case "caption_generation":


            response =

`I can create an engaging caption.

Tell me:

• What the post is about
• Platform
• Tone

I'll generate a caption that fits your content.`;


        break;





        case "marketing":


            response =

`I can help create marketing strategies, adverts, and promotional ideas.

Tell me what you want to promote and who your audience is.`;


        break;





        case "idea_generation":


            response =

`Let's generate fresh ideas 💡

Tell me your niche and I'll create content concepts for you.`;


        break;





        case "question":


            response =

`I'll help answer your question.

Give me more details and I'll provide the best response possible.`;


        break;





        default:


            response =

`I understand.

Give me more details so I can provide a better answer.`;



    }








    // =====================================
    // LONG TERM MEMORY
    // V5.9.1
    // =====================================


    if(

        longTermMemory &&

        longTermMemory.length > 0

    ){


        const memory =

        longTermMemory[0];



        if(memory.value){


            response +=

`\n\n🧠 Memory:

I remember something related to:

"${memory.value}"`;

        }


    }







    // =====================================
    // USER FACT MEMORY
    // =====================================


    if(

        facts &&

        facts.lastMessage

    ){


        response +=

`\n\n📚 I can use our previous conversation context to keep the discussion connected.`;

    }







    // =====================================
    // RECENT HISTORY
    // =====================================


    if(

        history &&

        history.length > 3

    ){


        response +=

`\n💬 I have recent conversation history available, so I can continue from where we stopped.`;

    }







    // =====================================
    // AI PERSONALIZATION
    // =====================================


    if(

        aiContext &&

        aiContext.context

    ){


        response +=

`

🤖 Personalization active:

Platform: ${aiContext.context.platform}

Tone: ${aiContext.context.tone}

Style: ${aiContext.context.writingStyle}`;

    }






    return response;


}





// =====================================
// EXPORT
// =====================================


module.exports = {


    generateResponse


};
