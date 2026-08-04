// =====================================
// ChatTBM V10.0
// Writing Intelligence Skill
//
// Upgrade:
// - Memory awareness
// - Creator profile support
// - Social media intelligence
// - Caption generation
// - Script writing
// - Brand voice support
// - Professional writing
// =====================================


const WritingSkill = {


    name: "Writing Intelligence Assistant",


    version: "10.0",





    canHandle(intent){


        return (

            intent === "writing"

        );


    },







    respond(context){



        const message =

        typeof context === "string"

        ? context

        : context.message;





        const text =

        message.toLowerCase();





        const memory =

        context.memoryContext || "";





        const creator =

        context.creatorContext || {};








        let creatorInfo = "";







        if(creator.fitness){


            creatorInfo +=

            "\n💪 Fitness creator style detected";


        }







        if(creator.platform){


            creatorInfo +=

            `\n📱 Platform: ${creator.platform}`;


        }







        if(creator.goal){


            creatorInfo +=

            `\n🎯 Goal: ${creator.goal}`;


        }







        // =================================
        // CAPTION WRITING
        // =================================


        if(

            text.includes("caption") ||

            text.includes("instagram") ||

            text.includes("post")

        ){


            return `📱 Social Media Writing Assistant



${creatorInfo}



I can create:


• Instagram captions

• Viral hooks

• Reel descriptions

• Call-to-action lines

• Hashtags

• Engagement posts



For fitness creators:


💪 Transformation captions

🔥 Motivation hooks

🏋️ Workout descriptions

🎯 Audience engagement posts



Tell me:

• Video topic

• Your style

• Your target audience`;

        }









        // =================================
        // SCRIPT WRITING
        // =================================


        if(

            text.includes("script") ||

            text.includes("story")

        ){


            return `🎬 Script Writing Assistant



${creatorInfo}



I can help create:


• Short video scripts

• Reel scripts

• Storytelling structures

• Video hooks

• Content outlines



A strong script structure:


1. Hook

2. Problem

3. Value

4. Action step

5. Call to action



Tell me your video idea.`;

        }









        // =================================
        // EMAIL
        // =================================


        if(

            text.includes("email")

        ){


            return `✉️ Professional Writing Assistant



I can help create:


• Business emails

• Client messages

• Follow-ups

• Proposals

• Invitations



Tell me:

• Who is receiving it

• The purpose

• The tone you want`;

        }









        // =================================
        // REWRITE
        // =================================


        if(

            text.includes("rewrite") ||

            text.includes("improve") ||

            text.includes("correct")

        ){


            return `📝 Editing Intelligence Assistant



Send your text and I can:


• Rewrite it

• Improve clarity

• Fix grammar

• Make it professional

• Adapt the style`;

        }









        // =================================
        // GENERAL
        // =================================


        return `✍️ Writing Intelligence Assistant



${creatorInfo}



I can help with:


• Content writing

• Captions

• Scripts

• Emails

• Stories

• Professional messages

• Creative ideas



Your request:


"${message}"`;



    }


};









// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMWritingSkill = WritingSkill;



console.log(

"✍️ ChatTBM V10.0 Writing Intelligence Skill Loaded"

);
