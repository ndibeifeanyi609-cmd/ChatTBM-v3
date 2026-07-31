// =====================================
// ChatTBM V6.1
// Personal AI Brain Backend
// Memory + Learning + Feedback System
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

    buildMemoryContext,

    saveMemory

} = require("./services/memoryEngine");




const {

    saveFeedback,

    analyzeFeedback

} = require("./services/feedbackEngine");





// =====================================
// APP SETUP
// =====================================


const app = express();


app.use(cors());


app.use(express.json());





// =====================================
// HEALTH CHECK
// =====================================


app.get("/", (req,res)=>{


    res.json({

        app:"ChatTBM AI Backend",

        version:"V6.1",

        status:"Online 🚀",

        systems:[

            "Memory Brain",

            "Learning Brain",

            "Feedback Loop",

            "Response Engine"

        ]

    });


});





// =====================================
// INTENT DETECTOR
// =====================================


function detectIntent(message){


    const text =

    message.toLowerCase();



    if(text.includes("script"))

        return "script_generation";



    if(text.includes("caption"))

        return "caption_generation";



    if(text.includes("idea"))

        return "idea_generation";



    if(text.includes("advert"))

        return "advert_generation";



    if(text.includes("calendar"))

        return "calendar_generation";



    return "general";


}

// =====================================
// CHAT API
// =====================================

app.post("/api/chat",(req,res)=>{


    try{


        const {

            message,

            userId = "guest"


        } = req.body;




        if(!message){


            return res.status(400).json({


                success:false,


                message:"No message received"


            });


        }





        // ===============================
        // DETECT INTENT
        // ===============================

        const intent =

        detectIntent(

            message

        );





        // ===============================
        // LOAD MEMORY BRAIN
        // ===============================

        const memoryContext =

        buildMemoryContext(

            userId

        );





        const brainContext = {


            memoryContext,


            relationships:[]


        };





        // ===============================
        // GENERATE PERSONALIZED RESPONSE
        // ===============================

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


            brainContext,


            userId


        );





        // ===============================
        // SAVE USER MEMORY
        // ===============================

        saveMemory(


            userId,


            "conversation",


            message,


            {


                score:5,


                level:"TEMPORARY"


            }


        );





        // ===============================
        // RETURN RESPONSE
        // ===============================

        res.json({


            success:true,


            response


        });



    }



    catch(error){


        console.error(

            "ChatTBM Error:",

            error

        );



        res.status(500).json({


            success:false,


            message:"Server error"


        });


    }


});

// =====================================
// FEEDBACK LEARNING API
// =====================================

app.post("/api/feedback",(req,res)=>{


    try{


        const result =

        saveFeedback(

            req.body

        );



        res.json(result);



    }


    catch(error){


        console.error(

            "Feedback Error:",

            error

        );



        res.status(500).json({


            success:false,


            message:"Feedback processing failed"


        });


    }


});





// =====================================
// FEEDBACK ANALYTICS
// =====================================

app.get("/api/feedback",(req,res)=>{


    try{


        res.json({


            success:true,


            data:

            analyzeFeedback()


        });



    }


    catch(error){


        res.status(500).json({


            success:false,


            message:"Unable to load feedback data"


        });


    }


});





// =====================================
// 404 HANDLER
// =====================================

app.use((req,res)=>{


    res.status(404).json({


        success:false,


        message:"Route not found"


    });


});





// =====================================
// START SERVER
// =====================================

const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log("");

    console.log("================================");

    console.log("🚀 ChatTBM V6.1 Backend Online");

    console.log("================================");

    console.log(`Port: ${PORT}`);

    console.log("🧠 Memory Brain: ACTIVE");

    console.log("📚 Learning Brain: ACTIVE");

    console.log("🔄 Feedback Loop: ACTIVE");

    console.log("🤖 Response Engine: ACTIVE");

    console.log("================================");


});
