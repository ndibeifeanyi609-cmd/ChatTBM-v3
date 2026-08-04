// =====================================
// ChatTBM V7.4
// Skill Router
//
// Purpose:
// - Detect user intent
// - Route messages to skills
// - Manage AI abilities
// =====================================



const ChatTBM_SkillRouter = {


    version: "7.4",


    skills: []


};







// =====================================
// REGISTER SKILL
// =====================================


function registerSkill(skill){


    ChatTBM_SkillRouter.skills.push(

        skill

    );


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

        text.includes("learn") ||

        text.includes("study") ||

        text.includes("explain") ||

        text.includes("science") ||

        text.includes("math")

    ){

        return "learning";

    }






    if(

        text.includes("business") ||

        text.includes("marketing") ||

        text.includes("sell")

    ){

        return "business";

    }






    if(

        text.includes("write") ||

        text.includes("caption") ||

        text.includes("story")

    ){

        return "writing";

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



if(

    window.ChatTBMGeneralSkill

){


    registerSkill(

        window.ChatTBMGeneralSkill

    );


}





if(

    window.ChatTBMLearningSkill

){


    registerSkill(

        window.ChatTBMLearningSkill

    );


}







console.log(

"✅ ChatTBM V7.4 Skill Router Loaded"

);
