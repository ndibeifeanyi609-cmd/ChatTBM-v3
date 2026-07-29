// =====================================
// ChatTBM Backend V5.9.1
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
// CHATTBM CORE AI ENGINES
// =====================================


// Intent Detection Engine

const {

    detectIntent

} = require("./services/intentEngine");




// Response Generation Engine

const {

    generateResponse

} = require("./services/responseEngine");




// =====================================
// MEMORY ENGINE SYSTEM
// =====================================


const {

    getAllMemory

} = require("./services/memoryEngine");




const {

    learnFromMessage

} = require("./services/memoryLearning");




const {

    saveFact,

    getFacts,

    addTimeline,

    getTimeline,

    clearConversationMemory

} = require("./services/conversationMemory");




const {

    retrieveMemory

} = require("./services/memoryRetrieval");




// =====================================
// LONG TERM MEMORY DATABASE
// V5.9.1
// =====================================


const {

    saveMemory,

    getMemories,

    searchMemory,

    getBestMemories

} = require("./services/memoryDatabase");




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
// V5.9 ADVANCED MEMORY SYSTEM
// =====================================


// Conversation Timeline

const conversationTimeline =

require("./services/conversationTimeline");




// Memory Extractor

const memoryExtractor =

require("./services/memoryExtractor");




// Relationship Learning

const relationshipEngine =

require("./services/relationshipEngine");




// Memory Importance Ranker

const memoryRanker =

require("./services/memoryRanker");




// Legacy Memory Ranking
// Keep for compatibility

const {

    rankMemories

} = require("./services/memoryRanking");




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
// CONVERSATION STORAGE
// =====================================


const conversations = {};

const MAX_HISTORY = 30;

// =====================================
// ChatTBM Backend V5.9.1
// Part 2
// Conversation System + Memory Pipeline
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
// SAVE CHAT HISTORY
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
// GET CHAT HISTORY
// =====================================

function getConversation(conversationId){


    createConversation(conversationId);


    return conversations[conversationId];


}





// =====================================
// CLEAR CHAT HISTORY
// =====================================

function clearConversation(conversationId){


    conversations[conversationId] = [];


}





// =====================================
// V5.9.1 TRUE MEMORY PIPELINE
// =====================================


function processConversationMemory(event){


    try{


        // =============================
        // 1. SAVE EVENT TO TIMELINE
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
        // 2. EXTRACT MEMORY
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


            count:1,


            timestamp:

            timelineEvent.timestamp


        });





        // =============================
        // 5. SAVE IMPORTANT MEMORY
        // TO LONG TERM DATABASE
        // =============================


        if(rankedMemory && rankedMemory.score >= 20){


            saveMemory(

                event.userId,


                {

                    type:

                    "conversation",


                    value:

                    event.message,


                    score:

                    rankedMemory.score,


                    level:

                    rankedMemory.level,


                    metadata:{


                        intent:

                        event.intent || "general",


                        topic:

                        event.topic || "conversation",


                        source:

                        "ChatTBM",


                        timestamp:

                        new Date().toISOString()


                    }


                }

            );


        }





        console.log(

            "🧠 Memory Saved:",

            rankedMemory.level,

            "| Score:",

            rankedMemory.score

        );





        return rankedMemory;


    }



    catch(error){


        console.error(

            "Memory Pipeline Error:",

            error.message

        );


        return null;


    }


}

// =====================================
// ChatTBM Backend V5.9.1
// Part 3
// Chat API + AI Response Flow
// =====================================



// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {


    res.json({


        app:

        "ChatTBM Backend",


        version:

        "5.9.1",


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


            timeline:

            "Active 🕒",


            extractor:

            "Active 🔍",


            relationships:

            "Active 🔗",


            memoryRanker:

            "Active 🧠",


            adaptiveAI:

            "Active 🤖"


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
        // BASIC MEMORY LEARNING
        // =============================


        learnFromMessage(

            conversationId,

            message

        );






        // =============================
        // DETECT INTENT
        // =============================


        const intent =

        detectIntent(

            message

        );






        // =============================
        // ADVANCED MEMORY PIPELINE
        // =============================


        processConversationMemory({


            userId:

            conversationId,


            role:

            "user",


            message,


            intent,


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
        // SAVE FACT
        // =============================


        saveFact(

            conversationId,


            "lastMessage",


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
        // LOAD USER MEMORY
        // =============================


        const userMemory =

        getAllMemory(

            conversationId

        );






        // =============================
        // RETRIEVE RELEVANT MEMORY
        // =============================


        const memory =

        retrieveMemory(

            userMemory,

            message

        );






        // =============================
        // RANK MEMORY
        // =============================


        const rankedMemory =

        rankMemories(

            memory,

            message

        );






        // =============================
        // LOAD LONG TERM MEMORY
        // =============================


        const longTermMemory =

        getBestMemories(

            conversationId

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
        // AI PERSONAL CONTEXT
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


            aiContext,


            longTermMemory


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
        // STORE AI RESPONSE MEMORY
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
        // RETURN RESPONSE
        // =============================


        return res.json({


            success:true,


            reply,


            intent,


            memory,


            rankedMemory,


            longTermMemory,


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
// ChatTBM Backend V5.9.1
// Part 4
// Memory Routes + Error Handling + Server
// =====================================



// =====================================
// VIEW ALL MEMORY DATA
// =====================================

app.get("/api/memory", (req,res)=>{


    try{


        res.json({


            success:true,


            timeline:

            conversationTimeline.getTimeline(),



            extractedMemory:

            memoryExtractor.getMemory(),



            relationships:

            relationshipEngine.getAll(),



            relationshipStats:

            relationshipEngine.getStats(),



            databaseMemory:

            "Use /api/memory/:userId to view saved memories",



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
// VIEW USER MEMORY
// =====================================

app.get("/api/memory/:userId",(req,res)=>{


    try{


        const userId =

        req.params.userId;




        res.json({


            success:true,



            userId,



            timeline:

            conversationTimeline.getTimeline(

                userId

            ),



            extractedMemory:

            memoryExtractor.getMemory(),



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

            ),



            longTermMemory:

            getMemories(

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
// SEARCH MEMORY
// =====================================

app.get("/api/memory/search/:userId",

(req,res)=>{


    try{


        const userId =

        req.params.userId;



        const query =

        req.query.q;



        const results =

        searchMemory(

            userId,

            query

        );



        res.json({


            success:true,


            results


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
// CLEAR USER MEMORY
// =====================================

app.delete("/api/memory/:userId",

(req,res)=>{


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
// SERVER STARTUP
// =====================================

const PORT =

process.env.PORT || 3000;




app.listen(PORT,()=>{


    console.clear();



    console.log("");

    console.log("=========================================");

    console.log("       ChatTBM Backend V5.9.1");

    console.log("=========================================");

    console.log("");



    console.log(

        `🚀 Server running on port ${PORT}`

    );



    console.log("");



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


    console.log(

        "👤 AI Identity Engine ........ Active"

    );


    console.log(

        "🤖 Adaptive AI Engine ........ Active"

    );


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

        "🗄️ Memory Database ........... Active"

    );



    console.log("");



    console.log(

        "✅ ChatTBM Backend V5.9.1 Ready"

    );



    console.log("=========================================");

    console.log("");



});
