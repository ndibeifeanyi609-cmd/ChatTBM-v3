// =====================================
// ChatTBM V6.8.6
// Creator Routes
//
// Connects:
// Route → Controller → Creator Intelligence
// =====================================


const express = require("express");


const router = express.Router();





const {

    creatorHandler

} = require("../controllers/creatorController");









// GET /api/creator/:userId

router.get(

    "/:userId",

    creatorHandler

);









module.exports = router;
