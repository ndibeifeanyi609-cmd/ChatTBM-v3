// =====================================
// ChatTBM V6.6
// Predictive Creator Intelligence Backend
//
// Systems:
// - Response Intelligence
// - Memory Brain
// - Feedback Learning
// - Creator Learning
// - Performance Learning
// - Viral Pattern Learning
// - Creator Strategy
// - Prediction Engine
// - Hook Scoring
// - Content Scoring
// - Audience Prediction
// - Growth Recommendations
// =====================================


require("dotenv").config();

const express = require("express");

const cors = require("cors");



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
    analyzePerformanceFeedback
} = require("./services/performanceLearningEngine");


const {
    learnViralPattern,
    getCreatorViralMemory
} = require("./services/viralMemoryBridge");


const {
    generateCreatorStrategy,
    generateContentIdeas,
    generateScriptOutline
} = require("./services/creatorStrategyEngine");



// ===============================
// V6.6 INTELLIGENCE
// ===============================


const {
    predictContent,
    recommendImprovements
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





const app = express();


app.use(cors());

app.use(express.json());




// =====================================
// HEALTH CHECK
// =====================================


app.get("/", (req,res)=>{


    res.json({

        app:"ChatTBM AI Backend",

        version:"V6.6",

        status:"Predictive Creator Intelligence Online 🚀"

    });


});




// =====================================
// CHAT ENGINE
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



        analyzeCreatorInput(

            userId,

            message

        );



        let intent="general";


        const text =
        message.toLowerCase();



        if(text.includes("script"))

            intent="script_generation";


        else if(text.includes("caption"))

            intent="caption_generation";


        else if(text.includes("idea"))

            intent="idea_generation";


        else if(text.includes("strategy"))

            intent="creator_strategy";




        const profile =

        getProfile(userId);




        const strategy =

        generateCreatorStrategy(

            userId

        );




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

                strategy

            }

        );



        res.json({

            success:true,

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
// FEEDBACK LEARNING
// =====================================


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
// V6.6 PREDICTION
// =====================================


app.post("/api/predict",(req,res)=>{


    try{


        const {

            content

        } = req.body;




        const prediction =

        predictContent(

            content

        );



        const hook =

        scoreHook(

            content

        );



        const contentScore =

        scoreContent(

            content

        );



        const audience =

        predictAudience(

            content

        );



        res.json({

            success:true,

            prediction,

            hook,

            contentScore,

            audience,

            improvements:

            recommendImprovements(

                prediction

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
// GROWTH REPORT
// =====================================


app.post("/api/growth-report",(req,res)=>{


    try{


        const {

            content

        } = req.body;



        const report =

        generateGrowthReport(

            content

        );



        res.json({

            success:true,

            report

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
// START SERVER
// =====================================


const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

        `🚀 ChatTBM V6.6 running on port ${PORT}`

    );


});
