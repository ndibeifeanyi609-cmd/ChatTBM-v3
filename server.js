// =====================================
// ChatTBM V6.7.7
// Creator Intelligence Backend
//
// Systems:
// - Response Intelligence
// - Creator Identity
// - Creator Memory
// - Brand Voice
// - Adaptive Response
// - Adaptive Brain
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
// RESPONSE ENGINE
// =====================================


const {

    generateResponse,

    connectAdaptiveEngine

} = require("./services/responseEngine");








// =====================================
// ADAPTIVE IDENTITY BRIDGE
// =====================================


const AdaptiveIdentityBridge =

require("./services/adaptiveIdentityBridge");





const identityBridge =

new AdaptiveIdentityBridge();





connectAdaptiveEngine(

    identityBridge

);








// =====================================
// INTENT ENGINE
// =====================================


const {

    detectIntent

} = require("./services/intentEngine");

// =====================================
// CREATOR LEARNING ENGINE
// =====================================


const {

    analyzeCreatorInput

} = require("./services/creatorLearningEngine");








// =====================================
// CREATOR IDENTITY ENGINE
// =====================================


const {

    learnCreatorIdentity,

    getCreatorIdentity

} = require("./services/creatorIdentityEngine");








// =====================================
// CREATOR MEMORY ENGINE
// =====================================


const {

    learnCreatorMemory,

    getCreatorMemory

} = require("./services/creatorMemoryEngine");








// =====================================
// BRAND VOICE ENGINE
// =====================================


const {

    learnBrandVoice,

    getBrandVoice

} = require("./services/brandVoiceEngine");








// =====================================
// USER PROFILE ENGINE
// =====================================


const {

    getProfile

} = require("./services/userProfileEngine");








// =====================================
// CREATOR STRATEGY ENGINE
// =====================================


const {

    generateCreatorStrategy,

    generateContentIdeas,

    generateScriptOutline

} = require("./services/creatorStrategyEngine");

// =====================================
// RELATIONSHIP INTELLIGENCE
// =====================================


const RelationshipIntelligenceEngine =

require("./services/relationshipIntelligenceEngine");





const relationshipEngine =

new RelationshipIntelligenceEngine();








// =====================================
// CREATOR GROWTH INTELLIGENCE
// =====================================


const {

    analyzeContentPerformance,

    generateGrowthRecommendations,

    getGrowthProfile

} = require("./services/creatorGrowthEngine");








// =====================================
// FEEDBACK ENGINE
// =====================================


const {

    saveFeedback,

    analyzeFeedback

} = require("./services/feedbackEngine");








// =====================================
// PERFORMANCE LEARNING ENGINE
// =====================================


const {

    analyzePerformanceFeedback

} = require("./services/performanceLearningEngine");








// =====================================
// SERVER HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:"ChatTBM AI Backend",


        version:"V6.7.7",


        status:"Creator Intelligence Online 🚀"



    });


});

// =====================================
// CHAT ENGINE V6.7.7
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
        // LEARNING SYSTEMS
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
        // AUDIENCE RELATIONSHIP LEARNING
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
        // RESPONSE GENERATION
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
// CREATOR GROWTH ANALYSIS
// =====================================


app.post("/api/growth/analyze",(req,res)=>{


    try{


        const {


            userId="guest",


            content,


            views=0,


            likes=0,


            comments=0,


            feedback=""


        } = req.body;







        const growth =

        analyzeContentPerformance(

            userId,

            {


                content,

                views,

                likes,

                comments,

                feedback


            }

        );








        const recommendations =

        generateGrowthRecommendations(

            userId

        );








        res.json({


            success:true,


            growth,


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
// CREATOR GROWTH PROFILE
// =====================================


app.get("/api/growth/:userId",(req,res)=>{


    res.json({


        success:true,


        growth:

        getGrowthProfile(

            req.params.userId

        ),



        recommendations:

        generateGrowthRecommendations(

            req.params.userId

        )



    });


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



        memory:

        getCreatorMemory(userId),



        voice:

        getBrandVoice(userId),



        growth:

        getGrowthProfile(userId)



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
// FEEDBACK
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

        `🚀 ChatTBM V6.7.7 running on port ${PORT}`

    );


});
