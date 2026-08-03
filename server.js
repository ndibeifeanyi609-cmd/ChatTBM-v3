// =====================================
// ChatTBM V6.8.8
// Creator Intelligence Backend
//
// Architecture:
// - Route Layer
// - Controller Layer
// - Service Intelligence Layer
//
// Systems:
// - Creator Brain
// - Response Intelligence
// - Memory Intelligence
// - Adaptive Intelligence
// - Growth Intelligence
// - Feedback Learning
// =====================================



require("dotenv").config();



const express = require("express");

const cors = require("cors");





const app = express();









// =====================================
// MIDDLEWARE
// =====================================


app.use(cors());


app.use(express.json());









// =====================================
// ROUTES
// =====================================


const chatRoutes =

require("./routes/chatRoutes");



const creatorRoutes =

require("./routes/creatorRoutes");



const growthRoutes =

require("./routes/growthRoutes");



const feedbackRoutes =

require("./routes/feedbackRoutes");









// =====================================
// ROUTE CONNECTIONS
// =====================================


app.use(

"/api/chat",

chatRoutes

);



app.use(

"/api/creator",

creatorRoutes

);



app.use(

"/api/growth",

growthRoutes

);



app.use(

"/api/feedback",

feedbackRoutes

);

// =====================================
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:"ChatTBM AI Backend",


        version:"V6.8.8",


        status:"Creator Intelligence Online 🚀"



    });


});









// =====================================
// CREATOR BRAIN STATUS
// =====================================
//
// Kept here for system monitoring
// =====================================


const CreatorBrainOrchestrator =

require("./services/creatorBrainOrchestrator");





const creatorBrain =

new CreatorBrainOrchestrator();









app.get(

"/api/creator-brain/:userId",

(req,res)=>{


    try{


        const userId =

        req.params.userId;








        res.json({


            success:true,


            version:"V6.8.8",



            brain:

            creatorBrain.getBrainStatus(

                userId

            ),



            profile:

            creatorBrain.buildCreatorProfile(

                userId

            )



        });



    }


    catch(error){


        res.status(500).json({


            success:false,


            error:error.message


        });


    }



});

// =====================================
// CREATOR STRATEGY STATUS
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");









app.get(

"/api/strategy/:userId",

(req,res)=>{


    try{


        const userId =

        req.params.userId;








        res.json({


            success:true,


            version:"V6.8.8",



            strategy:

            generateCreatorStrategy(

                userId

            ),



            ideas:

            generateContentIdeas(

                userId

            ),



            script:

            generateScriptOutline(

                userId

            )



        });



    }


    catch(error){


        res.status(500).json({


            success:false,


            error:error.message


        });


    }



});









// =====================================
// SYSTEM INFO
// =====================================


app.get(

"/api/system",

(req,res)=>{


    res.json({


        name:"ChatTBM",


        version:"V6.8.8",


        architecture:"Creator Intelligence Stack",



        systems:[


            "Creator Brain",


            "Response Engine",


            "Memory Intelligence",


            "Adaptive Intelligence",


            "Growth Intelligence",


            "Feedback Learning"


        ]


    });


});

// =====================================
// ERROR HANDLING
// =====================================


app.use(

(req,res)=>{


    res.status(404).json({


        success:false,


        message:"Route not found"


    });


});









// =====================================
// GLOBAL ERROR HANDLER
// =====================================


app.use(

(error,req,res,next)=>{


    console.error(

        error

    );





    res.status(500).json({


        success:false,


        message:"Internal server error",


        error:error.message


    });



});

// =====================================
// SERVER START
// =====================================


const PORT =

process.env.PORT || 3000;









app.listen(
PORT,
"0.0.0.0",
()=>{

    console.log(

        `🚀 ChatTBM V6.8.8 running on port ${PORT}`

    );


});
