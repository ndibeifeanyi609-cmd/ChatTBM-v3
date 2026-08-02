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
