const idCardService = require("../id_cards/idService");

/**
 * Get all ID templates for an event
 */
const getTemplates = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID is required." });
    }
    const cardType = req.query.cardType || req.query.type || 'id_card';

    idCardService.getTemplatesByEvent(EventId, cardType, (err, templates) => {
        if (err) {
            console.error("Get templates controller error:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch templates." });
        }
        return res.status(200).json({ success: true, templates });
    });
};

/**
 * Get single template by ID
 */
const getTemplate = (req, res) => {
    const EventId = Number(req.params.eventId);
    const TemplateId = Number(req.params.templateId);
    if (!Number.isInteger(EventId) || !Number.isInteger(TemplateId)) {
        return res.status(400).json({ success: false, message: "Valid Event ID and Template ID are required." });
    }

    idCardService.getTemplateById(EventId, TemplateId, (err, template) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to fetch template." });
        }
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found." });
        }
        return res.status(200).json({ success: true, template });
    });
};

/**
 * Save template (create or update)
 */
const saveTemplate = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID is required." });
    }

    const { TemplateName, FrontConfig } = req.body;
    if (!TemplateName || !FrontConfig) {
        return res.status(400).json({ success: false, message: "Template name and front configuration are required." });
    }

    const cardType = req.body.CardType || req.query.cardType || 'id_card';
    idCardService.saveTemplate(EventId, { ...req.body, CardType: cardType }, (err, template) => {
        if (err) {
            console.error("Save template controller error:", err);
            return res.status(500).json({ success: false, message: "Failed to save template." });
        }
        return res.status(200).json({ success: true, template, message: "Template saved successfully." });
    });
};

/**
 * Duplicate a template
 */
const duplicateTemplate = (req, res) => {
    const EventId = Number(req.params.eventId);
    const TemplateId = Number(req.params.templateId);
    if (!Number.isInteger(EventId) || !Number.isInteger(TemplateId)) {
        return res.status(400).json({ success: false, message: "Valid Event ID and Template ID are required." });
    }

    idCardService.duplicateTemplate(EventId, TemplateId, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to duplicate template." });
        }
        return res.status(200).json({ success: true, ...result, message: "Template duplicated successfully." });
    });
};

/**
 * Delete a template
 */
const deleteTemplate = (req, res) => {
    const EventId = Number(req.params.eventId);
    const TemplateId = Number(req.params.templateId);
    if (!Number.isInteger(EventId) || !Number.isInteger(TemplateId)) {
        return res.status(400).json({ success: false, message: "Valid Event ID and Template ID are required." });
    }

    idCardService.deleteTemplate(EventId, TemplateId, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to delete template." });
        }
        return res.status(200).json({ success: true, message: "Template deleted successfully." });
    });
};

/**
 * Set template as default
 */
const setDefaultTemplate = (req, res) => {
    const EventId = Number(req.params.eventId);
    const TemplateId = Number(req.params.templateId);
    if (!Number.isInteger(EventId) || !Number.isInteger(TemplateId)) {
        return res.status(400).json({ success: false, message: "Valid Event ID and Template ID are required." });
    }

    idCardService.setDefaultTemplate(EventId, TemplateId, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to set default template." });
        }
        return res.status(200).json({ success: true, message: "Default template updated." });
    });
};

/**
 * Upload an asset (logo, background, icon) for ID card designer
 */
const uploadAsset = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No asset file uploaded." });
    }
    const relativePath = `/uploads/images/${req.file.filename}`;
    return res.status(200).json({
        success: true,
        url: relativePath,
        filename: req.file.filename,
        message: "Asset uploaded successfully."
    });
};

/**
 * Get participants
 */
const getParticipants = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid Event ID is required."
        });
    }

    idCardService.getParticipantsByEvent(EventId, (err, participants) => {
        if (err) {
            console.error("Get participants error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch participants."
            });
        }
        return res.status(200).json({
            success: true,
            participants
        });
    });
};

/**
 * Start Batch Generation of ID cards
 */
const startBatchGeneration = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID is required." });
    }

    const { templateId, participantIds } = req.body || {};

    idCardService.startBatchGeneration(EventId, { templateId, participantIds }, (err, result) => {
        if (err) {
            console.error("Batch generation error:", err);
            return res.status(err.status || 500).json({ success: false, message: err.message || "Failed to generate ID cards." });
        }
        return res.status(200).json({
            success: true,
            ...result
        });
    });
};

/**
 * Legacy generateIdCards
 */
const generateIdCards = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID is required." });
    }
    idCardService.generateParticipantIds(EventId, (err, result) => {
        if (err) {
            console.error("Generate ID cards error:", err);
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Failed to generate ID cards."
            });
        }
        return res.status(200).json({
            success: true,
            ...result
        });
    });
};

/**
 * Get Batch Status
 */
const getBatchStatus = (req, res) => {
    const EventId = Number(req.params.eventId);
    const BatchId = Number(req.params.batchId);
    if (!Number.isInteger(EventId) || !Number.isInteger(BatchId)) {
        return res.status(400).json({ success: false, message: "Valid Event ID and Batch ID are required." });
    }

    idCardService.getBatchStatus(EventId, BatchId, (err, batch) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to retrieve batch status." });
        return res.status(200).json({ success: true, batch });
    });
};

/**
 * Verify Participant by Token OR IdCardNumber
 */
const verifyParticipantId = (req, res) => {
    const token = String(req.query.token || "").trim();
    const EventId = Number(req.query.eventId);
    const UserId = Number(req.query.userId);
    const IdCardNumber = String(req.query.idCardNumber || "").trim();

    if (!token && (!Number.isInteger(EventId) || !IdCardNumber)) {
        return res.status(400).json({
            success: false,
            message: "Valid verification token or Event ID and ID card number are required."
        });
    }

    idCardService.verifyParticipantId(EventId, UserId, IdCardNumber, token, (err, participant) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to verify this participant ID."
            });
        }
        if (!participant) {
            return res.status(404).json({
                success: false,
                message: "No valid participant ID card matched these verification details."
            });
        }

        return res.status(200).json({
            success: true,
            participant
        });
    });
};

// Check-in
const checkInParticipant = (req, res) => {
    const EventId = Number(req.params.eventId);
    const { userId, checkedInBy, remarks } = req.body;
    const UserId = Number(userId);

    if (!Number.isInteger(EventId) || EventId <= 0 || !Number.isInteger(UserId) || UserId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID and User ID are required." });
    }

    idCardService.recordCheckIn(EventId, UserId, checkedInBy, remarks, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to record check-in." });
        }
        return res.status(200).json(result);
    });
};

// Check-out
const checkOutParticipant = (req, res) => {
    const EventId = Number(req.params.eventId);
    const { userId, checkedOutBy, remarks } = req.body;
    const UserId = Number(userId);

    if (!Number.isInteger(EventId) || EventId <= 0 || !Number.isInteger(UserId) || UserId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID and User ID are required." });
    }

    idCardService.recordCheckOut(EventId, UserId, checkedOutBy, remarks, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to record check-out." });
        }
        return res.status(200).json(result);
    });
};

// Reset Attendance
const resetParticipantAttendance = (req, res) => {
    const EventId = Number(req.params.eventId);
    const { userId } = req.body;
    const UserId = Number(userId);

    if (!Number.isInteger(EventId) || EventId <= 0 || !Number.isInteger(UserId) || UserId <= 0) {
        return res.status(400).json({ success: false, message: "Valid Event ID and User ID are required." });
    }

    idCardService.resetAttendance(EventId, UserId, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to reset attendance." });
        }
        return res.status(200).json(result);
    });
};

// Scan Attendance
const scanParticipantAttendance = (req, res) => {
    const EventId = Number(req.params.eventId);
    const { idCardNumber, scanKey, operatorName } = req.body;
    const key = scanKey || idCardNumber;

    if (!Number.isInteger(EventId) || EventId <= 0 || !key) {
        return res.status(400).json({ success: false, message: "Valid Event ID and ID Card Number or Token are required." });
    }

    idCardService.scanAttendance(EventId, key, operatorName, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error scanning attendance." });
        }
        if (result.notFound) {
            return res.status(404).json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true, ...result });
    });
};

module.exports = {
    getTemplates,
    getTemplate,
    saveTemplate,
    duplicateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    uploadAsset,
    getParticipants,
    startBatchGeneration,
    getBatchStatus,
    verifyParticipantId,
    generateIdCards,
    checkInParticipant,
    checkOutParticipant,
    resetParticipantAttendance,
    scanParticipantAttendance
};