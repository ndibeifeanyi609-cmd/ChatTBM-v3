// =====================================
// ChatTBM V6.8.6
// Feedback Routes
//
// Connects:
// Route → Controller → Learning System
// =====================================


const express = require("express");


const router = express.Router();





const {

    feedbackHandler,

    feedbackReport

} = require("../controllers/feedbackController");









// POST /api/feedback-v2

router.post(

    "/",

    feedbackHandler

);









// GET /api/feedback-v2/report

router.get(

    "/report",

    feedbackReport

);









module.exports = router;
