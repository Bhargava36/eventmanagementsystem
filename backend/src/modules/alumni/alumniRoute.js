const express = require('express');
const router = express.Router();
const alumniController = require('./alumniController');

// Config & Overview
router.get('/:eventId/config', alumniController.getConfig);
router.post('/:eventId/config', alumniController.saveConfig);

// Agenda & Sessions
router.get('/:eventId/agenda', alumniController.getAgenda);
router.post('/:eventId/agenda', alumniController.createAgenda);
router.put('/agenda/:sessionId', alumniController.updateAgenda);
router.delete('/agenda/:sessionId', alumniController.deleteAgenda);

// Distinguished Alumni Speakers
router.get('/:eventId/speakers', alumniController.getSpeakers);
router.post('/:eventId/speakers', alumniController.createSpeaker);
router.put('/speakers/:speakerId', alumniController.updateSpeaker);
router.delete('/speakers/:speakerId', alumniController.deleteSpeaker);

// Registrations / RSVPs (using registered_teams directly!)
router.get('/:eventId/registrations', alumniController.getRegistrations);
router.post('/:eventId/register', alumniController.registerAlumnus);

// Live Check-in & Food Scanner
router.post('/:eventId/check-in', alumniController.checkInAlumnus);
router.post('/:eventId/food-scan', alumniController.scanFoodToken);

// Batch Invitations Dispatcher
router.post('/:eventId/send-invites', alumniController.sendBatchInvites);

// Memories & Gallery
router.get('/:eventId/memories', alumniController.getMemories);
router.post('/:eventId/memories', alumniController.createMemory);
router.delete('/memories/:memoryId', alumniController.deleteMemory);

module.exports = router;

