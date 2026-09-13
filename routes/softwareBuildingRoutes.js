'use strict';

const express = require('express');

const router = express.Router();

const {
    softwareBuildingHandler
} = require('../controllers/softwareBuildingController');

router.post(
    '/',
    softwareBuildingHandler
);

module.exports = router;
