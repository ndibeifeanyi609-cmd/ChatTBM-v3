// =========================================
// ChatTBM V6.7.2
// Adaptive Response Engine
//
// Upgrade:
// - Creator Identity Compatible
// - Profile Adaptation
// - Content Style Learning
// - Brand Voice Awareness
// =========================================


class AdaptiveResponseEngine {


    constructor(identityEngine){

        this.identityEngine = identityEngine;

    }






    // =====================================
    // BUILD CREATOR CONTEXT
    // =====================================


    buildContext(userId){


        const profile =

        this.identityEngine.getCreatorIdentity(

            userId

        ) || {};





        return {


            creatorName:

            profile.creatorName || "Creator",



            niche:

            profile.niche || "General Content",



            style:

            profile.contentStyle || "Creative",



            personality:

            profile.personality || "Authentic",



            audience:

            profile.audience || "General Audience",



            tone:

            profile.tone || "Natural",



            topics:

            profile.preferredTopics || [],



            keywords:

            profile.brandKeywords || []


        };


    }








    // =====================================
    // PERSONALIZE REQUEST
    // =====================================


    personalize(userId, prompt){



        const context =

        this.buildContext(userId);





        return {


            originalPrompt: prompt,



            enhancedPrompt:

`
Creator Profile:

Name:
${context.creatorName}


Niche:
${context.niche}


Content Style:
${context.style}


Personality:
${context.personality}


Audience:
${context.audience}


Tone:
${context.tone}


Preferred Topics:
${context.topics.join(", ")}


Brand Keywords:
${context.keywords.join(", ")}



Creator Request:

${prompt}
`


        };


    }



}







module.exports = AdaptiveResponseEngine;
