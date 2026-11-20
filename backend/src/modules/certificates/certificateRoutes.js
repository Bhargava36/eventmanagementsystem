const express = require("express");
const router = express.Router();
const certificateController = require("./certificateController");
const { upload } = require("../../middleware/multer");
const { optionalAuth } = require("../../middleware/authmiddleware");

router.use(optionalAuth);

// Template Management
router.get("/events/:eventId/templates", certificateController.getTemplates);
router.post("/events/:eventId/templates", certificateController.saveTemplate);
router.get("/events/:eventId/templates/:templateId", certificateController.getTemplate);
router.put("/events/:eventId/templates/:templateId", certificateController.saveTemplate);
router.delete("/events/:eventId/templates/:templateId", certificateController.deleteTemplate);
router.post("/events/:eventId/templates/:templateId/duplicate", certificateController.duplicateTemplate);
router.post("/events/:eventId/templates/:templateId/default", certificateController.setDefaultTemplate);

// Asset Upload (Signatures, Logos, Backgrounds)
router.post("/events/:eventId/upload-asset", upload.single("asset"), certificateController.uploadAsset);

// Team & Multi-Member Certificates
router.get("/teams/:teamId/all", certificateController.getTeamCertificates);
router.get("/events/:eventId/preview-data", certificateController.getEventPreviewData);

module.exports = router;

