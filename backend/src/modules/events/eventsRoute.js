const express = require('express');
const router = express.Router();
const eventsController = require('./eventsController');

router.post('/create', eventsController.createEvent);
router.get('/', eventsController.getAllEvents);
router.get('/count', eventsController.getEventCount);
router.get('/:id', eventsController.getEventById);
router.put('/:id/virtual-status', eventsController.updateVirtualStatus);
router.put('/:id/virtual-meet', eventsController.updateVirtualMeetUrl);
router.put('/:id/settings', eventsController.updateEventSettings);
router.put('/:id/guidelines', eventsController.updateEventGuidelines);
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;