// =====================================
// ChatTBM V6.8.5
// Feedback Controller
//
// Systems:
// - Feedback Learning
// - Performance Learning
// - Response Improvement
// =====================================



const {

    saveFeedback,

    analyzeFeedback

} = require("../services/feedbackEngine");





const {

    analyzePerformanceFeedback

} = require("../services/performanceLearningEngine");









// =====================================
// SAVE FEEDBACK
// =====================================


function feedbackHandler(req,res){


    try{


        const {


            userId="guest",


            correction


        } = req.body;








        const feedback =

        saveFeedback({


            userId,


            correction


        });








        const learning =

        analyzePerformanceFeedback(

            userId,

            correction

        );








        res.json({


            success:true,


            version:"V6.8.5",


            feedback,


            learning


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









// =====================================
// FEEDBACK REPORT
// =====================================


function feedbackReport(req,res){


    res.json({


        success:true,


        report:

        analyzeFeedback()



    });


}









module.exports = {


    feedbackHandler,


    feedbackReport


};
