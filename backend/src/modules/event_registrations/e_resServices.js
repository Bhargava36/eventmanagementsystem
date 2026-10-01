const db = require('../../config/db');

const getUserByEmail = (Email, callback) => {

    const query = ` SELECT Id, UserName, Email, College, State FROM users WHERE Email = ?`;

    db.query(query, [Email], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const createTeamForRegistration = ( TeamName, TeamLeadUserId, TeamSize, College, State, EventId, callback) => {

    const query = ` INSERT INTO teams (TeamName, TeamLeadUserId, TeamSize, College, State, EventId ) VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [TeamName, TeamLeadUserId, TeamSize, College, State, EventId];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const createEventRegistration = ( EventId, TeamId, ParticipationMode, Status, ProblemStatementId, callback) => {

    const query = `
        INSERT INTO event_registrations
        ( EventId, TeamId, ParticipationMode, Status, ProblemStatementId ) VALUES (?, ?, ?, ?, ?)`;

    const values = [ EventId, TeamId, ParticipationMode, Status, ProblemStatementId];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getAllEventRegistrations = (callback) => {

    const query = ` SELECT * FROM event_registrations ORDER BY CreatedAt DESC`;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getEventRegistrationById = (id, callback) => {

    const query = ` SELECT * FROM event_registrations WHERE Id = ?`;

    db.query(query, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getRegistrationsByEventId = (EventId, callback) => {

    const query = ` SELECT * FROM event_registrations WHERE EventId = ? ORDER BY CreatedAt DESC`;

    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getRegistrationsByTeamId = (TeamId, callback) => {

    const query = ` SELECT * FROM event_registrations WHERE TeamId = ? ORDER BY CreatedAt DESC`;

    db.query(query, [TeamId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getRegistrationsByMode = (ParticipationMode, callback) => {

    const query = ` SELECT * FROM event_registrations WHERE ParticipationMode = ? ORDER BY CreatedAt DESC`;

    db.query(query, [ParticipationMode], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getRegistrationsByStatus = (Status, callback) => {

    const query = ` SELECT * FROM event_registrations WHERE Status = ? ORDER BY CreatedAt DESC`;

    db.query(query, [Status], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const updateRegistrationStatus = (id, Status, callback) => {

    const query = ` UPDATE event_registrations SET Status = ? WHERE Id = ?`;

    db.query(query, [Status, id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const updateEventRegistration = (id, EventId, TeamId, ParticipationMode, Status, ProblemStatementId, callback) => {

    const query = ` UPDATE event_registrations SET EventId = ?, TeamId = ?, ParticipationMode = ?, Status = ?, ProblemStatementId = ? WHERE Id = ?`;

    const values = [ EventId, TeamId, ParticipationMode, Status, ProblemStatementId, id ];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const getRegistrationCount = (callback) => {

    const query = ` SELECT COUNT(*) AS registrationCount FROM event_registrations`;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};


const getRegistrationCountByEvent = (EventId, callback) => {

    const query = ` SELECT COUNT(*) AS registrationCount FROM event_registrations WHERE EventId = ? `;

    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getPendingCountByEvent = (EventId, callback) => {

    const query = ` SELECT COUNT(*) AS pendingCount FROM event_registrations WHERE EventId = ? AND Status = 'pending'`;

    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getRecentRegistrations = (limit, callback) => {

    const query = `SELECT * FROM event_registrations ORDER BY CreatedAt DESC LIMIT ?`;

    db.query(query, [limit], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getRecentActivities = (limit, callback) => {

    const query = ` SELECT Id, EventId, TeamId, ParticipationMode, Status, CreatedAt FROM event_registrations ORDER BY CreatedAt DESC LIMIT ? `;

    db.query(query, [limit], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getRegistrationCountByMode = ( ParticipationMode, callback) => {

    const query = ` SELECT COUNT(*) AS registrationCount FROM event_registrations WHERE ParticipationMode = ? `;

    db.query(query, [ParticipationMode], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};


module.exports = {
    getUserByEmail,
    createTeamForRegistration,
    createEventRegistration,
    getAllEventRegistrations,
    getEventRegistrationById,
    getRegistrationsByEventId,
    getRegistrationsByTeamId,
    getRegistrationsByMode,
    getRegistrationsByStatus,
    updateRegistrationStatus,
    updateEventRegistration,
    getRegistrationCount,
    getRegistrationCountByEvent,
    getPendingCountByEvent,
    getRegistrationCountByMode,
    getRecentRegistrations,
    getRecentActivities
};