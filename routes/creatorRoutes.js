// =====================================
// ChatTBM V6.9.1
// Creator Routes
// =====================================


const express = require("express");

const router = express.Router();





const {

    creatorHandler

} = require("../controllers/creatorController");





const {

    validateUserRequest

} = require("../middleware/requestValidator");









// =====================================
// CREATOR PROFILE / BRAIN
// =====================================


router.get(

"/:userId",

validateUserRequest,

creatorHandler

);









module.exports = router;
