// =====================================
// ChatTBM V6.8.4
// Creator Intelligence Backend
//
// Systems:
// - Creator Brain Orchestrator
// - Response Intelligence
// - Adaptive Intelligence
// - Memory Intelligence
// - Growth Intelligence
// - Feedback Learning
// - Route Layer Integration
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
// ROUTE LAYER V6.8.4
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


const {


    generateResponse,


    connectAdaptiveEngine


} = require("./services/responseEngine");





const {


    detectIntent


} = require("./services/intentEngine");





const CreatorBrainOrchestrator =

require("./services/creatorBrainOrchestrator");





const creatorBrain =

new CreatorBrainOrchestrator();

// =====================================
// CREATOR LEARNING SYSTEM
// =====================================


const {

    analyzeCreatorInput

} = require("./services/creatorLearningEngine");









// =====================================
// CREATOR IDENTITY SYSTEM
// =====================================


const {

    learnCreatorIdentity,

    getCreatorIdentity

} = require("./services/creatorIdentityEngine");









// =====================================
// BRAND VOICE SYSTEM
// =====================================


const {

    learnBrandVoice,

    getBrandVoice

} = require("./services/brandVoiceEngine");









// =====================================
// CREATOR MEMORY SYSTEM
// =====================================


const {

    learnCreatorMemory,

    getCreatorMemory

} = require("./services/creatorMemoryEngine");









// =====================================
// CREATOR STRATEGY SYSTEM
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");









// =====================================
// CREATOR GROWTH SYSTEM
// =====================================


const {

    analyzeContentPerformance,

    generateGrowthRecommendations,

    getGrowthProfile

} = require("./services/creatorGrowthEngine");









// =====================================
// FEEDBACK LEARNING SYSTEM
// =====================================


const {

    saveFeedback,

    analyzeFeedback

} = require("./services/feedbackEngine");









const {

    analyzePerformanceFeedback

} = require("./services/performanceLearningEngine");









// =====================================
// RELATIONSHIP INTELLIGENCE
// =====================================


const RelationshipIntelligenceEngine =

require("./services/relationshipIntelligenceEngine");





const relationshipEngine =

new RelationshipIntelligenceEngine();









// =====================================
// CONNECT INTELLIGENCE
// =====================================


connectAdaptiveEngine({

    creatorBrain

});

// =====================================
// API ROUTE CONNECTION
// =====================================
// V6.8.4 Route Layer
// Existing V6.8.2 routes remain active
// =====================================


app.use(

    "/api/chat-v2",

    chatRoutes

);



app.use(

    "/api/creator",

    creatorRoutes

);



app.use(

    "/api/growth-v2",

    growthRoutes

);



app.use(

    "/api/feedback-v2",

    feedbackRoutes

);









// =====================================
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:"ChatTBM AI Backend",


        version:"V6.8.4",


        status:"Creator Intelligence Online 🚀"


    });


});









// =====================================
// ORIGINAL CHAT ENGINE
// V6.8.2 CORE PRESERVED
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








        // =====================================
        // CREATOR LEARNING
        // =====================================


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









        // =====================================
        // RELATIONSHIP LEARNING
        // =====================================


        relationshipEngine.analyzeContent(

            userId,

            message

        );

// =====================================
// BUILD CREATOR BRAIN
// =====================================


const brain =

creatorBrain.analyze(

    userId,

    message

);









// =====================================
// INTENT DETECTION
// =====================================


const intent =

detectIntent(

    message

);









// =====================================
// CREATOR STRATEGY
// =====================================


const strategy =

generateCreatorStrategy(

    userId

);









// =====================================
// RESPONSE INTELLIGENCE
// =====================================


const response =

generateResponse(

    intent,

    message,

    brain.profile.memory || {},

    [],

    {},

    [],

    {},

    [],

    {


        userId,


        profile:

        brain.profile,



        strategy,



        brainContext:

        brain.brainContext



    }

);









// =====================================
// RETURN RESPONSE
// =====================================


res.json({


    success:true,


    version:"V6.8.4",


    intent,


    response,


    strategy,


    creatorBrain:{


        active:true,


        context:

        brain.brainContext


    }



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
// CREATOR BRAIN STATUS
// =====================================


app.get(

"/api/creator-brain/:userId",

(req,res)=>{


    const userId =

    req.params.userId;





    res.json({


        success:true,


        brain:

        creatorBrain.getBrainStatus(

            userId

        ),



        profile:

        creatorBrain.buildCreatorProfile(

            userId

        )



    });


});

// =====================================
// CREATOR STRATEGY ROUTE
// =====================================


app.get(

"/api/strategy/:userId",

(req,res)=>{


    const userId =

    req.params.userId;





    res.json({


        success:true,



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


});









// =====================================
// GROWTH ANALYSIS
// =====================================


app.post(

"/api/growth/analyze",

(req,res)=>{


    try{


        const {


            userId="guest",


            content


        } = req.body;





        const performance =

        analyzeContentPerformance(

            userId,

            content

        );





        const recommendations =

        generateGrowthRecommendations(

            userId

        );





        res.json({


            success:true,


            performance,


            recommendations


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


app.post(

"/api/feedback",

(req,res)=>{


    const {


        userId="guest",


        correction


    } = req.body;





    const feedback =

    saveFeedback({


        userId,


        correction


    });





    analyzePerformanceFeedback(

        userId,

        correction

    );





    res.json({


        success:true,


        feedback


    });


});









// =====================================
// FEEDBACK REPORT
// =====================================


app.get(

"/api/feedback",

(req,res)=>{


    res.json(

        analyzeFeedback()

    );


});









// =====================================
// SERVER START
// =====================================


const PORT =

process.env.PORT || 3000;







app.listen(

PORT,

()=>{


    console.log(

        `🚀 ChatTBM V6.8.4 running on port ${PORT}`

    );


});
