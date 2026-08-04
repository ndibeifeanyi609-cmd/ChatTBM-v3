// =====================================
// ChatTBM V10.0
// Learning Intelligence Skill
//
// Upgrade:
// - Memory-aware learning
// - Learner profile support
// - Personalized explanations
// - Learning goal detection
// - Difficulty adaptation
// - Previous topic awareness
// - Context compatible
// =====================================



const LearningSkill = {


    name: "Learning Assistant",


    version: "10.0",







    canHandle(intent){


        return (

            intent === "learning"

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

🧠 Learning Memory:

${memory}

`;

        }







        let learningStyle = "";







        if(

            text.includes("simple") ||

            text.includes("explain")

        ){


            learningStyle =

            "I will explain this in simple steps.";

        }

        else{


            learningStyle =

            "I will break this down clearly.";

        }









        // =================================
        // PHOTOSYNTHESIS
        // =================================


        if(

            text.includes("photosynthesis")

        ){


            return `📚 Learning Assistant



${memoryInfo}



${learningStyle}



🌱 Photosynthesis Explained


Photosynthesis is the process plants use to make their own food using sunlight.


Plants need:


☀️ Sunlight

💧 Water

🌫️ Carbon dioxide


They produce:


🍬 Glucose (food energy)

🌬️ Oxygen


Main stages:


1. Light-dependent reactions

- Chlorophyll captures sunlight.
- Water is broken down.
- Oxygen is released.


2. Calvin Cycle

- Carbon dioxide is converted into glucose.


Simple meaning:


Plants use sunlight, water, and carbon dioxide to create food and release oxygen.`;

        }









        // =================================
        // GENERAL LEARNING
        // =================================


        return `📚 Learning Assistant



${memoryInfo}



I can help you learn:


• Science

• Mathematics

• Technology

• History

• Programming

• General concepts



Learning approach:


${learningStyle}



Your question:


"${message}"


I will explain it step by step.`;



    }


};









// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMLearningSkill = LearningSkill;



console.log(

"📚 ChatTBM V10.0 Learning Intelligence Skill Loaded"

);
