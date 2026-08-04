// =====================================
// ChatTBM V7.7
// Skill Router
//
// Purpose:
// - Detect user intent
// - Register AI skills
// - Route messages
// =====================================



const ChatTBM_SkillRouter = {


    version: "7.7",


    skills: []


};







// =====================================
// REGISTER SKILL
// =====================================


function registerSkill(skill){


    if(skill){


        ChatTBM_SkillRouter.skills.push(

            skill

        );


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

        text.includes("coding") ||

        text.includes("javascript") ||

        text.includes("python") ||

        text.includes("html") ||

        text.includes("css") ||

        text.includes("program")

    ){

        return "coding";

    }







    if(

        text.includes("learn") ||

        text.includes("study") ||

        text.includes("explain") ||

        text.includes("science") ||

        text.includes("math") ||

        text.includes("school")

    ){

        return "learning";

    }







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







    if(

        text.includes("business") ||

        text.includes("marketing") ||

        text.includes("sales") ||

        text.includes("sell") ||

        text.includes("brand") ||

        text.includes("branding")

    ){

        return "business";

    }







    return "general";


}







// =====================================
// ROUTE MESSAGE
// =====================================


function routeMessage(message){



    const intent =

    detectIntent(message);





    console.log(

        "🎯 Intent:",

        intent

    );







    for(

        let skill of

        ChatTBM_SkillRouter.skills

    ){



        if(

            skill.canHandle(intent)

        ){



            return skill.respond(

                message

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
// AUTO REGISTER SKILLS
// =====================================



if(window.ChatTBMGeneralSkill){

    registerSkill(
        window.ChatTBMGeneralSkill
    );

}



if(window.ChatTBMLearningSkill){

    registerSkill(
        window.ChatTBMLearningSkill
    );

}



if(window.ChatTBMCodingSkill){

    registerSkill(
        window.ChatTBMCodingSkill
    );

}



if(window.ChatTBMWritingSkill){

    registerSkill(
        window.ChatTBMWritingSkill
    );

}



if(window.ChatTBMBusinessSkill){

    registerSkill(
        window.ChatTBMBusinessSkill
    );

}







console.log(

"✅ ChatTBM V7.7 Skill Router Loaded"

);
