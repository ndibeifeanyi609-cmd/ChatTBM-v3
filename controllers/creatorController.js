// =====================================
// ChatTBM V6.8.5
// Creator Controller
//
// Systems:
// - Creator Identity
// - Brand Voice
// - Creator Memory
// =====================================



const {

    getCreatorIdentity

} = require("../services/creatorIdentityEngine");





const {

    getBrandVoice

} = require("../services/brandVoiceEngine");





const {

    getCreatorMemory

} = require("../services/creatorMemoryEngine");









// =====================================
// CREATOR PROFILE HANDLER
// =====================================


function creatorHandler(req,res){


    try{


        const userId =

        req.params.userId || "guest";








        const identity =

        getCreatorIdentity(

            userId

        );








        const voice =

        getBrandVoice(

            userId

        );








        const memory =

        getCreatorMemory(

            userId

        );








        res.json({


            success:true,


            version:"V6.8.5",


            creator:{


                identity,


                voice,


                memory


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


    creatorHandler


};
