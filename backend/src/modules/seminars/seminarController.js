const seminarServices = require('./seminarServices');
// --- Speakers ---
const getSpeakers = (req, res) => {
    const { eventId } = req.params;
    seminarServices.getSpeakers(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching speakers', error: err.message });
        res.status(200).json({ speakers: results || [] });
    });
};
const createSpeaker = (req, res) => {
    const { eventId } = req.params;
    const { Name } = req.body;
    if (!Name || !Name.trim()) {
        return res.status(400).json({ message: 'Speaker Name is required' });
    }
    seminarServices.createSpeaker({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating speaker', error: err.message });
        res.status(201).json({ message: 'Speaker added successfully', speaker: result });
    });
};
const updateSpeaker = (req, res) => {
    const { speakerId } = req.params;
    seminarServices.updateSpeaker(speakerId, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating speaker', error: err.message });
        res.status(200).json({ message: 'Speaker updated successfully' });
    });
};
const deleteSpeaker = (req, res) => {
    const { speakerId } = req.params;
    seminarServices.deleteSpeaker(speakerId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting speaker', error: err.message });
        res.status(200).json({ message: 'Speaker deleted successfully' });
    });
};
// --- Sessions / Agenda ---
const getSessions = (req, res) => {
    const { eventId } = req.params;
    seminarServices.getSessions(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching seminar agenda', error: err.message });
        res.status(200).json({ sessions: results || [] });
    });
};
const createSession = (req, res) => {
    const { eventId } = req.params;
    const { SessionTitle, StartTime, EndTime } = req.body;
    if (!SessionTitle || !StartTime || !EndTime) {
        return res.status(400).json({ message: 'Session Title, Start Time, and End Time are required' });
    }
    seminarServices.createSession({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating session', error: err.message });
        res.status(201).json({ message: 'Agenda slot created successfully', session: result });
    });
};
const updateSession = (req, res) => {
    const { sessionId } = req.params;
    seminarServices.updateSession(sessionId, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating session', error: err.message });
        res.status(200).json({ message: 'Agenda slot updated successfully' });
    });
};
const deleteSession = (req, res) => {
    const { sessionId } = req.params;
    seminarServices.deleteSession(sessionId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting session', error: err.message });
        res.status(200).json({ message: 'Agenda slot deleted successfully' });
    });
};
// --- Delegates & Attendance ---
const getDelegates = (req, res) => {
    const { eventId } = req.params;
    seminarServices.getDelegates(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching delegates', error: err.message });
        res.status(200).json({ delegates: results || [] });
    });
};
const checkInDelegate = (req, res) => {
    const { eventId } = req.params;
    const { userId, teamId, checkInBy, status = 'CheckedIn' } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'UserId is required for check-in' });
    }
    seminarServices.checkInDelegate({ eventId, userId, teamId, checkInBy, status }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error checking in delegate', error: err.message });
        res.status(200).json({ message: 'Delegate status updated successfully', checkInTime: status === 'CheckedIn' ? new Date() : null });
    });
};
const submitFeedback = (req, res) => {
    const { eventId } = req.params;
    const { userId, rating, comments } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'UserId is required' });
    }
    seminarServices.submitFeedback({ eventId, userId, rating, comments }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error submitting feedback', error: err.message });
        res.status(200).json({ message: 'Feedback submitted successfully' });
    });
};
const issueCertificate = (req, res) => {
    const { eventId } = req.params;
    const { userId } = req.body;
    seminarServices.issueCertificate({ eventId, userId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error issuing certificate', error: err.message });
        res.status(200).json({ message: 'Certificate issued successfully' });
    });
};
// --- Resources ---
const getResources = (req, res) => {
    const { eventId } = req.params;
    seminarServices.getResources(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching resources', error: err.message });
        res.status(200).json({ resources: results || [] });
    });
};
const createResource = (req, res) => {
    const { eventId } = req.params;
    const { Title, ResourceUrl } = req.body;
    if (!Title || !ResourceUrl) {
        return res.status(400).json({ message: 'Title and Resource URL are required' });
    }
    seminarServices.createResource({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error saving resource', error: err.message });
        res.status(201).json({ message: 'Resource uploaded successfully', resource: result });
    });
};
const updateResource = (req, res) => {
    const { resourceId } = req.params;
    seminarServices.updateResource(resourceId, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating resource', error: err.message });
        res.status(200).json({ message: 'Resource updated successfully' });
    });
};
const deleteResource = (req, res) => {
    const { resourceId } = req.params;
    seminarServices.deleteResource(resourceId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting resource', error: err.message });
        res.status(200).json({ message: 'Resource deleted successfully' });
    });
};
module.exports = {
    getSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getDelegates,
    checkInDelegate,
    submitFeedback,
    issueCertificate,
    getResources,
    createResource,
    updateResource,
    deleteResource
};
