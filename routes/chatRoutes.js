// =====================================
// ChatTBM V6.8.6
// Chat Routes
//
// Connects:
// Route → Controller → Intelligence
// =====================================


const express = require("express");


const router = express.Router();





const {

    chatHandler

} = require("../controllers/chatController");









// POST /api/chat-v2

router.post(

    "/",

    chatHandler

);









module.exports = router;
