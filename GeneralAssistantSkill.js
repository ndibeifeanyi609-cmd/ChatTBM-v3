// =====================================
// ChatTBM V7.3
// General Assistant Skill
//
// Purpose:
// - Handle general questions
// - Provide basic assistant responses
// - Act as fallback skill
// =====================================



const GeneralAssistantSkill = {

    name: "General Assistant",

    version: "7.3",


    canHandle(intent){

        return (

            intent === "general"

        );

    },





    respond(message){


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

I can help you with questions, learning, writing, coding, ideas, and problem solving.

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

As my skills expand, I'll become capable of handling more advanced tasks.`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMGeneralSkill = GeneralAssistantSkill;



console.log(
"✅ ChatTBM General Assistant Skill Loaded"
);
