const idCardService = require("../id_cards/idService");

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

const verifyParticipantId = (req, res) => {
    const EventId = Number(req.query.eventId);
    const UserId = Number(req.query.userId);
    const IdCardNumber = String(req.query.idCardNumber || "").trim();
    if (
        !Number.isInteger(EventId) || EventId <= 0 ||
        !Number.isInteger(UserId) || UserId <= 0 ||
        !IdCardNumber
    ) {
        return res.status(400).json({
            success: false,
            message: "Valid event, participant, and ID card details are required."
        });
    }
    idCardService.verifyParticipantId( EventId, UserId, IdCardNumber, (err, participant) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to verify this participant ID."
                });
            }
            if (!participant) {
                return res.status(404).json({
                    success: false,
                    message: "No valid participant ID card matched these details."
                });
            }

            return res.status(200).json({
                success: true,
                participant
            });
        }
    );
};


const generateIdCards = (req, res) => {
    const EventId = Number(req.params.eventId);
    if (!Number.isInteger(EventId) || EventId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid Event ID is required."
        });
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

const scanParticipantAttendance = (req, res) => {
    const EventId = Number(req.params.eventId);
    const { idCardNumber, operatorName } = req.body;

    if (!Number.isInteger(EventId) || EventId <= 0 || !idCardNumber) {
        return res.status(400).json({ success: false, message: "Valid Event ID and ID Card Number are required." });
    }

    idCardService.scanAttendance(EventId, idCardNumber, operatorName, (err, result) => {
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
    getParticipants,
    verifyParticipantId,
    generateIdCards,
    checkInParticipant,
    checkOutParticipant,
    resetParticipantAttendance,
    scanParticipantAttendance
};