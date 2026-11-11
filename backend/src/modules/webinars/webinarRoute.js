const express = require('express');
const router = express.Router();
const webinarController = require('./webinarController');
const { optionalAuth } = require('../../middleware/authmiddleware');
router.use(optionalAuth);
// Sessions (Keynotes, Panels & Broadcasts)
router.get('/:eventId/sessions', webinarController.getSessions);
router.post('/:eventId/sessions', webinarController.createSession);
router.put('/sessions/:sessionId', webinarController.updateSession);
router.delete('/sessions/:sessionId', webinarController.deleteSession);
// Resources (Slide Decks, Recordings & Delegate Handouts)
router.get('/:eventId/resources', webinarController.getResources);
router.post('/:eventId/resources', webinarController.createResource);
router.delete('/resources/:resourceId', webinarController.deleteResource);
// Attendance
router.get('/:eventId/attendance', webinarController.getAttendance);
router.get('/:eventId/attendance/user/:userId', webinarController.getUserAttendance);
router.post('/:eventId/attendance', webinarController.markAttendance);
// Webinar Feedback
router.get('/feedback/all', webinarController.getAllWebinarFeedback);
router.delete('/feedback/:id', webinarController.deleteFeedback);
router.post('/:eventId/feedback', webinarController.submitFeedback);
router.post('/feedback', webinarController.submitFeedback);
// Live Q&A Routes
router.get('/:eventId/questions', webinarController.getQuestions);
router.post('/:eventId/questions', webinarController.createQuestion);
router.post('/questions/:questionId/upvote', webinarController.upvoteQuestion);
router.put('/questions/:questionId/status', webinarController.updateQuestionStatus);
router.delete('/questions/:questionId', webinarController.deleteQuestion);
module.exports = router;
