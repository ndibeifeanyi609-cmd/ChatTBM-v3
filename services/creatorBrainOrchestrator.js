// =========================================
// ChatTBM V7.0
// Creator Brain Orchestrator
//
// Purpose:
// - Central intelligence controller
// - Coordinate creator systems
// - Build complete creator context
// - Prepare AI decisions
//
// Connected:
// - Identity Intelligence
// - Memory Intelligence
// - Brand Intelligence
// - Growth Intelligence
// - Strategy Intelligence
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

    getGrowthProfile,

    buildGrowthStrategy

} = require("./creatorGrowthEngine");





const {

    generateCreatorStrategy

} = require("./creatorStrategyEngine");





const IntelligenceFusionEngine =

require("./intelligenceFusionEngine");









class CreatorBrainOrchestrator {





constructor(){


    this.fusion =

    new IntelligenceFusionEngine();


}









// =====================================
// BUILD CREATOR PROFILE
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





    const strategy =

    generateCreatorStrategy(

        userId

    );








    return {


        userId,



        identity,



        memory,



        voice,



        growth,



        strategy,



        createdAt:new Date()



    };


}









// =====================================
// ANALYZE CREATOR BRAIN
// =====================================


analyze(

    userId,

    request=""

){



    const profile =

    this.buildCreatorProfile(

        userId

    );








    const growthDirection =

    buildGrowthStrategy(

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

            profile.growth || {},



            strategy:

            profile.strategy || {},



            growthDirection



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



        strategy:

        context.strategy,



        rule:


        "Always create content matching the creator identity, audience, brand voice and growth direction."



    };


}









// =====================================
// UPDATE CREATOR BRAIN
// =====================================


learn(

    userId,

    data={}

){


    const context =

    this.fusion.createContext(

        userId

    );








    Object.keys(data)

    .forEach(key=>{


        context[key] = data[key];


    });








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









}









module.exports = CreatorBrainOrchestrator;
