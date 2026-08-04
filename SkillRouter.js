// =====================================
// ChatTBM V8.0
// Smart Skill Router
//
// Upgrade:
// - Better intent priority
// - Context-aware routing
// - Improved AI assistant behavior
// =====================================



const ChatTBM_SkillRouter = {


    version: "8.0",


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


    const text = message.toLowerCase();





    // ================================
    // PROBLEM SOLVING FIRST
    // ================================


    if(

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("goal") ||

        text.includes("solve") ||

        text.includes("problem") ||

        text.includes("issue") ||

        text.includes("fix") ||

        text.includes("decision") ||

        text.includes("choose") ||

        text.includes("how do i")

    ){

        return "problem";

    }







    // ================================
    // CODING
    // ================================


    if(

        text.includes("code") ||

        text.includes("coding") ||

        text.includes("javascript") ||

        text.includes("python") ||

        text.includes("html") ||

        text.includes("css") ||

        text.includes("program")

    ){

        return "coding";

    }







    // ================================
    // LEARNING
    // ================================


    if(

        text.includes("explain") ||

        text.includes("learn") ||

        text.includes("study") ||

        text.includes("science") ||

        text.includes("math") ||

        text.includes("school")

    ){

        return "learning";

    }







    // ================================
    // WRITING
    // ================================


    if(

        text.includes("write") ||

        text.includes("email") ||

        text.includes("rewrite") ||

        text.includes("story") ||

        text.includes("caption") ||

        text.includes("post")

    ){

        return "writing";

    }







    // ================================
    // RESEARCH
    // ================================


    if(

        text.includes("compare") ||

        text.includes("difference") ||

        text.includes("research") ||

        text.includes("summary") ||

        text.includes("summarize") ||

        text.includes("information")

    ){

        return "research";

    }







    // ================================
    // BUSINESS
    // ================================


    if(

        text.includes("business") ||

        text.includes("marketing") ||

        text.includes("sales") ||

        text.includes("sell") ||

        text.includes("brand")

    ){

        return "business";

    }







    return "general";


}







// =====================================
// ROUTE MESSAGE
// =====================================


function routeMessage(message){


    const intent = detectIntent(message);


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


            return skill.respond(message);


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

"✅ ChatTBM V8.0 Smart Router Loaded"

);
