// =====================================
// ChatTBM V7.0
// Creator Intelligence Backend
//
// Architecture:
// - Express Server
// - Frontend Hosting
// - Route Layer
// - Controller Layer
// - Service Intelligence Layer
// - Creator Brain Orchestrator
//
// Systems:
// - Response Intelligence
// - Memory Intelligence
// - Adaptive Intelligence
// - Growth Intelligence
// - Feedback Learning
// =====================================


require("dotenv").config();


const path = require("path");

const express = require("express");

const cors = require("cors");



const app = express();




// =====================================
// MIDDLEWARE
// =====================================


app.use(cors());


app.use(express.json());


app.use(express.urlencoded({

    extended:true

}));




// =====================================
// FRONTEND STATIC FILES
// =====================================
//
// Serves:
// index.html
// style.css
// script.js
// manifest.json
// service-worker.js
// images
//
// =====================================


app.use(

    express.static(

        path.join(__dirname,"..")

    )

);




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
// SERVICES
// =====================================


const CreatorBrainOrchestrator =

require("./services/creatorBrainOrchestrator");



const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");




// =====================================
// INITIALIZE CREATOR BRAIN
// =====================================


const creatorBrain =

new CreatorBrainOrchestrator();

 
// =====================================
// API ROUTES
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


app.get(

    "/api/health",

    (req,res)=>{


        res.json({


            success:true,


            app:"ChatTBM AI Backend",


            version:"V7.0",


            status:"Creator Intelligence Online 🚀",


            timestamp:new Date()


        });


    }

);




// =====================================
// HOME PAGE
// =====================================


app.get(

    "/",

    (req,res)=>{


        res.sendFile(

            path.join(

                __dirname,

                "..",

                "index.html"

            )

        );


    }

);




// =====================================
// CREATOR BRAIN STATUS
// =====================================


app.get(

    "/api/creator-brain/:userId",

    (req,res)=>{


        try{


            const userId =

            req.params.userId;



            res.json({


                success:true,


                version:"V7.0",



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


    }

);

// =====================================
// CREATOR STRATEGY
// =====================================


app.get(

    "/api/strategy/:userId",

    (req,res)=>{


        try{


            const userId =

            req.params.userId;



            res.json({


                success:true,


                version:"V7.0",



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


    }

);




// =====================================
// SYSTEM INFORMATION
// =====================================


app.get(

    "/api/system",

    (req,res)=>{


        res.json({


            success:true,


            name:"ChatTBM",


            version:"V7.0",


            architecture:

            "Creator Intelligence Platform",



            systems:[


                "Creator Brain",


                "Response Intelligence",


                "Memory Intelligence",


                "Adaptive Intelligence",


                "Growth Intelligence",


                "Feedback Learning"


            ]


        });


    }

);




// =====================================
// FRONTEND FALLBACK
// =====================================


app.get(

    "*",

    (req,res,next)=>{


        if(

            req.path.startsWith("/api/")

        ){

            return next();

        }



        res.sendFile(

            path.join(

                __dirname,

                "..",

                "index.html"

            )

        );


    }

);

// =====================================
// 404 HANDLER
// =====================================


app.use(

    (req,res)=>{


        res.status(404).json({


            success:false,


            message:"Route not found"


        });


    }

);




// =====================================
// GLOBAL ERROR HANDLER
// =====================================


app.use(

    (error,req,res,next)=>{


        console.error(error);



        res.status(500).json({


            success:false,


            message:"Internal server error",


            error:error.message


        });


    }

);




// =====================================
// SERVER STARTUP
// =====================================


const PORT =

process.env.PORT || 3000;



const HOST =

process.env.HOST || "0.0.0.0";





app.listen(

    PORT,

    HOST,

    ()=>{


        console.log("====================================");

        console.log("🚀 ChatTBM V7.0 Started Successfully");

        console.log("====================================");

        console.log(

            `🌐 Server: http://${HOST}:${PORT}`

        );

        console.log(

            `🏠 Frontend: http://${HOST}:${PORT}/`

        );

        console.log(

            `❤️ Health: http://${HOST}:${PORT}/api/health`

        );

        console.log(

            `💬 Chat API: http://${HOST}:${PORT}/api/chat`

        );

        console.log("🧠 Creator Brain: ACTIVE");

        console.log("⚡ Response Intelligence: ACTIVE");

        console.log("📚 Memory Intelligence: ACTIVE");

        console.log("🎯 Strategy Engine: ACTIVE");

        console.log("📈 Growth Intelligence: ACTIVE");

        console.log("❤️ Feedback Learning: ACTIVE");

        console.log("====================================");


    }

);
