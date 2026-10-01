const express = require("express");
const router = express.Router();
const eResController = require("./e_resController");

router.post('/register', eResController.createRegistration);
router.get('/count', eResController.getRegistrationCount);
router.get('/event/:eventId/count', eResController.getRegistrationCountByEvent);
router.get('/event/:eventId/pending-count', eResController.getPendingCountByEvent);
router.get('/event/:eventId', eResController.getRegistrationsByEventId);
router.get('/recent', eResController.getRecentRegistrations);
router.get('/activities', eResController.getRecentActivities);
router.get('/team/:teamId', eResController.getRegistrationsByTeamId);
router.get('/mode/:mode', eResController.getRegistrationsByMode);
router.get('/', eResController.getAllRegistrations);
router.get('/:id', eResController.getRegistrationById);

module.exports = router;