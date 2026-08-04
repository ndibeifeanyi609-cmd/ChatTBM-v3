// =====================================
// ChatTBM V10.0
// Coding Intelligence Skill
//
// Upgrade:
// - Memory-aware coding assistant
// - Project context support
// - Programming language detection
// - Debugging assistance
// - Beginner/intermediate support
// - Personalized coding responses
// - Context compatible
// =====================================



const CodingSkill = {


    name: "Coding Assistant",


    version: "10.0",







    canHandle(intent){


        return (

            intent === "coding"

        );


    },









    respond(context){



        const message =

        typeof context === "string"

        ? context

        : context.message;





        const memory =

        typeof context === "object"

        ? context.memoryContext || ""

        : "";





        const text =

        message.toLowerCase();







        let memoryInfo = "";







        if(memory){


            memoryInfo = `

🧠 Coding Memory:

${memory}

`;

        }









        // =================================
        // JAVASCRIPT
        // =================================


        if(

            text.includes("javascript") ||

            text.includes(" js") ||

            text.includes("node")

        ){


            return `💻 JavaScript Coding Assistant



${memoryInfo}



JavaScript helps build interactive websites, applications, and backend systems.


I can help with:


• Variables

• Functions

• Arrays

• Objects

• DOM manipulation

• APIs

• Debugging

• Project architecture



Tell me your JavaScript problem and I will guide you step by step.`;

        }









        // =================================
        // HTML / CSS
        // =================================


        if(

            text.includes("html") ||

            text.includes("css") ||

            text.includes("website")

        ){


            return `🌐 Web Development Assistant



${memoryInfo}



I can help you build websites using:


• HTML structure

• CSS styling

• Responsive layouts

• UI improvements

• Frontend organization



Tell me what you want to create or improve.`;

        }









        // =================================
        // PYTHON
        // =================================


        if(

            text.includes("python")

        ){


            return `🐍 Python Coding Assistant



${memoryInfo}



I can help you with:


• Python basics

• Functions

• Automation

• Data handling

• Programming concepts

• Debugging



Tell me your Python question.`;

        }









        // =================================
        // DEBUGGING
        // =================================


        if(

            text.includes("error") ||

            text.includes("bug") ||

            text.includes("fix")

        ){


            return `🛠️ Debugging Assistant



${memoryInfo}



I can help you:


• Find coding errors

• Explain error messages

• Improve code structure

• Fix problems step by step



Send the code and the error message.`;

        }









        // =================================
        // GENERAL CODING
        // =================================


        return `💻 Coding Assistant



${memoryInfo}



I can help you with:


• Programming questions

• Debugging

• Code explanation

• Software projects

• Learning programming



Your question:


"${message}"


I will guide you step by step.`;



    }


};









// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCodingSkill = CodingSkill;



console.log(

"💻 ChatTBM V10.0 Coding Intelligence Skill Loaded"

);
