const express = require('express');
const router = express.Router();
const identifyController = require('../controllers/identifyController');

router.post('/identify', identifyController.identifyContact);

module.exports = router;
