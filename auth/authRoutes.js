'use strict';

const express = require('express');
const services = require('./AuthService');
const passwordReset = require('./PasswordResetService');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');
const { createAuthLimiters } = require('./createAuthLimiters');
const { createAuthRouter } = require('./createAuthRouter');

const router = createAuthRouter({
    express,
    services,
    passwordReset,
    sendPasswordResetEmail,
    limiters: createAuthLimiters()
});

module.exports = router;
