// =====================================
// ChatTBM V7.0
// Chat Routes
// =====================================

const express = require("express");

const router = express.Router();

const {

    chatHandler

} = require("../controllers/chatController");

// =====================================
// CHAT
// =====================================

router.post(

    "/",

    chatHandler

);

// =====================================
// EXPORT
// =====================================

module.exports = router;
