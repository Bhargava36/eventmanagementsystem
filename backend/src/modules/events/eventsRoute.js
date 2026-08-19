const express = require("express");

const router = express.Router();

const eventsController = require("./eventsController");

router.post('/create', eventsController.createEvent);
router.get( '/', eventsController.getAllEvents );
router.get('/:id', eventsController.getEventById );
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;