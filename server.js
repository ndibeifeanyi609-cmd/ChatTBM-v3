// =====================================
// ChatTBM V6.2
// Personal AI Brain Backend
// Memory + Learning + User Profile
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

        version:"V6.2",

        status:"Online 🚀"

    });


});





// ===============================
// CHAT ENGINE
// ===============================

app.post("/api/chat",(req,res)=>{


    try{


        const {

            message,

            userId="guest"


        } = req.body;




        if(!message){


            return res.json({

                success:false,

                message:"No message received"

            });


        }





        let intent="general";



        const text =

        message.toLowerCase();





        if(text.includes("script")){


            intent="script_generation";


        }


        else if(text.includes("caption")){


            intent="caption_generation";


        }


        else if(text.includes("idea")){


            intent="idea_generation";


        }






        const profile =

        getProfile(userId);






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

                profile

            }

        );





        res.json({

            success:true,

            response,

            profile


        });



    }

    catch(error){


        console.error(

            error

        );


        res.status(500).json({

            success:false,

            error:error.message

        });


    }


});






// ===============================
// FEEDBACK + LEARNING
// ===============================

app.post("/api/feedback",(req,res)=>{


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

        analyzeUserFeedback(

            userId,

            correction

        );





        res.json({

            success:true,

            feedback,

            learning


        });



    }


    catch(error){


        res.status(500).json({

            success:false,

            error:error.message

        });


    }


});







// ===============================
// FEEDBACK ANALYTICS
// ===============================

app.get("/api/feedback",(req,res)=>{


    res.json(

        analyzeFeedback()

    );


});







// ===============================
// USER PROFILE
// ===============================

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







// ===============================
// START SERVER
// ===============================


const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

`🚀 ChatTBM V6.2 running on port ${PORT}`

    );


});
