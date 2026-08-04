// =====================================
// ChatTBM V9.2
// Memory Powered Creator Skill
//
// Upgrade:
// - Memory personalization
// - Brand-aware content ideas
// - Creator strategy support
// - Audience growth preparation
// =====================================



const CreatorSkill = {


    name: "Creator Assistant",


    version: "9.2",






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



        const memory =

        context.memoryContext || "";







        let brandInfo = "";







        if(

            memory

        ){


            brandInfo = `

🧠 I remember your previous information:

${memory}

`;

        }







        // Instagram / Reels


        if(

            text.includes("instagram") ||

            text.includes("reels") ||

            text.includes("video ideas") ||

            text.includes("content ideas")

        ){


            return `🎬 Creator Assistant


${brandInfo}


I can help you create:

• Instagram Reel ideas
• Video concepts
• Content calendars
• Viral hooks
• Audience growth strategies


For your fitness brand, content ideas include:


💪 Workout transformation videos

🔥 Before and after stories

🥗 Nutrition tips

🎯 Motivation clips

🏋️ Exercise tutorials

📈 Fitness challenges


Tell me:

• Your target audience
• Your fitness niche
• Your content goal

and I will build a strategy.`;

        }







        // Audience


        if(

            text.includes("audience") ||

            text.includes("followers")

        ){


            return `🎯 Creator Audience Assistant


${brandInfo}


I can help you understand:


• Target audience

• Followers

• Customer interests

• Community growth

• Content direction


Tell me who you want to reach.`;

        }







        return `🎬 Creator Assistant


${brandInfo}


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

"🎬 ChatTBM V9.2 Memory Powered Creator Skill Loaded"

);
