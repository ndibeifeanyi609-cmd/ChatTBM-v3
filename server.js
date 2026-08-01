// =====================================
// ChatTBM V6.7
// Creator Memory Backend
//
// Systems:
// - AI Response
// - Feedback Learning
// - Creator Intelligence
// - Viral Memory
// - Creator Memory Upgrade
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
// LEARNING SYSTEM
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
// V6.7 CREATOR MEMORY
// =====================================


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
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({

        app:"ChatTBM AI Backend",

        version:"V6.7",

        status:"Creator Memory Online 🚀"


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




        analyzeCreatorInput(

            userId,

            message

        );



        // Learn creator style

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





        const strategy =

        generateCreatorStrategy(

            userId

        );





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



    }

    catch(error){


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
// FEEDBACK
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

        `🚀 ChatTBM V7.0 Creator Brain running on port ${PORT}`

    );


});
