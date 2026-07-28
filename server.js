// =====================================
// ChatTBM Backend V5.1
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
// CHATTBM AI ENGINES
// =====================================


// Intent Detection Engine

const {
    detectIntent
} = require("./services/intentEngine");




// Memory Engine

const {
    saveMemory,
    getMemory,
    getAllMemory,
    addMemoryNote,
    clearMemory
} = require("./services/memoryEngine");




// Memory Learning Engine

const {
    learnFromMessage
} = require("./services/memoryLearning");




// Response Engine

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
// CONVERSATION HISTORY
// =====================================


const conversations = {};

const MAX_HISTORY = 30;





// =====================================
// CREATE CONVERSATION
// =====================================

function createConversation(
    conversationId
){


    if(
        !conversations[conversationId]
    ){

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


    createConversation(
        conversationId
    );



    conversations[conversationId]
    .push({

        role,

        message,

        timestamp:
        new Date().toISOString()

    });




    if(
        conversations[conversationId].length
        >
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

function getConversation(
    conversationId
){


    createConversation(
        conversationId
    );


    return conversations[conversationId];


}

// =====================================
// ChatTBM Backend V5.1
// Part 2/3
// Health Check + Chat API Pipeline
// =====================================



// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {


    res.json({

        app:
        "ChatTBM Backend",


        version:
        "5.1",


        status:
        "Running ✅",


        engines: {

            intent:
            "Active 🧠",

            memory:
            "Active 💾",

            learning:
            "Active 📚",

            response:
            "Active 💬"

        },


        uptime:
        process.uptime()


    });


});





// =====================================
// CHAT API
// =====================================

app.post(
    "/api/chat",
    (req, res) => {


    try {



        const message =
        req.body.message;



        const conversationId =
        req.body.conversationId
        ||
        "guest-user";





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
        // MEMORY LEARNING
        // =============================


        learnFromMessage(

            conversationId,

            message

        );

        // =============================
// SAVE CONVERSATION FACTS
// =============================

saveFact(

    conversationId,

    message

);







        // =============================
        // LOAD HISTORY
        // =============================


        const history =
        getConversation(

            conversationId

        );







        // =============================
        // DETECT USER INTENT
        // =============================


        const intent =
        detectIntent(

            message

        );







        // =============================
        // LOAD USER MEMORY
        // =============================


        const memory =
        getAllMemory(

            conversationId

        );







        // =============================
        // GENERATE RESPONSE
        // =============================


        const reply =
        generateResponse(

            intent,

            message,

            memory,

            history

        );







        // =============================
        // SAVE AI RESPONSE
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

            memory,

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
// ChatTBM Backend V5.1
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



app.listen(PORT, () => {



    console.log("");

    console.log(
    "=================================="
    );


    console.log(
    " ChatTBM Backend V5.1"
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
    " Memory Learning: Active 📚"
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
