// =====================================
// ChatTBM V6.6.1
// Core Cleanup Backend
//
// Systems:
// - AI Response
// - Memory Learning
// - Creator Intelligence
// - Predictive Intelligence
// =====================================


require("dotenv").config();

const express = require("express");

const cors = require("cors");

const app = express();



app.use(cors());

app.use(express.json());




// =====================================
// CORE AI
// =====================================


const {

    generateResponse

} = require("./services/responseEngine");



// =====================================
// MEMORY + LEARNING
// =====================================


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

    analyzePerformanceFeedback

} = require("./services/performanceLearningEngine");


const {

    learnViralPattern,

    getCreatorViralMemory

} = require("./services/viralMemoryBridge");



// =====================================
// CREATOR STRATEGY
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");



// =====================================
// V6.6.1 INTELLIGENCE
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

        version:"V6.6.1",

        status:"Core Intelligence Online 🚀"

    });


});





// =====================================
// CHAT
// =====================================


app.post("/api/chat",(req,res)=>{


    const {

        userId="guest",

        message

    } = req.body;



    analyzeCreatorInput(

        userId,

        message

    );



    const strategy =

    generateCreatorStrategy(userId);



    const response =

    generateResponse(

        "general",

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

            profile:getProfile(userId)

        }

    );



    res.json({

        success:true,

        response,

        strategy

    });


});





// =====================================
// V6.6.1 CONTENT ANALYSIS
// =====================================


app.post("/api/analyze",(req,res)=>{


    const {

        content

    } = req.body;



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


});





// =====================================
// FEEDBACK LEARNING
// =====================================


app.post("/api/feedback",(req,res)=>{


    const {

        userId="guest",

        correction

    } = req.body;



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


});





// =====================================
// STRATEGY
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
// PROFILE
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
// FEEDBACK STATS
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

        `🚀 ChatTBM V6.6.1 running on port ${PORT}`

    );


});
