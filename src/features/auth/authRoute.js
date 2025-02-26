const express = require('express');

const authController = require('./authController.js');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);


module.exports = router;
