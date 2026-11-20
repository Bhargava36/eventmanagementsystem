const certificateService = require("./certificateService");

exports.getTemplates = (req, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ success: false, message: "Event ID is required" });

    certificateService.getTemplates(eventId, (err, templates) => {
        if (err) {
            console.error("Error fetching certificate templates:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: templates });
    });
};

exports.getTemplate = (req, res) => {
    const { eventId, templateId } = req.params;
    certificateService.getTemplateById(eventId, templateId, (err, template) => {
        if (err) {
            console.error("Error fetching certificate template:", err);
            return res.status(404).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: template });
    });
};

exports.saveTemplate = (req, res) => {
    const { eventId, templateId } = req.params;
    const payload = req.body;
    certificateService.saveTemplate(eventId, templateId || null, payload, (err, result) => {
        if (err) {
            console.error("Error saving certificate template:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result, message: "Certificate template saved successfully" });
    });
};

exports.deleteTemplate = (req, res) => {
    const { eventId, templateId } = req.params;
    certificateService.deleteTemplate(eventId, templateId, (err, result) => {
        if (err) {
            console.error("Error deleting certificate template:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result, message: "Certificate template deleted" });
    });
};

exports.setDefaultTemplate = (req, res) => {
    const { eventId, templateId } = req.params;
    certificateService.setDefaultTemplate(eventId, templateId, (err, result) => {
        if (err) {
            console.error("Error setting default certificate template:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result, message: "Default certificate template updated" });
    });
};

exports.duplicateTemplate = (req, res) => {
    const { eventId, templateId } = req.params;
    certificateService.duplicateTemplate(eventId, templateId, (err, result) => {
        if (err) {
            console.error("Error duplicating certificate template:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: result, message: "Certificate template duplicated" });
    });
};

exports.uploadAsset = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
        success: true,
        data: {
            url: publicUrl,
            filename: req.file.filename,
            size: req.file.size
        }
    });
};

// Returns all certificates for every member in the team!
exports.getTeamCertificates = (req, res) => {
    const { teamId } = req.params;
    certificateService.getTeamCertificates(teamId, (err, data) => {
        if (err) {
            console.error("Error fetching team certificates:", err);
            const status = err.status || 500;
            return res.status(status).json({ success: false, message: err.message });
        }
        res.json({ success: true, data });
    });
};

// Returns live event info and real teams & members for designer live preview
exports.getEventPreviewData = (req, res) => {
    const { eventId } = req.params;
    certificateService.getEventCertificatePreviewData(eventId, (err, data) => {
        if (err) {
            console.error("Error fetching event preview data:", err);
            const status = err.status || 500;
            return res.status(status).json({ success: false, message: err.message });
        }
        res.json({ success: true, data });
    });
};


