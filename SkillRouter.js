// =====================================
// ChatTBM V8.5
// Clean Skill Router
//
// Upgrade:
// - Existing skills only
// - Memory context support
// - Compatible responses
// =====================================



const ChatTBM_SkillRouter = {


    version: "8.5",


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

        text.includes("compare") ||

        text.includes("research") ||

        text.includes("difference")

    ){

        return "research";

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

    memoryContext = ""

){



    const intent =

    detectIntent(message);





    const context = {


        message,


        memoryContext,


        intent


    };





    console.log(

        "🎯 Intent:",

        intent

    );







    for(

        let skill of ChatTBM_SkillRouter.skills

    ){



        if(

            skill.canHandle(intent)

        ){



            try{



                return skill.respond(

                    context

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



if(window.ChatTBMResearchSkill)

registerSkill(window.ChatTBMResearchSkill);



if(window.ChatTBMBusinessSkill)

registerSkill(window.ChatTBMBusinessSkill);







console.log(

"🧠 ChatTBM V8.5 Clean Skill Router Loaded"

);
