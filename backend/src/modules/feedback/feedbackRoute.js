const express = require('express');
const router = express.Router();
const feedbackController = require('./feedbackController');

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/admin/:adminId', feedbackController.getFeedbackByAdmin);
router.get('/:id', feedbackController.getFeedbackById);

module.exports = router;