// =====================================
// ChatTBM V9.6
// Creator Profile Intelligence Skill
//
// Upgrade:
// - Memory personalization
// - Creator intelligence context
// - Creator profile awareness
// - Fitness brand awareness
// - Goal-based responses
// - Strategy preparation
// =====================================



const CreatorSkill = {


    name: "Creator Assistant",


    version: "9.6",







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





        const creator =

        context.creatorContext || {};







        let brandInfo = "";







        if(memory){



            brandInfo = `

🧠 Memory Context:

${memory}

`;

        }







        let profileInfo = "";







        try{


            if(

                window.ChatTBMCreatorProfile &&

                window.ChatTBMCreatorProfile.getCreatorSummary

            ){


                profileInfo =

                `

🎯 Creator Profile:

${window.ChatTBMCreatorProfile.getCreatorSummary()}

`;



            }


        }


        catch(error){


            console.error(

                "Creator Profile Error:",

                error

            );


        }








        let strategyInfo = "";







        if(creator.fitness){


            strategyInfo +=

            "\n💪 Fitness niche detected";


        }







        if(creator.content){


            strategyInfo +=

            "\n🎬 Content creation goal detected";


        }







        if(creator.audience){


            strategyInfo +=

            "\n🎯 Audience growth focus detected";


        }







        if(creator.goal){


            strategyInfo +=

            `\n📈 Goal: ${creator.goal}`;


        }









        // Instagram / Reels


        if(

            text.includes("instagram") ||

            text.includes("reels") ||

            text.includes("video ideas") ||

            text.includes("content ideas")

        ){


            return `🎬 Creator Assistant


${profileInfo}


${brandInfo}


${strategyInfo}



Based on your creator profile, I can help create:


• Instagram Reel ideas

• Video concepts

• Content calendars

• Viral hooks

• Audience growth strategies



For your fitness brand:


💪 Transformation journeys

🔥 Before and after stories

🏋️ Workout tutorials

🥗 Nutrition education

🎯 Motivation content

📈 Fitness challenges



Tell me:

• Your target audience

• Your fitness niche

• Your content goal


and I will build a complete strategy.`;

        }









        // Audience


        if(

            text.includes("audience") ||

            text.includes("followers")

        ){



            return `🎯 Creator Audience Assistant


${profileInfo}


${brandInfo}


${strategyInfo}



I can help you understand:


• Target audience

• Customer interests

• Follower growth

• Community building

• Content direction


Tell me who you want to reach.`;

        }









        return `🎬 Creator Assistant


${profileInfo}


${brandInfo}


${strategyInfo}



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

"🎬 ChatTBM V9.6 Creator Profile Intelligence Skill Loaded"

);
