// =====================================
// ChatTBM V5.9.2
// Personal AI Brain Edition
// Server Core
// =====================================


require("dotenv").config();


const express = require("express");

const cors = require("cors");



const app = express();



app.use(cors());

app.use(express.json());




// =====================================
// CORE ENGINES
// =====================================


const {

    detectIntent

} = require("./services/intentEngine");



const {

    generateResponse

} = require("./services/responseEngine");




// =====================================
// MEMORY SYSTEM
// =====================================


const {

    learnFromMessage

} = require("./services/memoryLearning");



const {

    getFacts,

    saveFact,

    addTimeline,

    getTimeline

} = require("./services/conversationMemory");



const {

    buildBrainContext,

    learnBrain

} = require("./services/personalBrain");



const {

    getMemories,

    getBestMemories

} = require("./services/memoryDatabase");




// =====================================
// ADVANCED MEMORY
// =====================================


const conversationTimeline =

require("./services/conversationTimeline");



const memoryExtractor =

require("./services/memoryExtractor");



const relationshipEngine =

require("./services/relationshipEngine");




// =====================================
// PERSONALITY SYSTEM
// =====================================


const AIIdentityEngine =

require("./services/aiIdentityEngine");



const AdaptiveResponseEngine =

require("./services/adaptiveResponseEngine");




const identityEngine =

new AIIdentityEngine();



const adaptiveEngine =

new AdaptiveResponseEngine(

    identityEngine

);




// =====================================
// USER PROFILE
// =====================================


const userProfile =

require("./services/userProfile");




// =====================================
// CHAT HISTORY
// =====================================


const conversations = {};

const MAX_HISTORY = 30;



// =====================================
// PART 1 COMPLETE
// =====================================

// =====================================
// CHAT ROUTE
// Personal AI Brain Processing
// =====================================


app.post("/chat", async (req, res) => {


    try {


        const {

            userId = "guest",

            message

        } = req.body;




        if(!message){

            return res.json({

                success:false,

                message:"No message provided"

            });

        }





        // =====================================
        // STORE HISTORY
        // =====================================


        if(!conversations[userId]){

            conversations[userId] = [];

        }



        conversations[userId].push({

            role:"user",

            message,

            timestamp:

            new Date().toISOString()

        });



        if(

            conversations[userId].length >

            MAX_HISTORY

        ){

            conversations[userId].shift();

        }





        const history =

        conversations[userId];





        // =====================================
        // DETECT INTENT
        // =====================================


        const intent =

        detectIntent(

            message

        );





        // =====================================
        // LEARN USER INFORMATION
        // =====================================


        learnFromMessage(

            userId,

            message

        );




        learnBrain(

            userId,

            message

        );





        // =====================================
        // ADVANCED MEMORY LEARNING
        // =====================================


        const event = {

            userId,

            role:"user",

            message,

            intent,

            topic:intent

        };



        memoryExtractor.extract(

            event

        );



        relationshipEngine.learn(

            event

        );



        conversationTimeline.addEvent(

            event

        );





        // =====================================
        // BUILD PERSONAL BRAIN
        // =====================================


        const brainContext =

        buildBrainContext(

            userId,

            message,

            getFacts(userId)

        );





        // =====================================
        // GET MEMORY
        // =====================================


        const longTermMemory =

        getBestMemories(

            userId,

            5

        );





        // =====================================
        // PERSONALITY LEARNING
        // =====================================


        identityEngine.learn(

            userId,

            message

        );



        const aiContext =

        adaptiveEngine.personalize(

            userId,

            message

        );





        // =====================================
        // GENERATE RESPONSE
        // =====================================


        const response =

        generateResponse(

            intent,

            message,

            {},

            history,

            getFacts(userId),

            getTimeline(userId),

            aiContext,

            longTermMemory,

            brainContext

        );





        // =====================================
        // SAVE ASSISTANT RESPONSE
        // =====================================


        conversations[userId].push({

            role:"assistant",

            message:response,

            timestamp:

            new Date().toISOString()

        });





        res.json({

            success:true,

            intent,

            response,

            memory:

            brainContext

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
// TEST ROUTE
// =====================================

app.get("/", (req,res)=>{


    res.send(

        "ChatTBM V5.9.2 Brain Online"

    );


});

// =====================================
// SERVER START
// =====================================


const PORT =

process.env.PORT || 3000;



app.listen(PORT, ()=>{


    console.log(

        `🚀 ChatTBM V5.9.2 running on port ${PORT}`

    );


});
