// =====================================
// ChatTBM V6.8.5
// Growth Controller
//
// Systems:
// - Growth Intelligence
// - Content Performance
// - Recommendations
// =====================================



const {

    analyzeContentPerformance,

    generateGrowthRecommendations,

    getGrowthProfile

} = require("../services/creatorGrowthEngine");









// =====================================
// GROWTH HANDLER
// =====================================


function growthHandler(req,res){


    try{


        const {


            userId="guest",


            content=""


        } = req.body;








        const performance =

        analyzeContentPerformance(

            userId,

            content

        );








        const recommendations =

        generateGrowthRecommendations(

            userId

        );








        const profile =

        getGrowthProfile(

            userId

        );








        res.json({


            success:true,


            version:"V6.8.5",


            growth:{


                performance,


                recommendations,


                profile


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


    growthHandler


};
