// =====================================
// ChatTBM Backend V5.9.2
// Personal AI Brain Edition
// Part 1
// Core Setup + Engine Connections
// =====================================


require("dotenv").config();


// =====================================
// IMPORT PACKAGES
// =====================================

const express = require("express");

const cors = require("cors");


// =====================================
// CREATE SERVER
// =====================================

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

app.use(express.json());


// =====================================
// CHATTBM CORE ENGINES
// =====================================


// Intent Engine

const {

    detectIntent

} = require("./services/intentEngine");




// Response Engine

const {

    generateResponse

} = require("./services/responseEngine");




// =====================================
// MEMORY SYSTEM
// =====================================


const {

    getAllMemory

} = require("./services/memoryEngine");




const {

    learnFromMessage

} = require("./services/memoryLearning");




const {

    saveFact,

    getFacts,

    addTimeline,

    getTimeline,

    clearConversationMemory

} = require("./services/conversationMemory");




const {

    retrieveMemory

} = require("./services/memoryRetrieval");




const {

    rankMemories

} = require("./services/memoryRanking");




// =====================================
// LONG TERM MEMORY DATABASE
// =====================================


const {

    saveMemory,

    getMemories,

    searchMemory,

    getBestMemories

} = require("./services/memoryDatabase");




// =====================================
// AI PERSONALITY SYSTEM
// =====================================


const AIIdentityEngine =

require("./services/aiIdentityEngine");




const AdaptiveResponseEngine =

require("./services/adaptiveResponseEngine");




// =====================================
// CONTEXT ENGINE
// =====================================


const {

    handleContextRequest

} = require("./services/contextEngine");




// =====================================
// USER PROFILE SYSTEM
// =====================================


const userProfile =

require("./services/userProfile");




// =====================================
// ADVANCED MEMORY SYSTEM
// =====================================


const conversationTimeline =

require("./services/conversationTimeline");




const memoryExtractor =

require("./services/memoryExtractor");




const relationshipEngine =

require("./services/relationshipEngine");




const memoryRanker =

require("./services/memoryRanker");




// =====================================
// PERSONAL AI BRAIN V5.9.2
// =====================================


const {

    buildBrainContext,

    learnBrain

} = require("./services/personalBrain");




// =====================================
// CREATE AI INSTANCES
// =====================================


const identityEngine =

new AIIdentityEngine();




const adaptiveEngine =

new AdaptiveResponseEngine(

    identityEngine

);




// =====================================
// CONVERSATION STORAGE
// =====================================


const conversations = {};

const MAX_HISTORY = 30;



// =====================================
// END OF PART 1
// =====================================
