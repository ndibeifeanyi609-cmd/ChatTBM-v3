'use strict';

const express = require('express');
const { createFounderAuthorization } = require('../admin/founderAuthorization');
const { createAdminOverviewHandler } = require('../controllers/adminOverviewController');

const router = express.Router();

router.get(
    '/overview',
    createFounderAuthorization(),
    createAdminOverviewHandler()
);

module.exports = router;
