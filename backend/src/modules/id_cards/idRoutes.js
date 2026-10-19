const express = require("express");
const router = express.Router();
const idCardController = require("../id_cards/idController");

router.post("/events/:eventId/generate", idCardController.generateIdCards);
router.get("/events/:eventId/participants", idCardController.getParticipants);
router.get("/verify", idCardController.verifyParticipantId);

module.exports = router;