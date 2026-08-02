 // =========================================
// ChatTBM V6.7.9
// Intelligence Fusion Engine
//
// Purpose:
// - Combine creator intelligence systems
// - Build unified Creator Brain Context
// - Connect personalization decisions
// - Prepare response intelligence
// =========================================



class IntelligenceFusionEngine {



    constructor(){


        this.contexts = {};


    }








    // =====================================
    // CREATE CREATOR CONTEXT
    // =====================================


    createContext(userId){


        if(!this.contexts[userId]){


            this.contexts[userId] = {


                userId,


                identity:{},


                memory:{},


                audience:{},


                growth:{},


                voice:{},


                strategy:{},


                personalization:{},


                decision:{},


                updatedAt:new Date()



            };


        }





        return this.contexts[userId];


    }









    // =====================================
    // FUSE INTELLIGENCE DATA
    // =====================================


    fuse(

        userId,

        intelligence = {}

    ){


        const context =

        this.createContext(

            userId

        );









        if(intelligence.identity){


            context.identity =

            intelligence.identity;


        }









        if(intelligence.memory){


            context.memory =

            intelligence.memory;


        }









        if(intelligence.audience){


            context.audience =

            intelligence.audience;


        }









        if(intelligence.growth){


            context.growth =

            intelligence.growth;


        }









        if(intelligence.voice){


            context.voice =

            intelligence.voice;


        }









        if(intelligence.strategy){


            context.strategy =

            intelligence.strategy;


        }









        if(intelligence.personalization){


            context.personalization =

            intelligence.personalization;


        }









        if(intelligence.decision){


            context.decision =

            intelligence.decision;


        }









        context.updatedAt = new Date();





        return context;


    }









    // =====================================
    // GET CREATOR BRAIN CONTEXT
    // =====================================


    getContext(userId){


        return this.createContext(

            userId

        );


    }









    // =====================================
    // BUILD RESPONSE INSTRUCTIONS
    // =====================================


    buildInstructions(userId){


        const context =

        this.getContext(

            userId

        );





        return {


            creatorStyle:

            context.identity.contentStyle || "",



            tone:

            context.voice.tone || "",



            audience:

            context.audience.audienceType || "",



            strategy:

            context.strategy || {},



            memory:

            context.memory || {},



            personalization:

            context.personalization || {},



            decision:

            context.decision || {}



        };


    }



}







module.exports = IntelligenceFusionEngine;
