// =====================================
// ChatTBM V7.5
// Coding Skill
//
// Purpose:
// - Programming help
// - Explain code
// - Debug assistance
// - Development guidance
// =====================================



const CodingSkill = {


    name: "Coding Assistant",


    version: "7.5",





    canHandle(intent){


        return (

            intent === "coding"

        );


    },







    respond(message){


        const text =

        message.toLowerCase();







        // JavaScript


        if(

            text.includes("javascript") ||

            text.includes("js")

        ){


            return `💻 Coding Assistant


JavaScript helps you create interactive websites and applications.


I can help you with:

• Variables
• Functions
• Arrays
• Objects
• DOM manipulation
• Debugging
• Building projects


Tell me what JavaScript problem you are working on.`;

        }







        // HTML/CSS


        if(

            text.includes("html") ||

            text.includes("css")

        ){


            return `🌐 Web Development Assistant


I can help you build websites using:

• HTML structure
• CSS styling
• Responsive design
• Frontend improvements


Tell me what you want to create.`;

        }







        // Python


        if(

            text.includes("python")

        ){


            return `🐍 Python Assistant


I can help you learn Python:

• Variables
• Functions
• Automation
• Data handling
• Programming concepts


Tell me your Python question.`;

        }







        // General coding


        return `💻 Coding Assistant


I can help you with:

• Programming questions
• Debugging
• Explaining code
• Building software


Your question:

"${message}"`;



    }



};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCodingSkill = CodingSkill;



console.log(

"✅ ChatTBM Coding Skill Loaded"

);
