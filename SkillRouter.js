// =====================================
// ChatTBM V8.4
// Compatible Skill Router
//
// Upgrade:
// - Memory context support
// - Old skill compatibility
// - New context skills support
// =====================================



const ChatTBM_SkillRouter = {


    version: "8.4",


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

        text.includes("plan") ||

        text.includes("strategy") ||

        text.includes("goal") ||

        text.includes("problem") ||

        text.includes("solve") ||

        text.includes("how do i")

    ){

        return "problem";

    }







    if(

        text.includes("business") ||

        text.includes("marketing") ||

        text.includes("sales") ||

        text.includes("brand")

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



                // New context skills


                if(

                    skill.respond.length === 1

                ){



                    return skill.respond(

                        context

                    );


                }







                // Old message skills


                return skill.respond(

                    message

                );





            }

            catch(error){



                console.error(

                    "Skill Error:",

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
// GLOBAL
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

"🧠 ChatTBM V8.4 Compatible Router Loaded"

);
