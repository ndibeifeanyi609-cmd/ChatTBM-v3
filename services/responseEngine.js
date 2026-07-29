// =====================================
// ChatTBM V5.9.2
// Smart Response Engine
// Memory Intelligence Upgrade
// Part 2
// =====================================


const {

    handleContextRequest

} = require("./contextEngine");





// =====================================
// MEMORY INTERPRETER
// =====================================


function understandMemory(longTermMemory = []){


    let memoryText = "";



    if(

        !Array.isArray(longTermMemory) ||

        longTermMemory.length === 0

    ){

        return "";

    }




    const memories =

    longTermMemory.slice(0,5);





    memories.forEach(memory=>{



        if(

            memory.type === "platform"

        ){


            memoryText +=

            `\n🧠 I remember you create content for ${memory.value}.`;


        }





        else if(

            memory.type === "project"

        ){


            memoryText +=

            `\n🧠 I remember you are working on ${memory.value}.`;


        }





        else if(

            memory.type === "goal"

        ){


            memoryText +=

            `\n🎯 I remember your goal: ${memory.value}.`;


        }





        else if(

            memory.type === "preference"

        ){


            memoryText +=

            `\n🎨 I remember your preference: ${memory.value}.`;


        }



    });



    return memoryText;


}








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



    const text =

    message.trim().toLowerCase();





    let response = "";





    // =====================================
    // CONTEXT CHECK
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
    // GREETING
    // =====================================


    if(

        text === "hi" ||

        text === "hello" ||

        text === "hey"

    ){


        return `Hello 👋

Welcome back to ChatTBM.

I'm your AI Content Assistant.

I can help with:

✍️ Captions
🎬 Scripts
💡 Viral Ideas
📢 Marketing
📅 Content Planning

What are we creating today?`;


    }







    // =====================================
    // IDENTITY
    // =====================================


    if(text.includes("who are you")){


        return `I'm ChatTBM 🤖

Your AI Content Assistant for creating content ideas, scripts, captions, marketing plans, and creative strategies.

I can also learn useful information from our conversations to personalize future responses.`;


    }







    // =====================================
    // INTENT RESPONSES
    // =====================================


    switch(intent){



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

`I can help create your caption ✍️

Tell me:

• What is the post about?
• Platform
• Tone

I'll create something that fits your audience.`;


        break;





        case "content_creation":


            response =

`Great! Let's create content.

Tell me your:

• Topic
• Audience
• Platform
• Goal

I'll build it with you.`;


        break;





        case "idea_generation":


            response =

`Let's generate ideas 💡

Tell me your niche and I'll create fresh content concepts.`;


        break;





        case "marketing":


            response =

`I can help with marketing, adverts, and audience growth.

Tell me what you want to promote.`;


        break;





        default:


            response =

`I understand your request.

Give me more details so I can create a better response.`;


    }







    // =====================================
    // ADD SMART MEMORY
    // =====================================


    response +=

    understandMemory(

        longTermMemory

    );








    // =====================================
    // CONVERSATION MEMORY
    // =====================================


    if(

        facts &&

        facts.lastMessage

    ){


        response +=

        `\n📚 I can continue from our previous conversation context.`;


    }







    // =====================================
    // PERSONALIZATION
    // =====================================


    if(

        aiContext &&

        aiContext.context

    ){


        response +=

`

🤖 Personalization:

Platform: ${aiContext.context.platform}

Tone: ${aiContext.context.tone}

Style: ${aiContext.context.writingStyle}`;


    }





    return response;


}





module.exports = {


    generateResponse


};
