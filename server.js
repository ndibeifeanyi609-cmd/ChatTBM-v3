// =====================================
// ChatTBM V6.4
// Personal AI Brain Backend
//
// Connected Systems:
// - Response Intelligence
// - Memory Brain
// - Feedback Learning
// - User Profile Learning
// - Creator Memory
// - Content Performance Memory
// =====================================


require("dotenv").config();


const express = require("express");

const cors = require("cors");




// =====================================
// SERVICES
// =====================================


const {

    generateResponse

} = require("./services/responseEngine");



const {

    saveFeedback,

    analyzeFeedback

} = require("./services/feedbackEngine");



const {

    analyzeUserFeedback

} = require("./services/profileLearningBridge");



const {

    getProfile

} = require("./services/userProfileEngine");



const {

    analyzeCreatorInput

} = require("./services/creatorLearningEngine");



const {

    analyzePerformanceFeedback,

    getWinningPatterns

} = require("./services/performanceLearningEngine");






// =====================================
// APP CONFIGURATION
// =====================================


const app = express();


app.use(cors());


app.use(express.json());







// =====================================
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:

        "ChatTBM AI Backend",


        version:

        "V6.4",


        status:

        "Creator Intelligence Online 🚀"


    });


});







// =====================================
// CHAT ENGINE
// =====================================


app.post("/api/chat",(req,res)=>{


    try{


        const {


            message,


            userId="guest"


        } = req.body;





        if(!message){


            return res.json({


                success:false,


                message:

                "No message received"


            });


        }






        // ===============================
        // CREATOR LEARNING
        // ===============================


        const creatorMemory =

        analyzeCreatorInput(

            userId,

            message

        );







        // ===============================
        // INTENT DETECTION
        // ===============================


        let intent = "general";


        const text =

        message.toLowerCase();





        if(text.includes("script")){


            intent =

            "script_generation";


        }


        else if(text.includes("caption")){


            intent =

            "caption_generation";


        }


        else if(text.includes("idea")){


            intent =

            "idea_generation";


        }


        else if(text.includes("advert")){


            intent =

            "advert_generation";


        }








        // ===============================
        // USER PROFILE
        // ===============================


        const profile =

        getProfile(

            userId

        );








        // ===============================
        // GENERATE RESPONSE
        // ===============================


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

                profile,

                creatorMemory


            }


        );






        res.json({


            success:true,


            response


        });



    }


    catch(error){


        console.error(

            "ChatTBM Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:error.message


        });


    }


});








// =====================================
// LEARNING FEEDBACK ENGINE
// =====================================


app.post("/api/feedback",(req,res)=>{


    try{


        const {


            userId="guest",


            correction


        } = req.body;





        if(!correction){


            return res.json({


                success:false,


                message:

                "No feedback provided"


            });


        }






        const feedback =

        saveFeedback({


            userId,


            correction


        });







        const profileLearning =

        analyzeUserFeedback(

            userId,

            correction

        );







        const creatorLearning =

        analyzeCreatorInput(

            userId,

            correction

        );







        const performanceLearning =

        analyzePerformanceFeedback(

            userId,

            correction

        );






        res.json({


            success:true,


            feedback,


            profileLearning,


            creatorLearning,


            performanceLearning



        });



    }



    catch(error){


        console.error(

            "Feedback Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:error.message


        });


    }


});







// =====================================
// FEEDBACK ANALYTICS
// =====================================


app.get("/api/feedback",(req,res)=>{


    res.json(

        analyzeFeedback()

    );


});







// =====================================
// USER PROFILE
// =====================================


app.get("/api/profile/:userId",

(req,res)=>{


    const profile =

    getProfile(

        req.params.userId

    );



    res.json({


        success:true,


        profile



    });


});







// =====================================
// CONTENT PERFORMANCE MEMORY
// =====================================


app.get("/api/performance/:userId",

(req,res)=>{


    const patterns =

    getWinningPatterns(

        req.params.userId

    );



    res.json({


        success:true,


        patterns



    });


});








// =====================================
// START SERVER
// =====================================


const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

`🚀 ChatTBM V6.4 running on port ${PORT}`

    );


});
