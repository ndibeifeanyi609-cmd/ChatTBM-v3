// =====================================
// ChatTBM V8.5
// General Assistant Skill
//
// Upgrade:
// - Router V8.5 compatible
// - Context support
// - Fallback assistant
// =====================================



const GeneralAssistantSkill = {


    name: "General Assistant",


    version: "8.5",





    canHandle(intent){


        return (

            intent === "general"

        );


    },







    respond(context){



        const message =

        typeof context === "string"

        ? context

        : context.message;





        const text =

        message.toLowerCase();







        // Greetings


        if(

            text.includes("hello") ||

            text.includes("hi") ||

            text.includes("hey")

        ){


            return `👋 Hello!


I'm ChatTBM, your personal AI assistant.


I can help you with:

• Questions

• Learning

• Writing

• Coding

• Business ideas

• Research


How can I help you today?`;

        }







        // Thanks


        if(

            text.includes("thank")

        ){


            return `You're welcome! 😊


I'm here whenever you need help.`;

        }







        // Default


        return `🤖 ChatTBM General Assistant


You asked:

"${message}"


I'm ready to help you solve problems, learn new things, create ideas, and explore different topics.


My skills will continue expanding as ChatTBM develops.`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMGeneralSkill = GeneralAssistantSkill;



console.log(

"✅ ChatTBM V8.5 General Assistant Skill Loaded"

);
