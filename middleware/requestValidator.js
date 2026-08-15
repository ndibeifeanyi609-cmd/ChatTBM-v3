// =====================================
// ChatTBM V6.9.1
// Request Validation Middleware
//
// Purpose:
// - Validate API requests
// - Protect controllers
// - Improve backend stability
// =====================================



// =====================================
// VALIDATE CHAT REQUEST
// =====================================


function validateChatRequest(req, res, next){


    const {

        message

    } = req.body;





    if(

        !message ||

        typeof message !== "string" ||

        message.trim().length === 0

    ){


        return res.status(400).json({


            success:false,


            message:"A valid message is required"



        });


    }





    next();


}









// =====================================
// VALIDATE USER REQUEST
// =====================================


function validateUserRequest(req,res,next){


    if(

        !req.body.userId

    ){


        req.body.userId = "guest";


    }





    next();


}









// =====================================
// VALIDATE CONTENT REQUEST
// =====================================


function validateContentRequest(req,res,next){


    const {

        content

    } = req.body;





    if(

        !content ||

        typeof content !== "string"

    ){


        return res.status(400).json({


            success:false,


            message:"Valid content is required"



        });


    }





    next();


}









// =====================================
// EXPORTS
// =====================================


module.exports = {


    validateChatRequest,


    validateUserRequest,


    validateContentRequest


};
