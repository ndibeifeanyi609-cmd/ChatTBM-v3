// =====================================
// ChatTBM V7.9
// Problem Solving Skill
//
// Purpose:
// - Solve problems
// - Give step-by-step guidance
// - Planning assistance
// - Decision support
// =====================================



const ProblemSolvingSkill = {


    name: "Problem Solving Assistant",


    version: "7.9",






    canHandle(intent){


        return (

            intent === "problem"

        );


    },







    respond(message){


        const text =

        message.toLowerCase();







        if(

            text.includes("plan") ||

            text.includes("strategy") ||

            text.includes("goal")

        ){


            return `🧩 Problem Solving Assistant


I can help you create:

• Step-by-step plans
• Strategies
• Goals
• Action steps
• Solutions


Tell me what you want to achieve.`;

        }







        if(

            text.includes("problem") ||

            text.includes("issue") ||

            text.includes("fix")

        ){


            return `🧩 Problem Solving Assistant


Let's solve it step by step.


I can help you:

• Understand the problem
• Find possible causes
• Explore solutions
• Choose the best approach


Describe the problem you are facing.`;

        }







        if(

            text.includes("decision") ||

            text.includes("choose")

        ){


            return `🧩 Decision Assistant


I can help you compare options by looking at:

• Benefits
• Risks
• Cost
• Long-term effects


Tell me the choices you are considering.`;

        }







        return `🧩 Problem Solving Assistant


I can help you with:

• Planning
• Troubleshooting
• Decisions
• Finding solutions
• Organizing ideas


Your problem:

"${message}"`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMProblemSkill = ProblemSolvingSkill;



console.log(

"✅ ChatTBM Problem Solving Skill Loaded"

);
