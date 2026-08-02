// =====================================
// ChatTBM V6.8.7
// Chat Controller
//
// Systems:
// - Creator Brain
// - Response Intelligence
// - Memory Learning
// - Brand Intelligence
// =====================================



const {

    detectIntent

} = require("../services/intentEngine");





const {

    generateResponse

} = require("../services/responseEngine");





const CreatorBrainOrchestrator =

require("../services/creatorBrainOrchestrator");





const {

    analyzeCreatorInput

} = require("../services/creatorLearningEngine");





const {

    learnCreatorIdentity

} = require("../services/creatorIdentityEngine");





const {

    learnBrandVoice

} = require("../services/brandVoiceEngine");





const {

    learnCreatorMemory

} = require("../services/creatorMemoryEngine");





const {

    generateCreatorStrategy

} = require("../services/creatorStrategyEngine");





const RelationshipIntelligenceEngine =

require("../services/relationshipIntelligenceEngine");





const relationshipEngine =

new RelationshipIntelligenceEngine();





const creatorBrain =

new CreatorBrainOrchestrator();









// =====================================
// CHAT HANDLER
// =====================================


function chatHandler(req,res){


    try{


        const {


            userId="guest",


            message


        } = req.body;








        if(!message){


            return res.json({


                success:false,


                message:"No message received"


            });


        }








        analyzeCreatorInput(

            userId,

            message

        );








        learnCreatorIdentity(

            userId,

            message

        );








        learnBrandVoice(

            userId,

            message

        );








        learnCreatorMemory(

            userId,

            message

        );








        relationshipEngine.analyzeContent(

            userId,

            message

        );








        const brain =

        creatorBrain.analyze(

            userId,

            message

        );








        const intent =

        detectIntent(

            message

        );








        const strategy =

        generateCreatorStrategy(

            userId

        );








        const response =

        generateResponse(

            intent,

            message,

            brain.profile.memory || {},

            [],

            {},

            [],

            {},

            [],

            {


                userId,


                profile:

                brain.profile,



                strategy,



                brainContext:

                brain.brainContext



            }

        );








        res.json({


            success:true,


            version:"V6.8.7",


            intent,


            response,


            strategy,


            creatorBrain:{


                active:true,


                context:

                brain.brainContext


            }


        });



    }


    catch(error){


        console.error(error);



        res.status(500).json({


            success:false,


            error:error.message


        });


    }



}









module.exports = {


    chatHandler


};
