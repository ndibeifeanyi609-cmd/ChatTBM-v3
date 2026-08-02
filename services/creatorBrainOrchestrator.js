// =========================================
// ChatTBM V6.8.1
// Creator Brain Orchestrator
//
// Purpose:
// - Central intelligence controller
// - Coordinate creator systems
// - Build complete creator context
// - Prepare AI decisions
// =========================================



const {

    getCreatorMemory

} = require("./creatorMemoryEngine");





const {

    getCreatorIdentity

} = require("./creatorIdentityEngine");





const {

    getBrandVoice

} = require("./brandVoiceEngine");





const {

    getGrowthProfile

} = require("./creatorGrowthEngine");





const IntelligenceFusionEngine =

require("./intelligenceFusionEngine");








class CreatorBrainOrchestrator {



    constructor(){


        this.fusion =

        new IntelligenceFusionEngine();


    }

// =====================================
// BUILD CREATOR BRAIN PROFILE
// =====================================


buildCreatorProfile(userId){


    const identity =

    getCreatorIdentity(

        userId

    );





    const memory =

    getCreatorMemory(

        userId

    );





    const voice =

    getBrandVoice(

        userId

    );





    const growth =

    getGrowthProfile(

        userId

    );








    return {


        userId,



        identity,



        memory,



        voice,



        growth,



        createdAt:new Date()



    };


}

// =====================================
// ANALYZE CREATOR BRAIN
// =====================================


analyze(

    userId,

    request = ""

){



    const profile =

    this.buildCreatorProfile(

        userId

    );








    const brainContext =

    this.fusion.fuse(

        userId,

        {


            identity:

            profile.identity || {},



            memory:

            profile.memory || {},



            voice:

            profile.voice || {},



            growth:

            profile.growth || {}



        }

    );








    return {


        userId,



        request,



        profile,



        brainContext,



        instructions:

        this.buildInstructions(

            brainContext

        )



    };


}









// =====================================
// BUILD AI INSTRUCTIONS
// =====================================


buildInstructions(context){


    return {


        creatorIdentity:

        context.identity,



        creatorMemory:

        context.memory,



        brandVoice:

        context.voice,



        growthDirection:

        context.growth,



        rule:

        "Always create content matching the creator identity."



    };


}

// =====================================
// UPDATE CREATOR BRAIN
// =====================================


learn(

    userId,

    data = {}

){


    const context =

    this.fusion.createContext(

        userId

    );








    if(data.identity){


        context.identity =

        data.identity;


    }








    if(data.memory){


        context.memory =

        data.memory;


    }








    if(data.voice){


        context.voice =

        data.voice;


    }








    if(data.growth){


        context.growth =

        data.growth;


    }








    if(data.strategy){


        context.strategy =

        data.strategy;


    }








    context.updatedAt =

    new Date();








    return context;


}









// =====================================
// GET BRAIN STATUS
// =====================================


getBrainStatus(userId){


    const context =

    this.fusion.getContext(

        userId

    );








    return {


        userId,


        active:true,


        systems:{


            identity:

            !!context.identity,



            memory:

            !!context.memory,



            voice:

            !!context.voice,



            growth:

            !!context.growth,



            strategy:

            !!context.strategy



        },



        updatedAt:

        context.updatedAt



    };


}

// =====================================
// MODULE EXPORT
// =====================================


module.exports = CreatorBrainOrchestrator;
