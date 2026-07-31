// =====================================
// ChatTBM V6.0.4
// Personal AI Brain Backend
// Memory Learning Feedback Loop
// =====================================


require("dotenv").config();

const express = require("express");
const cors = require("cors");


// ===============================
// SERVICES
// ===============================

const {
    generateResponse
} = require("./services/responseEngine");


const {
    saveFeedback,
    analyzeFeedback
} = require("./services/feedbackEngine");



// ===============================
// APP SETUP
// ===============================

const app = express();


app.use(cors());

app.use(express.json());



// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req,res)=>{

    res.json({

        app:"ChatTBM AI Backend",

        version:"V6.0.4",

        status:"Online 🚀"

    });

});




// ===============================
// CHAT ENGINE
// ===============================

app.post("/api/chat",(req,res)=>{


    try{


        const {

            message,

            userId="guest"


        } = req.body;



        if(!message){

            return res.json({

                success:false,

                message:"No message received"

            });

        }



        // Simple intent detection
        let intent = "general";


        const text =
        message.toLowerCase();



        if(text.includes("script")){

            intent="script_generation";

        }


        else if(text.includes("caption")){

            intent="caption_generation";

        }


        else if(text.includes("idea")){

            intent="idea_generation";

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

            {}

        );





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






// ===============================
// FEEDBACK LEARNING SYSTEM
// ===============================

app.post("/api/feedback",(req,res)=>{


    try{


        const result =

        saveFeedback(

            req.body

        );


        res.json(result);


    }


    catch(error){


        res.status(500).json({

            success:false,

            error:error.message

        });


    }


});






// ===============================
// FEEDBACK ANALYTICS
// ===============================

app.get("/api/feedback",

(req,res)=>{


    res.json(

        analyzeFeedback()

    );


});






// ===============================
// START SERVER
// ===============================


const PORT =

process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

        `🚀 ChatTBM V6.0.4 running on port ${PORT}`

    );


});
