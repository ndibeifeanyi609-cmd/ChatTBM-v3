// =========================================
// ChatTBM V6.7.3
// Adaptive Brain Engine
//
// Purpose:
// - Decision layer between memory and response
// - Understand creator style
// - Choose response direction
// - Improve personalization
// =========================================



class AdaptiveBrainEngine {



    constructor(){

        this.creatorPatterns = {};

    }







    // =====================================
    // ANALYZE CREATOR PROFILE
    // =====================================


    analyzeCreator(profile = {}){


        let style = "General Creator";


        let tone = "Natural";


        let strategy = "Balanced";





        if(

            profile.contentStyle &&

            profile.contentStyle.includes("Cinematic")

        ){

            style = "Cinematic Creator";

        }






        if(

            profile.niche &&

            profile.niche.includes("Action")

        ){

            style = "Action Creator";

            tone = "Intense";

        }






        if(

            profile.personality &&

            profile.personality.includes("Entertainment")

        ){

            style = "Comedy Creator";

            tone = "Funny";

        }






        if(

            profile.tone

        ){

            tone = profile.tone;

        }






        return {


            creatorStyle: style,


            preferredTone: tone,


            strategy


        };


    }








    // =====================================
    // BUILD RESPONSE DECISION
    // =====================================


    decide(profile = {}, request = ""){


        const creator =

        this.analyzeCreator(profile);





        return {


            request,



            creatorStyle:

            creator.creatorStyle,



            tone:

            creator.preferredTone,



            instructions:

`
Create content matching:

Style:
${creator.creatorStyle}

Tone:
${creator.preferredTone}

Keep the creator identity consistent.
`


        };


    }








    // =====================================
    // LEARN PATTERN
    // =====================================


    learn(userId, data){


        if(!this.creatorPatterns[userId]){


            this.creatorPatterns[userId] = [];


        }





        this.creatorPatterns[userId].push(data);



        return this.creatorPatterns[userId];


    }








    // =====================================
    // GET LEARNED PATTERN
    // =====================================


    getPattern(userId){


        return this.creatorPatterns[userId] || [];


    }



}







module.exports = AdaptiveBrainEngine;
