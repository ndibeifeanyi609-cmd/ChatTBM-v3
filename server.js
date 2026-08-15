// =====================================
// ChatTBM V6.7.1
// Creator Intelligence Backend
//
// Systems:
// - Response Intelligence
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
// CORE RESPONSE INTELLIGENCE
// =====================================


const {

    generateResponse

} = require("./services/responseEngine");





const {

    detectIntent

} = require("./services/intentEngine");








// =====================================
// CREATOR LEARNING SYSTEM
// =====================================


const {

    analyzeCreatorInput

} = require("./services/creatorLearningEngine");



const {

    learnCreatorIdentity,

    getCreatorIdentity

} = require("./services/creatorIdentityEngine");



const {

    learnBrandVoice,

    getBrandVoice

} = require("./services/brandVoiceEngine");



const {

    learnCreatorMemory,

    getCreatorMemory

} = require("./services/creatorMemoryEngine");







// =====================================
// CREATOR STRATEGY
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");







// =====================================
// USER PROFILE
// =====================================


const {

    getProfile

} = require("./services/userProfileEngine");







// =====================================
// FEEDBACK + PERFORMANCE LEARNING
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
// VIRAL MEMORY
// =====================================


const {

    learnViralPattern,

    getCreatorViralMemory

} = require("./services/viralMemoryBridge");







// =====================================
// PREDICTIVE INTELLIGENCE
// =====================================


const {

    predictContent

} = require("./services/predictionEngine");

const {

    forecastContent,
    getForecast

} = require("./forecasting/ForecastIntegration");



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

        version:"V6.7.1",

        status:"Creator Intelligence Online 🚀"

    });


});







// =====================================
// CHAT ENGINE V6.7.1
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
        // CREATOR STRATEGY
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

                getProfile(userId)



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


    const userId =

    req.params.userId;





    res.json({


        success:true,



        identity:

        getCreatorIdentity(userId),



        voice:

        getBrandVoice(userId),



        memory:

        getCreatorMemory(userId)



    });


});








// =====================================
// CONTENT ANALYSIS ENGINE
// =====================================


app.post("/api/analyze",(req,res)=>{


    try{


        const {


            content,

            userId="guest"


        } = req.body;


        if (typeof content !== "string" || !content.trim()) {

            return res.status(400).json({

                success: false,

                error: "Content is required."

            });

        }





        res.json({


        success:true,



        forecast:

        forecastContent(content, userId).forecast,


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


        console.error(error);


        res.status(500).json({


            success:false,

            error:error.message


        });


    }


});


// =====================================
// FORECAST RETRIEVAL
// =====================================

app.get("/api/forecast/:id",(req,res)=>{

    try{

        const { id } = req.params;
        const { userId } = req.query;

        if (typeof userId !== "string" || !userId.trim()) {
            return res.status(400).json({
                success: false,
                error: "User ID is required."
            });
        }

        const result = getForecast(id, userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.json(result);

    }

    catch(error){

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
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
// USER PROFILE
// =====================================


app.get("/api/profile/:userId",(req,res)=>{


    res.json({


        success:true,


        profile:

        getProfile(

            req.params.userId

        )


    });


});








// =====================================
// CREATOR STRATEGY
// =====================================


app.get("/api/strategy/:userId",(req,res)=>{


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


});








// =====================================
// VIRAL MEMORY
// =====================================


app.get("/api/viral-memory/:userId",(req,res)=>{


    res.json({


        success:true,


        memory:

        getCreatorViralMemory(

            req.params.userId

        )


    });


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
// SERVER START
// =====================================


const PORT =

process.env.PORT || 3000;




app.listen(PORT,()=>{


    console.log(

        `🚀 ChatTBM V6.7.1 running on port ${PORT}`

    );


});
