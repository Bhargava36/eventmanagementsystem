const express = require('express');
const router = express.Router();
const workshopController = require('./workshopController');
const { optionalAuth } = require('../../middleware/authmiddleware');
router.use(optionalAuth);
// Sessions
router.get('/:eventId/sessions', workshopController.getSessions);
router.post('/:eventId/sessions', workshopController.createSession);
router.put('/sessions/:sessionId', workshopController.updateSession);
router.delete('/sessions/:sessionId', workshopController.deleteSession);
// Resources
router.get('/:eventId/resources', workshopController.getResources);
router.post('/:eventId/resources', workshopController.createResource);
router.delete('/resources/:resourceId', workshopController.deleteResource);
// Attendance
router.get('/:eventId/attendance', workshopController.getAttendance);
router.get('/:eventId/attendance/user/:userId', workshopController.getUserAttendance);
router.post('/:eventId/attendance', workshopController.markAttendance);
module.exports = router;
