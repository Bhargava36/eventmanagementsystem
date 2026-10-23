const express = require("express");
const router = express.Router();
const idCardController = require("../id_cards/idController");

router.post("/events/:eventId/generate", idCardController.generateIdCards);
router.get("/events/:eventId/participants", idCardController.getParticipants);
router.get("/verify", idCardController.verifyParticipantId);

// Check-in & Check-out Tracking
router.post("/events/:eventId/check-in", idCardController.checkInParticipant);
router.post("/events/:eventId/check-out", idCardController.checkOutParticipant);
router.post("/events/:eventId/reset-attendance", idCardController.resetParticipantAttendance);
router.post("/events/:eventId/scan", idCardController.scanParticipantAttendance);

module.exports = router;