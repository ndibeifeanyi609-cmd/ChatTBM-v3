// =====================================
// ChatTBM V7.4
// Learning Skill
//
// Purpose:
// - Explain concepts
// - Help with studying
// - Answer educational questions
// =====================================



const LearningSkill = {


    name: "Learning Assistant",


    version: "7.4",





    canHandle(intent){


        return (

            intent === "learning"

        );


    },






    respond(message){


        const text =
        message.toLowerCase();





        // Photosynthesis

        if(

            text.includes("photosynthesis")

        ){


            return `🌱 Photosynthesis Explained


Photosynthesis is the process plants use to make their own food using sunlight.


It happens mainly in the leaves inside structures called chloroplasts.


Plants use:

☀️ Sunlight

💧 Water

🌫️ Carbon dioxide


to produce:

🍬 Glucose (food energy)

🌬️ Oxygen


The process has two main stages:


1. Light-dependent reactions

- Sunlight is captured by chlorophyll.
- Water is split.
- Oxygen is released.


2. Light-independent reactions (Calvin cycle)

- Carbon dioxide is used to build glucose.


In simple words:

Plants use sunlight to convert water and carbon dioxide into food and oxygen.`;


        }






        // General learning response


        return `📚 Learning Assistant


I can help explain:

• Science
• Mathematics
• Technology
• History
• General concepts


Question:

"${message}"


I will break it down into simple steps.`;



    }



};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMLearningSkill = LearningSkill;



console.log(
"✅ ChatTBM Learning Skill Loaded"
);
