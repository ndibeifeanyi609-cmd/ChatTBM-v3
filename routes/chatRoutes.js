// =====================================
// ChatTBM V6.9.1
// Chat Routes
// =====================================


const express = require("express");

const router = express.Router();





const {

    chatHandler

} = require("../controllers/chatController");





const {

    validateChatRequest,

    validateUserRequest

} = require("../middleware/requestValidator");









// =====================================
// CHAT ENDPOINT
// =====================================


router.post(

"/",

validateUserRequest,

validateChatRequest,

chatHandler

);









module.exports = router;
