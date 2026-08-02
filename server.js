// =====================================
// ChatTBM V6.7.3
// Creator Intelligence Backend
//
// Systems:
// - Response Intelligence
// - Adaptive Response Engine
// - Adaptive Brain Engine
// - Intent Detection
// - Creator Identity
// - Brand Voice
// - Creator Memory
// - Strategy Engine
// - Feedback Learning
// - Predictive Intelligence
// =====================================


require("dotenv").config();


const express = require("express");

const cors = require("cors");



const app = express();



app.use(cors());

app.use(express.json());








// =====================================
// RESPONSE INTELLIGENCE
// =====================================


const {

    generateResponse,

    connectAdaptiveEngine


} = require("./services/responseEngine");








// =====================================
// INTENT ENGINE
// =====================================


const {

    detectIntent

} = require("./services/intentEngine");








// =====================================
// CREATOR IDENTITY
// =====================================


const {

    learnCreatorIdentity,

    getCreatorIdentity

} = require("./services/creatorIdentityEngine");








// =====================================
// CONNECT ADAPTIVE SYSTEMS
// =====================================


connectAdaptiveEngine({

    getCreatorIdentity

});

// =====================================
// CREATOR LEARNING SYSTEM
// =====================================


const {

    analyzeCreatorInput

} = require("./services/creatorLearningEngine");






const {

    learnBrandVoice,

    getBrandVoice

} = require("./services/brandVoiceEngine");






const {

    learnCreatorMemory,

    getCreatorMemory

} = require("./services/creatorMemoryEngine");









// =====================================
// CREATOR STRATEGY ENGINE
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");









// =====================================
// USER PROFILE ENGINE
// =====================================


const {

    getProfile

} = require("./services/userProfileEngine");









// =====================================
// FEEDBACK LEARNING SYSTEM
// =====================================


const {

    saveFeedback,

    analyzeFeedback

} = require("./services/feedbackEngine");






const {

    analyzeUserFeedback

} = require("./services/profileLearningBridge");






const {

    analyzePerformanceFeedback

} = require("./services/performanceLearningEngine");









// =====================================
// VIRAL MEMORY SYSTEM
// =====================================


const {

    learnViralPattern,

    getCreatorViralMemory

} = require("./services/viralMemoryBridge");

// =====================================
// PREDICTIVE INTELLIGENCE SYSTEM
// =====================================


const {

    predictContent

} = require("./services/predictionEngine");






const {

    scoreHook

} = require("./services/hookScoringEngine");






const {

    scoreContent

} = require("./services/contentScoreEngine");






const {

    predictAudience

} = require("./services/audiencePredictionEngine");






const {

    generateGrowthReport

} = require("./services/growthRecommendationEngine");









// =====================================
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:"ChatTBM AI Backend",


        version:"V6.7.3",


        status:"Adaptive Creator Intelligence Online 🚀"



    });


});









// =====================================
// CHAT ENGINE V6.7.3
// =====================================


app.post("/api/chat",(req,res)=>{


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








        // ===============================
        // CREATOR LEARNING
        // ===============================


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








        // ===============================
        // INTENT DETECTION
        // ===============================


        const intent =

        detectIntent(

            message

        );








        // ===============================
        // STRATEGY INTELLIGENCE
        // ===============================


        const strategy =

        generateCreatorStrategy(

            userId

        );







        // ===============================
        // RESPONSE GENERATION
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


                strategy,


                profile:

                getCreatorIdentity(userId)


            }


        );








        res.json({


            success:true,


            intent,


            response,


            strategy



        });



    }


    catch(error){


        console.error(error);



        res.status(500).json({


            success:false,


            error:error.message



        });



    }


});

// =====================================
// CREATOR MEMORY LEARNING
// =====================================


app.post("/api/creator-memory",(req,res)=>{


    try{


        const {


            userId="guest",

            content


        } = req.body;







        if(!content){


            return res.json({


                success:false,


                message:"No content received"



            });


        }







        res.json({


            success:true,



            identity:

            learnCreatorIdentity(

                userId,

                content

            ),






            voice:

            learnBrandVoice(

                userId,

                content

            ),






            memory:

            learnCreatorMemory(

                userId,

                content

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
// CREATOR BRAIN
// =====================================


app.get("/api/creator-brain/:userId",(req,res)=>{


    try{


        const userId =

        req.params.userId;







        res.json({


            success:true,



            identity:

            getCreatorIdentity(

                userId

            ),





            voice:

            getBrandVoice(

                userId

            ),





            memory:

            getCreatorMemory(

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
// USER PROFILE
// =====================================


app.get("/api/profile/:userId",(req,res)=>{


    try{


        res.json({


            success:true,



            profile:

            getProfile(

                req.params.userId

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
// CONTENT ANALYSIS ENGINE
// =====================================


app.post("/api/analyze",(req,res)=>{


    try{


        const {


            content


        } = req.body;







        if(!content){


            return res.json({


                success:false,


                message:"No content received"



            });


        }







        res.json({


            success:true,



            prediction:

            predictContent(content),




            hook:

            scoreHook(content),




            contentScore:

            scoreContent(content),




            audience:

            predictAudience(content),




            growth:

            generateGrowthReport(content)



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
// FEEDBACK LEARNING
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


                message:"No feedback received"



            });


        }








        const feedback =

        saveFeedback({


            userId,


            correction



        });








        analyzeUserFeedback(

            userId,

            correction

        );








        analyzePerformanceFeedback(

            userId,

            correction

        );








        learnViralPattern(

            userId,

            correction

        );








        res.json({


            success:true,


            feedback



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
// CREATOR STRATEGY
// =====================================


app.get("/api/strategy/:userId",(req,res)=>{


    try{


        const userId =

        req.params.userId;







        res.json({


            success:true,



            strategy:

            generateCreatorStrategy(userId),




            ideas:

            generateContentIdeas(userId),




            script:

            generateScriptOutline(userId)



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
// VIRAL MEMORY
// =====================================


app.get("/api/viral-memory/:userId",(req,res)=>{


    try{


        res.json({


            success:true,



            memory:

            getCreatorViralMemory(

                req.params.userId

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
// FEEDBACK ANALYTICS
// =====================================


app.get("/api/feedback",(req,res)=>{


    try{


        res.json(

            analyzeFeedback()

        );


    }


    catch(error){


        res.status(500).json({


            success:false,


            error:error.message



        });


    }


});









// =====================================
// SERVER START
// =====================================


const PORT =

process.env.PORT || 3000;







app.listen(PORT,()=>{


    console.log(


        `🚀 ChatTBM V6.7.3 running on port ${PORT}`


    );


});
