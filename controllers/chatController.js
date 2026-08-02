// =====================================
// ChatTBM V6.8.3
// Chat Controller
//
// Purpose:
// - Handle chat requests
// - Connect routes to intelligence layer
// =====================================



function chatHandler(req,res){


    res.json({


        success:true,


        message:"Chat controller ready"



    });


}







module.exports = {


    chatHandler


};
