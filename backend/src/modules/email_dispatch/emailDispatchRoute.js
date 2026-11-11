const express = require('express');
const router = express.Router();
const controller = require('./emailDispatchController');
const { optionalAuth } = require('../../middleware/authmiddleware');
router.use(optionalAuth);
router.get('/', controller.getLogs);
router.post('/retry/:id', controller.retry);
router.post('/test', controller.sendTest);
module.exports = router;
