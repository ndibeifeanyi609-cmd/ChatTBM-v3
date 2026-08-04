// =====================================
// ChatTBM V7.7
// Business Skill
//
// Purpose:
// - Business ideas
// - Marketing help
// - Sales support
// - Branding assistance
// =====================================



const BusinessSkill = {


    name: "Business Assistant",


    version: "7.7",






    canHandle(intent){


        return (

            intent === "business"

        );


    },







    respond(message){


        const text =

        message.toLowerCase();







        if(

            text.includes("marketing")

        ){


            return `💼 Marketing Assistant


I can help you with:

• Marketing strategies
• Customer targeting
• Brand awareness
• Social media marketing
• Campaign ideas


Tell me your product, service, or business goal.`;

        }







        if(

            text.includes("sales") ||

            text.includes("sell")

        ){


            return `📈 Sales Assistant


I can help you create:

• Sales messages
• Offers
• Customer communication
• Sales strategies
• Conversion ideas


Tell me what you are selling.`;

        }







        if(

            text.includes("brand") ||

            text.includes("branding")

        ){


            return `🎯 Branding Assistant


I can help with:

• Brand names
• Brand identity
• Positioning
• Audience understanding
• Brand ideas


Tell me about your brand.`;

        }







        return `💼 Business Assistant


I can help you with:

• Business ideas
• Marketing
• Sales
• Branding
• Product descriptions
• Business planning


Your request:

"${message}"`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMBusinessSkill = BusinessSkill;



console.log(

"✅ ChatTBM Business Skill Loaded"

);
