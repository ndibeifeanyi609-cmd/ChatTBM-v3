// =====================================
// ChatTBM V7.0
// Chat Routes
// =====================================

const express = require("express");

const router = express.Router();

const {

    chatHandler,
    chatStreamHandler

} = require("../controllers/chatController");

// =====================================
// CHAT
// =====================================

router.post(

    "/",

    chatHandler

);

router.post('/stream', chatStreamHandler);

// =====================================
// EXPORT
// =====================================

module.exports = router;
