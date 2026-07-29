// =====================================
// ChatTBM Backend V5.9
// Part 1
// Core Setup + AI Engine Connections
// =====================================


require("dotenv").config();


// =====================================
// IMPORT PACKAGES
// =====================================

const express = require("express");

const cors = require("cors");


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
// CHATTBM AI ENGINES
// =====================================


// Intent Engine

const {
    detectIntent

} = require("./services/intentEngine");




// Response Engine
// Your actual filename is responseEngine.js

const {
    generateResponse

} = require("./services/responseEngine");




// =====================================
// EXISTING MEMORY SYSTEM
// =====================================


const {

    saveMemory,
    getMemory,
    getAllMemory,
    addMemoryNote,
    clearMemory

} = require("./services/memoryEngine");




const {

    learnFromMessage

} = require("./services/memoryLearning");





const {

    saveFact,
    getFact,
    getFacts,
    addTimeline,
    getTimeline,
    clearConversationMemory

} = require("./services/conversationMemory");





const {

    retrieveMemory

} = require("./services/memoryRetrieval");




// =====================================
// AI PERSONALITY SYSTEM
// =====================================


const AIIdentityEngine =

require("./services/aiIdentityEngine");




const AdaptiveResponseEngine =

require("./services/adaptiveResponseEngine");




// =====================================
// CONTEXT ENGINE
// =====================================


const {

    handleContextRequest

} = require("./services/contextEngine");




// =====================================
// USER PROFILE SYSTEM
// =====================================


const userProfile =

require("./services/userProfile");




// =====================================
// V5.9 TRUE CONVERSATIONAL MEMORY
// =====================================


// Conversation Timeline

const conversationTimeline =

require("./services/conversationTimeline");




// Memory Extraction

const memoryExtractor =

require("./services/memoryExtractor");




// Relationship Learning

const relationshipEngine =

require("./services/relationshipEngine");




// Memory Importance Ranking

const memoryRanker =

require("./services/memoryRanker");




// Memory Retrieval Ranking
// V5.5 System

const {

    rankMemories

} = require("./services/memoryRanking");




// Memory Database

const memoryDatabase =

require("./services/memoryDatabase");




// =====================================
// CREATE AI INSTANCES
// =====================================


const identityEngine =

new AIIdentityEngine();




const adaptiveEngine =

new AdaptiveResponseEngine(

    identityEngine

);




// =====================================
// CONVERSATION CACHE
// =====================================


const conversations = {};

const MAX_HISTORY = 30;

// =====================================
// CHAT CONVERSATION SYSTEM
// =====================================


// =====================================
// CREATE CONVERSATION
// =====================================

function createConversation(conversationId){


    if(!conversations[conversationId]){


        conversations[conversationId] = [];


    }


}




// =====================================
// SAVE MESSAGE HISTORY
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

        created:

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
// GET CONVERSATION HISTORY
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
// CHATTBM V5.9
// TRUE MEMORY PIPELINE
// =====================================


function processConversationMemory(event){


    try{


        // =============================
        // 1. SAVE TO TIMELINE
        // =============================


        const timelineEvent =


        conversationTimeline.addEvent({


            userId:

            event.userId,


            role:

            event.role,


            message:

            event.message,


            intent:

            event.intent || "general",


            emotion:

            event.emotion || "neutral",


            topic:

            event.topic || "conversation",


            metadata:

            event.metadata || {}


        });






        // =============================
        // 2. EXTRACT MEMORIES
        // =============================


        memoryExtractor.extract(

            timelineEvent

        );







        // =============================
        // 3. LEARN RELATIONSHIPS
        // =============================


        relationshipEngine.learn(

            timelineEvent

        );







        // =============================
        // 4. RANK MEMORY IMPORTANCE
        // =============================


        const rankedMemory =


        memoryRanker.rank({


            ...timelineEvent,


            count: 1,


            timestamp:

            timelineEvent.timestamp


        });







        console.log(

            "🧠 V5.9 Memory:",

            rankedMemory.level,

            "| Score:",

            rankedMemory.score

        );





        return rankedMemory;



    }



    catch(error){



        console.error(


            "V5.9 Memory Pipeline Error:",


            error.message


        );



        return null;


    }


}

// =====================================
// ChatTBM Backend V5.9
// Health Check + Chat API
// =====================================



// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {


    res.json({

        app:

        "ChatTBM Backend",


        version:

        "5.9",


        status:

        "Running ✅",



        engines:{


            intent:

            "Active 🧠",


            response:

            "Active 💬",


            memory:

            "Active 💾",


            learning:

            "Active 📚",


            conversation:

            "Active 📝",


            identity:

            "Active 👤",


            adaptiveAI:

            "Active 🤖",



            // V5.9

            timeline:

            "Active 🕒",


            extractor:

            "Active 🔍",


            relationships:

            "Active 🔗",


            memoryRanker:

            "Active 🧠"


        },


        uptime:

        process.uptime(),



        conversations:

        Object.keys(conversations).length


    });


});





// =====================================
// CHAT API
// =====================================

app.post("/api/chat", (req,res)=>{


    try{


        const {


            message,


            conversationId = "guest-user"



        } = req.body;





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
        // V5.8 MEMORY LEARNING
        // =============================


        learnFromMessage(

            conversationId,

            message

        );







        // =============================
        // V5.9 MEMORY PIPELINE
        // =============================


        processConversationMemory({


            userId:

            conversationId,


            role:

            "user",


            message,


            topic:

            "conversation",


            metadata:{

                source:

                "user"

            }


        });







        // =============================
        // AI IDENTITY LEARNING
        // =============================


        identityEngine.learn(

            conversationId,

            message

        );







        // =============================
        // SAVE LAST FACT
        // =============================


        saveFact(

            conversationId,

            "lastMessage",

            message

        );







        // =============================
        // OLD TIMELINE SYSTEM
        // =============================


        addTimeline(

            conversationId,

            "User: " + message

        );







        // =============================
        // LOAD HISTORY
        // =============================


        const history =

        getConversation(

            conversationId

        );







        // =============================
        // DETECT INTENT
        // =============================


        const intent =

        detectIntent(

            message

        );







        // =============================
        // LOAD MEMORY
        // =============================


        const userMemory =

        getAllMemory(

            conversationId

        );







        // =============================
        // MEMORY RETRIEVAL
        // =============================


        const memory =

        retrieveMemory(

            userMemory,

            message

        );







        // =============================
        // MEMORY RANKING
        // V5.5 SYSTEM
        // =============================


        const rankedMemory =

        rankMemories(

            memory,

            message

        );







        // =============================
        // LOAD FACTS
        // =============================


        const facts =

        getFacts(

            conversationId

        );







        // =============================
        // LOAD TIMELINE
        // =============================


        const timeline =

        getTimeline(

            conversationId

        );







        // =============================
        // AI PERSONALITY CONTEXT
        // =============================


        const aiContext =

        adaptiveEngine.personalize(

            conversationId,

            message

        );







        // =============================
        // GENERATE RESPONSE
        // =============================


        const reply =

        generateResponse(


            intent,


            message,


            rankedMemory,


            history,


            facts,


            timeline,


            aiContext


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
        // V5.9 STORE AI RESPONSE
        // =============================


        processConversationMemory({


            userId:

            conversationId,


            role:

            "assistant",


            message:

            reply,


            intent,


            topic:

            "assistant-response",


            metadata:{

                source:

                "ChatTBM"

            }


        });







        // =============================
        // RESPONSE
        // =============================


        return res.json({


            success:true,


            reply,


            intent,


            memory,


            rankedMemory,


            facts,


            timeline,


            aiContext,


            conversationId,


            historyLength:

            history.length,


            timestamp:

            new Date().toISOString()


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

            "Something went wrong. Please try again.",


            error:

            process.env.NODE_ENV === "development"

            ?

            error.message

            :

            undefined


        });


    }


});

// =====================================
// ChatTBM V5.9
// Memory Debug System
// =====================================


// =====================================
// VIEW ALL MEMORY DATA
// =====================================

app.get("/api/memory", (req, res) => {


    try {


        res.json({


            success: true,


            timeline:

            conversationTimeline.getTimeline(),



            extractedMemory:

            memoryExtractor.getMemory(),



            relationships:

            relationshipEngine.getAll(),



            relationshipStats:

            relationshipEngine.getStats(),



            conversations:


            Object.keys(conversations).length


        });



    }


    catch(error){


        console.error(

            "Memory Debug Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:

            "Unable to load memory data."


        });


    }


});





// =====================================
// VIEW USER CONVERSATION MEMORY
// =====================================

app.get("/api/memory/:userId", (req,res)=>{


    try{


        const userId =

        req.params.userId;



        res.json({


            success:true,



            timeline:

            conversationTimeline.getTimeline(

                userId

            ),



            relationships:

            relationshipEngine.find(

                userId

            ),



            facts:

            getFacts(

                userId

            ),



            conversation:

            getConversation(

                userId

            )


        });



    }



    catch(error){


        console.error(

            "User Memory Error:",

            error

        );



        res.status(500).json({


            success:false,


            error:

            "Unable to load user memory."


        });


    }


});




// =====================================
// CLEAR USER MEMORY
// =====================================

app.delete("/api/memory/:userId",(req,res)=>{


    try{


        const userId =

        req.params.userId;



        clearConversationMemory(

            userId

        );


        clearConversation(

            userId

        );



        res.json({


            success:true,


            message:

            "User conversation memory cleared."


        });



    }



    catch(error){


        res.status(500).json({


            success:false,


            error:

            error.message


        });


    }


});





// =====================================
// 404 ROUTE HANDLER
// =====================================

app.use((req,res)=>{


    res.status(404).json({


        success:false,


        error:

        "Route not found.",



        path:

        req.originalUrl


    });


});





// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err,req,res,next)=>{


    console.error(

        "Server Error:",

        err

    );



    res.status(500).json({


        success:false,


        error:

        "Internal Server Error.",



        message:

        process.env.NODE_ENV === "development"

        ?

        err.message

        :

        "An unexpected error occurred."


    });


});

// =====================================
// ChatTBM Backend V5.9
// Server Startup
// =====================================


const PORT =

process.env.PORT || 3000;



app.listen(PORT, ()=>{


    console.clear();



    console.log("");

    console.log("=========================================");

    console.log("        ChatTBM Backend V5.9");

    console.log("=========================================");

    console.log("");



    console.log(

        `🚀 Server running on port ${PORT}`

    );


    console.log("");



    // =============================
    // CORE AI ENGINES
    // =============================


    console.log(

        "🧠 Intent Engine ............. Active"

    );


    console.log(

        "💬 Response Engine ........... Active"

    );



    console.log(

        "💾 Memory Engine ............. Active"

    );



    console.log(

        "📚 Memory Learning ........... Active"

    );



    console.log(

        "🔍 Memory Retrieval .......... Active"

    );




    // =============================
    // PERSONAL AI SYSTEM
    // =============================


    console.log(

        "👤 AI Identity Engine ........ Active"

    );



    console.log(

        "🤖 Adaptive AI Engine ........ Active"

    );



    console.log(

        "🧩 Context Engine ............ Active"

    );




    // =============================
    // V5.9 MEMORY SYSTEM
    // =============================


    console.log("");

    console.log(

        "🕒 Conversation Timeline ..... Active"

    );



    console.log(

        "🔍 Memory Extractor .......... Active"

    );



    console.log(

        "🔗 Relationship Engine ....... Active"

    );



    console.log(

        "🧠 Memory Ranker ............. Active"

    );



    console.log(

        "📊 Memory Ranking ............ Active"

    );



    console.log("");



    console.log(

        "✅ ChatTBM Backend V5.9 Ready"

    );



    console.log(

        "========================================="

    );


    console.log("");



});
