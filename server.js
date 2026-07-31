// =====================================
// ChatTBM V6.3
// Personal AI Brain Backend
//
// Connected Systems:
// - Response Engine
// - Memory Brain
// - Feedback Learning
// - User Profile
// - Creator Memory
// =====================================


require("dotenv").config();


const express = require("express");
const cors = require("cors");



// ===============================
// SERVICES
// ===============================


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





// ===============================
// APP SETUP
// ===============================

const app = express();


app.use(cors());


app.use(express.json());





// ===============================
// HEALTH CHECK
// ===============================

app.get("/",(req,res)=>{


    res.json({

        app:"ChatTBM AI Backend",

        version:"V6.3",

        status:"Creator Brain Online 🚀"

    });


});

// =====================================
// ChatTBM V6.3
// Personal AI Brain Backend
//
// Systems Connected:
// - Response Engine
// - Memory Brain
// - Feedback Learning
// - User Profile
// - Creator Memory
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





// =====================================
// APP CONFIGURATION
// =====================================


const app = express();



app.use(cors());



app.use(express.json());





// =====================================
// SERVER STATUS
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:

        "ChatTBM AI Backend",


        version:

        "V6.3",


        status:

        "Creator Brain Online 🚀"


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





        // =====================================
        // CREATOR MEMORY LEARNING
        // =====================================


        const creatorMemory =

        analyzeCreatorInput(

            userId,

            message

        );





        // =====================================
        // INTENT DETECTION
        // =====================================


        let intent = "general";



        const text =

        message.toLowerCase();





        if(

            text.includes("script")

        ){


            intent =

            "script_generation";


        }





        else if(

            text.includes("caption")

        ){


            intent =

            "caption_generation";


        }





        else if(

            text.includes("idea")

        ){


            intent =

            "idea_generation";


        }





        else if(

            text.includes("advert")

        ){


            intent =

            "advert_generation";


        }





        // =====================================
        // USER PROFILE
        // =====================================


        const profile =

        getProfile(

            userId

        );






        // =====================================
        // AI RESPONSE
        // =====================================


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


            response,


            profile,


            creatorMemory


        });



    }



    catch(error){


        console.error(

            "ChatTBM Chat Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:error.message


        });


    }


});

// =====================================
// FEEDBACK + LEARNING ENGINE
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





        // ===============================
        // SAVE GENERAL FEEDBACK
        // ===============================


        const feedback =

        saveFeedback({


            userId,


            correction


        });







        // ===============================
        // PROFILE LEARNING
        // ===============================


        const profileLearning =

        analyzeUserFeedback(

            userId,

            correction

        );







        // ===============================
        // CREATOR BRAIN LEARNING
        // ===============================


        const creatorLearning =

        analyzeCreatorInput(

            userId,

            correction

        );






        res.json({


            success:true,


            feedback,


            profileLearning,


            creatorLearning



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
// USER PROFILE ACCESS
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
// START SERVER
// =====================================


const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

`🚀 ChatTBM V6.3 running on port ${PORT}`

    );


});
