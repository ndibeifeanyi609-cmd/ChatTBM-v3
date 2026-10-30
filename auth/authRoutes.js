'use strict';

const express = require('express');
const services = require('./AuthService');
const passwordReset = require('./PasswordResetService');
const emailVerification = require('./EmailVerificationService');
const { sendPasswordResetEmail } = require('./PasswordResetMailer');
const { sendEmailVerificationEmail } = require('./EmailVerificationMailer');
const { createAuthLimiters } = require('./createAuthLimiters');
const { createAuthRouter } = require('./createAuthRouter');

const router = createAuthRouter({
    express,
    services,
    passwordReset,
    sendPasswordResetEmail,
    emailVerification,
    sendEmailVerificationEmail,
    limiters: createAuthLimiters()
});

module.exports = router;
