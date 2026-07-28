// =====================================
// ChatTBM Backend V5.0
// Part 1/3
// Core Server + AI Engine Connections
// =====================================


require("dotenv").config();


// =====================================
// IMPORT PACKAGES
// =====================================

const express = require("express");

const cors = require("cors");


// =====================================
// CHATTBM V5 AI ENGINES
// =====================================

const {
    detectIntent
} = require("./services/intentEngine");


const {
    saveMemory,
    getMemory
} = require("./services/memoryEngine");


const {
    generateResponse
} = require("./services/responseEngine");



// =====================================
// CREATE SERVER
// =====================================

const app = express();



// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());




// =====================================
// CONVERSATION MEMORY
// =====================================
// Temporary storage
// Later upgrade:
// MongoDB / PostgreSQL
// =====================================


const conversations = {};

const MAX_HISTORY = 30;



// =====================================
// CREATE CONVERSATION
// =====================================

function createConversation(conversationId){

    if(!conversations[conversationId]){

        conversations[conversationId] = [];

    }

}




// =====================================
// SAVE MESSAGE
// =====================================

function saveMessage(
    conversationId,
    role,
    message
){

    createConversation(conversationId);


    conversations[conversationId].push({

        role,

        message,

        timestamp:
        new Date().toISOString()

    });



    if(
        conversations[conversationId].length >
        MAX_HISTORY
    ){

        conversations[conversationId] =
        conversations[conversationId]
        .slice(-MAX_HISTORY);

    }

}




// =====================================
// GET CONVERSATION
// =====================================

function getConversation(conversationId){

    createConversation(conversationId);


    return conversations[conversationId];

}




// =====================================
// CLEAR CONVERSATION
// =====================================

function clearConversation(conversationId){

    conversations[conversationId] = [];

}



// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req,res)=>{


    res.json({

        app:
        "ChatTBM Backend",


        version:
        "5.0",


        status:
        "Running ✅",


        ai:
        "Connected 🧠",


        memory:
        "Active 💾",


        uptime:
        process.uptime()

    });


});

// =====================================
// ChatTBM Backend V5.0
// Part 2/3
// Chat API + AI Pipeline
// =====================================



// =====================================
// CHAT ENDPOINT
// =====================================

app.post("/api/chat", (req, res) => {


    try {


        const message =
        req.body.message;



        const conversationId =
        req.body.conversationId
        || "default-user";




        // =============================
        // VALIDATION
        // =============================


        if(
            !message ||
            typeof message !== "string" ||
            message.trim() === ""
        ){

            return res.status(400).json({

                success:false,

                reply:
                "Please enter a message."

            });

        }




        // =============================
        // SAVE USER MESSAGE
        // =============================


        saveMessage(

            conversationId,

            "user",

            message

        );





        // =============================
        // LOAD CHAT HISTORY
        // =============================


        const history =
        getConversation(
            conversationId
        );





        // =============================
        // V5 AI PIPELINE
        // =============================


        // Understand user request
        const intent =
        detectIntent(message);




      // Load user memory profile

const memory =
getAllMemory(
    conversationId
);




        // Generate AI response
        const reply =
        generateResponse(

            intent,

            message,

            memory

        );





        // =============================
        // SAVE ASSISTANT RESPONSE
        // =============================


        saveMessage(

            conversationId,

            "assistant",

            reply

        );





        // =============================
        // SEND RESPONSE
        // =============================


        return res.json({

            success:true,

            reply,

            intent,

            conversationId,

            historyLength:
            history.length

        });



    }


    catch(error){


        console.error(

            "ChatTBM Error:",

            error

        );



        return res.status(500).json({

            success:false,

            reply:
            "Something went wrong. Please try again."

        });


    }


});

// =====================================
// ChatTBM Backend V5.0
// Part 3/3
// Error Handling + Server Startup
// =====================================



// =====================================
// 404 ROUTE HANDLER
// =====================================

app.use((req, res) => {


    res.status(404).json({

        success:false,

        error:
        "Route not found."

    });


});




// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {


    console.error(

        "Server Error:",

        err

    );



    res.status(500).json({

        success:false,

        error:
        "Internal Server Error."

    });


});




// =====================================
// START SERVER
// =====================================


const PORT =
process.env.PORT || 3000;



app.listen(PORT, ()=>{


    console.log("");

    console.log(
    "=================================="
    );


    console.log(
    " ChatTBM Backend V5.0"
    );


    console.log(
    "=================================="
    );


    console.log(
    ` Server running on port ${PORT}`
    );


    console.log(
    " Intent Engine: Active 🧠"
    );


    console.log(
    " Memory Engine: Active 💾"
    );


    console.log(
    " Response Engine: Active 💬"
    );


    console.log(
    " Status: Online 🚀"
    );


    console.log(
    "=================================="
    );


    console.log("");


});
