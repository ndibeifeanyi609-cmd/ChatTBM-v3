 // =====================================
// ChatTBM V6.7.8
// Creator Intelligence Backend
//
// Systems:
// - Response Intelligence
// - Adaptive Brain
// - Intelligence Fusion
// - Creator Memory
// - Creator Identity
// - Relationship Intelligence
// - Growth Intelligence
// - Feedback Learning
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
// CREATOR LEARNING SYSTEM
// =====================================


const {


    analyzeCreatorInput


} = require("./services/creatorLearningEngine");









// =====================================
// CREATOR IDENTITY
// =====================================


const {


    learnCreatorIdentity,


    getCreatorIdentity


} = require("./services/creatorIdentityEngine");









// =====================================
// BRAND VOICE
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
// USER PROFILE SYSTEM
// =====================================


const {


    getProfile


} = require("./services/userProfileEngine");









// =====================================
// CREATOR GROWTH INTELLIGENCE
// =====================================


const {


    analyzeContentPerformance,


    generateGrowthRecommendations,


    getGrowthProfile


} = require("./services/creatorGrowthEngine");









// =====================================
// GROWTH RECOMMENDATIONS
// =====================================


const {


    generateGrowthReport


} = require("./growthRecommendationEngine");









// =====================================
// FEEDBACK LEARNING
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
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:"ChatTBM AI Backend",


        version:"V6.7.8",


        status:"Creator Intelligence Online 🚀"



    });


});









// =====================================
// CHAT ENGINE V6.7.8
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
// BUILD CREATOR BRAIN CONTEXT
// =====================================


const profile =

getProfile(

    userId

);







const memory =

getCreatorMemory(

    userId

);









// =====================================
// RESPONSE INTELLIGENCE
// =====================================


const response =

generateResponse(

    intent,

    message,

    memory,

    [],

    {},

    [],

    {},

    [],

    {


        userId,


        profile,


        strategy,


        memory



    }

);









// =====================================
// GROWTH INTELLIGENCE
// =====================================


const growth =

getGrowthProfile(

    userId

);









// =====================================
// RETURN RESPONSE
// =====================================


res.json({


    success:true,


    version:"V6.7.8",


    intent,


    response,


    strategy,


    growth



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
// CREATOR BRAIN PROFILE
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

        getCreatorMemory(userId),



        growth:

        getGrowthProfile(userId)



    });


});









// =====================================
// CREATOR STRATEGY ROUTE
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
// GROWTH ANALYSIS
// =====================================


app.post("/api/growth/analyze",(req,res)=>{


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








        analyzePerformanceFeedback(

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
// FEEDBACK REPORT
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

        `🚀 ChatTBM V6.7.8 running on port ${PORT}`

    );


});
