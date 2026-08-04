// =====================================
// ChatTBM V7.6
// Writing Skill
//
// Purpose:
// - Writing assistance
// - Text improvement
// - Emails
// - Posts
// - Creative writing
// =====================================



const WritingSkill = {


    name: "Writing Assistant",


    version: "7.6",






    canHandle(intent){


        return (

            intent === "writing"

        );


    },







    respond(message){


        const text =

        message.toLowerCase();







        if(

            text.includes("email")

        ){


            return `✍️ Writing Assistant


I can help you create professional emails.


I can assist with:

• Business emails
• Requests
• Apologies
• Follow-ups
• Invitations


Tell me who the email is for and the purpose.`;

        }







        if(

            text.includes("caption") ||

            text.includes("post")

        ){


            return `📱 Social Writing Assistant


I can help create:

• Social media captions
• Posts
• Hooks
• Short descriptions
• Creative ideas


Tell me your topic and style.`;

        }







        if(

            text.includes("rewrite") ||

            text.includes("improve") ||

            text.includes("correct")

        ){


            return `📝 Editing Assistant


Send me your text and I can help:

• Rewrite it
• Improve clarity
• Fix grammar
• Make it more professional`;

        }







        return `✍️ Writing Assistant


I can help you with:

• Writing
• Editing
• Emails
• Stories
• Posts
• Professional messages


Your request:

"${message}"`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMWritingSkill = WritingSkill;



console.log(

"✅ ChatTBM Writing Skill Loaded"

);
