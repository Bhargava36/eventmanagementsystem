const express = require('express');
const router = express.Router();
const controller = require('./platformFeedbackController');

router.post('/', controller.createFeedback);
router.get('/', controller.getAllFeedback);
router.get('/testimonials', controller.getTestimonials);
router.delete('/:id', controller.deleteFeedback);

module.exports = router;
