const express = require('express');
const router = express.Router();
const controller = require('./projectSubmissionController');

router.get('/event/:eventId/team/:teamId', controller.getSubmissionByTeam);
router.get('/event/:eventId/all', controller.getAllSubmissionsByEvent);
router.post('/event/:eventId/submit', controller.submitProject);

module.exports = router;
