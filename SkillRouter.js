// =====================================
// ChatTBM V8.3
// Context Aware Skill Router
//
// Upgrade:
// - Receives memory context
// - Sends context to skills
// - Better conversation understanding
// =====================================



const ChatTBM_SkillRouter = {


    version: "8.3",


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







    // Problem solving first


    if(

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("goal") ||

        text.includes("solve") ||

        text.includes("problem") ||

        text.includes("fix") ||

        text.includes("how do i")

    ){

        return "problem";

    }







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

        text.includes("study")

    ){

        return "learning";

    }







    if(

        text.includes("write") ||

        text.includes("email") ||

        text.includes("caption")

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

        text.includes("sales")

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





    console.log(

        "🎯 Intent:",

        intent

    );







    const context = {


        message,


        memoryContext,


        intent


    };







    for(

        let skill of ChatTBM_SkillRouter.skills

    ){



        if(

            skill.canHandle(intent)

        ){



            return skill.respond(

                context

            );


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
// AUTO REGISTER
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


if(window.ChatTBMResearchSkill)

registerSkill(window.ChatTBMResearchSkill);


if(window.ChatTBMProblemSkill)

registerSkill(window.ChatTBMProblemSkill);







console.log(

"🧠 ChatTBM V8.3 Context Router Loaded"

);
