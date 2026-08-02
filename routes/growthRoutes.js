// =====================================
// ChatTBM V6.9.1
// Growth Routes
// =====================================


const express = require("express");

const router = express.Router();





const {

    growthHandler

} = require("../controllers/growthController");





const {

    validateUserRequest,

    validateContentRequest

} = require("../middleware/requestValidator");









// =====================================
// CONTENT GROWTH ANALYSIS
// =====================================


router.post(

"/analyze",

validateUserRequest,

validateContentRequest,

growthHandler

);









module.exports = router;
