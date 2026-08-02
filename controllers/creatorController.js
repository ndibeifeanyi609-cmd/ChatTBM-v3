// =====================================
// ChatTBM V6.8.3
// Creator Controller
//
// Purpose:
// - Handle creator profile requests
// =====================================


function creatorHandler(req, res){

    res.json({

        success:true,

        message:"Creator controller ready"

    });

}



module.exports = {

    creatorHandler

};
