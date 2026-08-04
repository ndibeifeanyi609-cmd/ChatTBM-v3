// =====================================
// ChatTBM V9.4
// Creator Intelligence Skill Router
//
// Upgrade:
// - Memory context support
// - Creator intelligence bridge
// - Existing skills compatibility
// - Context-aware routing
// - Safe fallback handling
// =====================================



const ChatTBM_SkillRouter = {


    version: "9.4",


    skills: []



};







// =====================================
// REGISTER SKILL
// =====================================


function registerSkill(skill){


    if(skill){


        ChatTBM_SkillRouter.skills.push(skill);



        console.log(

            "✅ Skill Registered:",

            skill.name

        );


    }


}







// =====================================
// DETECT INTENT
// =====================================


function detectIntent(message){


    const text =

    message.toLowerCase();







    if(

        text.includes("code") ||

        text.includes("javascript") ||

        text.includes("python") ||

        text.includes("html") ||

        text.includes("css")

    ){


        return "coding";


    }







    if(

        text.includes("explain") ||

        text.includes("learn") ||

        text.includes("study") ||

        text.includes("school") ||

        text.includes("exam") ||

        text.includes("photosynthesis")

    ){


        return "learning";


    }







    if(

        text.includes("write") ||

        text.includes("email") ||

        text.includes("caption") ||

        text.includes("story")

    ){


        return "writing";


    }







    if(

        text.includes("instagram") ||

        text.includes("reels") ||

        text.includes("content") ||

        text.includes("creator") ||

        text.includes("video ideas")

    ){


        return "creator";


    }







    if(

        text.includes("business") ||

        text.includes("marketing") ||

        text.includes("sales") ||

        text.includes("brand") ||

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("goal")

    ){


        return "business";


    }







    return "general";


}









// =====================================
// ROUTE MESSAGE
// =====================================


function routeMessage(

    message,

    memoryContext = "",

    creatorContext = null

){



    const intent =

    detectIntent(message);







    const context = {


        message,


        memoryContext,


        creatorContext,


        intent


    };







    console.log(

        "🎯 Intent:",

        intent

    );





    console.log(

        "🎬 Creator Context:",

        creatorContext

    );







    for(

        let skill of ChatTBM_SkillRouter.skills

    ){



        if(

            skill.canHandle(intent)

        ){



            try{



                // Context-based skills


                if(

                    skill.respond.length === 1

                ){



                    return skill.respond(

                        context

                    );


                }







                // Older skills


                return skill.respond(

                    message

                );



            }



            catch(error){



                console.error(

                    "❌ Skill Error:",

                    error

                );



                return null;


            }


        }


    }







    return null;


}









// =====================================
// STATUS
// =====================================


function getSkillStatus(){


    return {


        version:

        ChatTBM_SkillRouter.version,



        skills:

        ChatTBM_SkillRouter.skills.map(

            skill => skill.name

        )


    };


}









// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMRouter = {


    registerSkill,


    detectIntent,


    routeMessage,


    getSkillStatus


};









// =====================================
// AUTO REGISTER EXISTING SKILLS
// =====================================


if(window.ChatTBMGeneralSkill)

registerSkill(window.ChatTBMGeneralSkill);



if(window.ChatTBMLearningSkill)

registerSkill(window.ChatTBMLearningSkill);



if(window.ChatTBMCodingSkill)

registerSkill(window.ChatTBMCodingSkill);



if(window.ChatTBMWritingSkill)

registerSkill(window.ChatTBMWritingSkill);



if(window.ChatTBMBusinessSkill)

registerSkill(window.ChatTBMBusinessSkill);



if(window.ChatTBMCreatorSkill)

registerSkill(window.ChatTBMCreatorSkill);









console.log(

"🧠 ChatTBM V9.4 Creator Intelligence Router Loaded"

);
