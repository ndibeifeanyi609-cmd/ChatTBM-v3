// =====================================
// ChatTBM V9.9
// Creator Profile Object Bridge Skill
//
// Upgrade:
// - Direct creatorProfile support
// - Memory personalization
// - Creator intelligence context
// - Fitness brand awareness
// - Goal-based responses
// - Strategy preparation
// - Creator onboarding improvement
// =====================================



const CreatorSkill = {


    name: "Creator Assistant",


    version: "9.9",







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





        const profile =

        context.creatorProfile || {};







        let profileInfo = "";







        // =================================
        // CREATOR PROFILE DISPLAY
        // =================================


        if(

            profile.identity ||

            profile.niche ||

            profile.platform ||

            profile.goal

        ){



            profileInfo = `

🎯 Your Creator Profile:


${profile.identity ? "- Identity: " + profile.identity + "\n" : ""}

${profile.niche ? "- Niche: " + profile.niche + "\n" : ""}

${profile.platform ? "- Platform: " + profile.platform + "\n" : ""}

${profile.goal ? "- Goal: " + profile.goal + "\n" : ""}

${profile.strategy ? "- Strategy: " + profile.strategy + "\n" : ""}

`;

        }







        let strategyInfo = "";







        if(creator.fitness){


            strategyInfo +=

            "\n💪 Fitness niche detected";


        }







        if(creator.content){


            strategyInfo +=

            "\n🎬 Content creation detected";


        }







        if(creator.audience){


            strategyInfo +=

            "\n🎯 Audience growth detected";


        }







        if(creator.goal){


            strategyInfo +=

            `\n📈 Goal: ${creator.goal}`;


        }









        // =================================
        // CREATOR CONTENT REQUEST
        // =================================


        if(

            text.includes("instagram") ||

            text.includes("reels") ||

            text.includes("video ideas") ||

            text.includes("content ideas")

        ){


            return `🎬 Creator Assistant



${profileInfo}


${strategyInfo}



I understand your creator direction.


I can help you create:


• Instagram Reel ideas

• Viral hooks

• Video concepts

• Content calendars

• Audience growth strategies

• Monetization plans



For your fitness brand:


💪 Transformation stories

🔥 Before and after content

🏋️ Workout tutorials

🥗 Nutrition education

🎯 Motivation content

📈 Fitness challenges



Tell me:

• Your target audience

• Your fitness niche

• Your growth goal


and I will build your strategy.`;

        }









        // =================================
        // AUDIENCE REQUEST
        // =================================


        if(

            text.includes("audience") ||

            text.includes("followers")

        ){


            return `🎯 Creator Audience Assistant



${profileInfo}


${strategyInfo}



Based on your creator profile, I can help with:


• Finding your ideal audience

• Increasing followers

• Building community

• Improving engagement

• Creating better content direction


Tell me who you want to reach.`;

        }









        // =================================
        // GENERAL CREATOR REQUEST
        // =================================


        return `🎬 Creator Assistant



${profileInfo}


${strategyInfo}



I can help with:


• Creator strategy

• Content planning

• Brand growth

• Audience building

• Fitness content systems



Your request:

"${message}"`;



    }


};









// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMCreatorSkill = CreatorSkill;



console.log(

"🎬 ChatTBM V9.9 Creator Profile Object Bridge Skill Loaded"

);
