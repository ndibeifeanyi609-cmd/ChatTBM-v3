// =====================================
// ChatTBM V9.1
// Creator Skill
//
// Purpose:
// - Content ideas
// - Social media strategy
// - Creator planning
// - Audience growth support
// =====================================



const CreatorSkill = {


    name: "Creator Assistant",


    version: "9.1",






    canHandle(intent){


        return (

            intent === "creator"

        );


    },







    respond(context){



        const message =

        context.message;



        const text =

        message.toLowerCase();







        // Instagram / Reels


        if(

            text.includes("instagram") ||

            text.includes("reels") ||

            text.includes("video ideas") ||

            text.includes("content ideas")

        ){


            return `🎬 Creator Assistant


I can help you create:

• Instagram Reel ideas
• Video concepts
• Content calendars
• Viral hooks
• Audience growth strategies


For your fitness brand, I can help plan:

💪 Workout content

🔥 Transformation stories

🥗 Fitness tips

🎯 Motivation videos

📈 Growth strategies


Tell me your target audience and content goal.`;

        }







        // Audience


        if(

            text.includes("audience") ||

            text.includes("followers")

        ){


            return `🎯 Creator Audience Assistant


I can help you understand:

• Target audience
• Followers
• Customer interests
• Content direction
• Community growth


Tell me who you want to reach.`;

        }







        return `🎬 Creator Assistant


I can help with:

• Content ideas
• Social media strategy
• Creator planning
• Audience growth
• Brand content


Your request:

"${message}"`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorSkill = CreatorSkill;



console.log(

"🎬 ChatTBM V9.1 Creator Skill Loaded"

);
