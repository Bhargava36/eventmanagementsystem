const express = require("express");
const router = express.Router();
const idCardController = require("../id_cards/idController");
const { upload } = require("../../middleware/multer");

// Template Management
router.get("/events/:eventId/templates", idCardController.getTemplates);
router.post("/events/:eventId/templates", idCardController.saveTemplate);
router.get("/events/:eventId/templates/:templateId", idCardController.getTemplate);
router.put("/events/:eventId/templates/:templateId", idCardController.saveTemplate);
router.delete("/events/:eventId/templates/:templateId", idCardController.deleteTemplate);
router.post("/events/:eventId/templates/:templateId/duplicate", idCardController.duplicateTemplate);
router.post("/events/:eventId/templates/:templateId/default", idCardController.setDefaultTemplate);

// Asset Upload for ID Designer (Logos, Backgrounds, Signatures)
router.post("/events/:eventId/upload-asset", upload.single("asset"), idCardController.uploadAsset);

// Generation & Participants
router.post("/events/:eventId/batches/start", idCardController.startBatchGeneration);
router.get("/events/:eventId/batches/:batchId/status", idCardController.getBatchStatus);
router.post("/events/:eventId/generate", idCardController.generateIdCards);
router.get("/events/:eventId/participants", idCardController.getParticipants);
router.get("/events/:eventId/teams", idCardController.getTeams);

// QR Verification (Supports token or query params)
router.get("/verify", idCardController.verifyParticipantId);

// Gate Attendance & Scanning
router.post("/events/:eventId/check-in", idCardController.checkInParticipant);
router.post("/events/:eventId/check-out", idCardController.checkOutParticipant);
router.post("/events/:eventId/reset-attendance", idCardController.resetParticipantAttendance);
router.post("/events/:eventId/scan", idCardController.scanParticipantAttendance);

module.exports = router;