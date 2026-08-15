// =====================================
// ChatTBM V7.8
// Research Skill
//
// Purpose:
// - Research assistance
// - Topic explanations
// - Summaries
// - Comparisons
// =====================================



const ResearchSkill = {


    name: "Research Assistant",


    version: "7.8",






    canHandle(intent){


        return (

            intent === "research"

        );


    },







    respond(message){


        const text =

        message.toLowerCase();







        if(

            text.includes("compare") ||

            text.includes("difference") ||

            text.includes("vs")

        ){


            return `🔍 Research Assistant


I can help you compare topics, products, ideas, or concepts.


I can provide:

• Key differences
• Advantages and disadvantages
• Simple explanations
• Recommendations


Tell me what you want to compare.`;

        }







        if(

            text.includes("summary") ||

            text.includes("summarize")

        ){


            return `📄 Research Assistant


I can help summarize:

• Articles
• Topics
• Documents
• Long explanations


Send me the information you want summarized.`;

        }







        return `🔍 Research Assistant


I can help you with:

• Research questions
• Topic explanations
• Information summaries
• Comparisons
• Learning new subjects


Your research request:

"${message}"`;



    }


};







// =====================================
// GLOBAL ACCESS
// =====================================


window.ChatTBMResearchSkill = ResearchSkill;



console.log(

"✅ ChatTBM Research Skill Loaded"

);
