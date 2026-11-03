const workshopServices = require('./workshopServices');

// Sessions
const getSessions = (req, res) => {
    const { eventId } = req.params;
    workshopServices.getSessions(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching sessions', error: err.message });
        res.status(200).json({ sessions: results || [] });
    });
};

const createSession = (req, res) => {
    const { eventId } = req.params;
    const { SessionTitle } = req.body;
    if (!SessionTitle || !SessionTitle.trim()) {
        return res.status(400).json({ message: 'Session Title is required' });
    }

    workshopServices.createSession({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating session', error: err.message });
        res.status(201).json({ message: 'Session created successfully', session: result });
    });
};

const updateSession = (req, res) => {
    const { sessionId } = req.params;
    workshopServices.updateSession(sessionId, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating session', error: err.message });
        res.status(200).json({ message: 'Session updated successfully' });
    });
};

const deleteSession = (req, res) => {
    const { sessionId } = req.params;
    workshopServices.deleteSession(sessionId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting session', error: err.message });
        res.status(200).json({ message: 'Session deleted successfully' });
    });
};

// Resources
const getResources = (req, res) => {
    const { eventId } = req.params;
    workshopServices.getResources(eventId, (err, results) => {
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

    workshopServices.createResource({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating resource', error: err.message });
        res.status(201).json({ message: 'Resource created successfully', resource: result });
    });
};

const deleteResource = (req, res) => {
    const { resourceId } = req.params;
    workshopServices.deleteResource(resourceId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting resource', error: err.message });
        res.status(200).json({ message: 'Resource deleted successfully' });
    });
};

// Attendance
const getAttendance = (req, res) => {
    const { eventId } = req.params;
    const dayNumber = Number(req.query.day || 1);
    const sessionSlot = req.query.slot || 'Morning';

    workshopServices.getAttendance(eventId, dayNumber, sessionSlot, (err, results, allRecords) => {
        if (err) return res.status(500).json({ message: 'Error fetching attendance', error: err.message });
        res.status(200).json({ 
            attendees: results || [],
            allRecords: allRecords || [],
            dayNumber,
            sessionSlot
        });
    });
};

const markAttendance = (req, res) => {
    const { eventId } = req.params;
    const { UserId, Status, MarkedBy, DayNumber, SessionSlot, AttendanceDate } = req.body;
    if (!UserId || !Status) {
        return res.status(400).json({ message: 'UserId and Status are required' });
    }

    const dayNum = Number(DayNumber || 1);
    const slot = SessionSlot || 'Morning';

    workshopServices.markAttendance(eventId, UserId, Status, MarkedBy || 'Admin', dayNum, slot, AttendanceDate, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error marking attendance', error: err.message });
        res.status(200).json({ 
            message: 'Attendance marked successfully',
            dayNumber: dayNum,
            sessionSlot: slot
        });
    });
};

module.exports = {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getResources,
    createResource,
    deleteResource,
    getAttendance,
    markAttendance
};
