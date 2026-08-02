// =====================================
// ChatTBM V6.9.1
// Feedback Routes
// =====================================


const express = require("express");

const router = express.Router();





const {

    feedbackHandler,

    feedbackReport

} = require("../controllers/feedbackController");





const {

    validateUserRequest

} = require("../middleware/requestValidator");









// =====================================
// SAVE FEEDBACK
// =====================================


router.post(

"/",

validateUserRequest,

feedbackHandler

);









// =====================================
// FEEDBACK REPORT
// =====================================


router.get(

"/",

feedbackReport

);









module.exports = router;
