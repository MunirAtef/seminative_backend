
const express = require('express');

const controller = require('./publisherController.js');
const router = express.Router();

router.get('/:id', controller.publisherProfile);

module.exports = router;