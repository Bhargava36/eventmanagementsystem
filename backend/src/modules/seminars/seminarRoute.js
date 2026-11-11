const express = require('express');
const router = express.Router();
const seminarController = require('./seminarController');
const { optionalAuth } = require('../../middleware/authmiddleware');
router.use(optionalAuth);
// Speakers
router.get('/:eventId/speakers', seminarController.getSpeakers);
router.post('/:eventId/speakers', seminarController.createSpeaker);
router.put('/speakers/:speakerId', seminarController.updateSpeaker);
router.delete('/speakers/:speakerId', seminarController.deleteSpeaker);
// Sessions / Agenda
router.get('/:eventId/sessions', seminarController.getSessions);
router.post('/:eventId/sessions', seminarController.createSession);
router.put('/sessions/:sessionId', seminarController.updateSession);
router.delete('/sessions/:sessionId', seminarController.deleteSession);
// Delegates & Attendance
router.get('/:eventId/delegates', seminarController.getDelegates);
router.post('/:eventId/check-in', seminarController.checkInDelegate);
router.post('/:eventId/feedback', seminarController.submitFeedback);
router.post('/:eventId/certificate', seminarController.issueCertificate);
// Resources
router.get('/:eventId/resources', seminarController.getResources);
router.post('/:eventId/resources', seminarController.createResource);
router.put('/resources/:resourceId', seminarController.updateResource);
router.delete('/resources/:resourceId', seminarController.deleteResource);
module.exports = router;
