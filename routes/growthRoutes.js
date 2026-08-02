// =====================================
// ChatTBM V6.8.6
// Growth Routes
//
// Connects:
// Route → Controller → Growth Intelligence
// =====================================


const express = require("express");


const router = express.Router();





const {

    growthHandler

} = require("../controllers/growthController");









// POST /api/growth-v2

router.post(

    "/",

    growthHandler

);









module.exports = router;
