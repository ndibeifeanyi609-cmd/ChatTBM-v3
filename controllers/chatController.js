// =====================================
// ChatTBM V6.8.5
// Chat Controller
//
// Systems:
// - Creator Brain
// - Intent Detection
// - Response Intelligence
// =====================================


const {

    detectIntent

} = require("../services/intentEngine");





const {

    generateResponse

} = require("../services/responseEngine");





const CreatorBrainOrchestrator =

require("../services/creatorBrainOrchestrator");





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








        const brain =

        creatorBrain.analyze(

            userId,

            message

        );








        const intent =

        detectIntent(

            message

        );








        const response =

        generateResponse(

            intent,

            message,

            {},

            [],

            {},

            [],

            {},

            [],

            {


                userId,


                profile:

                brain.profile,



                brainContext:

                brain.brainContext



            }

        );








        res.json({


            success:true,


            version:"V6.8.5",


            intent,


            response,


            creatorBrain:{

                active:true

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
