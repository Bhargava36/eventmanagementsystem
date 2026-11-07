const alumniService = require('./alumniService');

// Config
const getConfig = async (req, res) => {
    try {
        const { eventId } = req.params;
        const config = await alumniService.getConfig(eventId);
        return res.status(200).json({ success: true, config });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const saveConfig = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await alumniService.saveConfig(eventId, req.body);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Agenda
const getAgenda = async (req, res) => {
    try {
        const { eventId } = req.params;
        const agenda = await alumniService.getAgenda(eventId);
        return res.status(200).json({ success: true, agenda, sessions: agenda });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const createAgenda = async (req, res) => {
    try {
        const { eventId } = req.params;
        const session = await alumniService.createAgenda(eventId, req.body);
        return res.status(201).json({ success: true, session });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const updateAgenda = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await alumniService.updateAgenda(sessionId, req.body);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const deleteAgenda = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await alumniService.deleteAgenda(sessionId);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Speakers
const getSpeakers = async (req, res) => {
    try {
        const { eventId } = req.params;
        const speakers = await alumniService.getSpeakers(eventId);
        return res.status(200).json({ success: true, speakers });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const createSpeaker = async (req, res) => {
    try {
        const { eventId } = req.params;
        const speaker = await alumniService.createSpeaker(eventId, req.body);
        return res.status(201).json({ success: true, speaker });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const updateSpeaker = async (req, res) => {
    try {
        const { speakerId } = req.params;
        const result = await alumniService.updateSpeaker(speakerId, req.body);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSpeaker = async (req, res) => {
    try {
        const { speakerId } = req.params;
        const result = await alumniService.deleteSpeaker(speakerId);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Registrations (uses registered_teams directly!)
const getRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const registrations = await alumniService.getRegistrations(eventId);
        return res.status(200).json({ success: true, registrations });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const registerAlumnus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.body.userId || req.body.UserId || req.user?.id || req.user?.Id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const result = await alumniService.registerAlumnus(eventId, userId, req.body);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Live Check-in & Food Scanner
const checkInAlumnus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await alumniService.checkInAlumnus(eventId, req.body);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

const scanFoodToken = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await alumniService.scanFoodToken(eventId, req.body);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Batch Invites
const sendBatchInvites = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await alumniService.sendBatchInvites(eventId, req.body);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Memories
const getMemories = async (req, res) => {
    try {
        const { eventId } = req.params;
        const memories = await alumniService.getMemories(eventId);
        return res.status(200).json({ success: true, memories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const createMemory = async (req, res) => {
    try {
        const { eventId } = req.params;
        const memory = await alumniService.createMemory(eventId, req.body);
        return res.status(201).json({ success: true, memory });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const deleteMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;
        const result = await alumniService.deleteMemory(memoryId);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getConfig,
    saveConfig,
    getAgenda,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    getSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    getRegistrations,
    registerAlumnus,
    checkInAlumnus,
    scanFoodToken,
    sendBatchInvites,
    getMemories,
    createMemory,
    deleteMemory
};

