// =====================================
// ChatTBM V6.5
// Creator Intelligence Backend
//
// Connected Systems:
// - Response Intelligence
// - Memory Brain
// - Feedback Learning
// - User Profile Learning
// - Creator Memory
// - Content Performance Memory
// - Viral Pattern Memory
// - Creator Strategy Engine
// =====================================


require("dotenv").config();


const express = require("express");

const cors = require("cors");




// =====================================
// SERVICES
// =====================================


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

    learnViralPattern

} = require("./services/viralMemoryBridge");



const {

    generateCreatorStrategy

} = require("./services/creatorStrategyEngine");






// =====================================
// APP SETUP
// =====================================


const app = express();


app.use(cors());


app.use(express.json());






// =====================================
// HEALTH CHECK
// =====================================


app.get("/",(req,res)=>{


    res.json({


        app:

        "ChatTBM AI Backend",


        version:

        "V6.5",


        status:

        "Creator Intelligence Online 🚀"


    });


});






// =====================================
// MAIN CHAT ENGINE
// =====================================


app.post("/api/chat",(req,res)=>{


    try{


        const {


            message,


            userId="guest"


        } = req.body;





        if(!message){


            return res.json({


                success:false,


                message:

                "No message received"


            });


        }





        // Learn creator behaviour

        const creatorMemory =

        analyzeCreatorInput(

            userId,

            message

        );






        // Detect intent

        let intent = "general";


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

        getProfile(

            userId

        );






        let strategy = null;



        if(intent==="creator_strategy"){


            strategy =

            generateCreatorStrategy(

                userId

            );


        }






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

                creatorMemory,

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


        console.error(

            "ChatTBM Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:error.message


        });


    }


});
