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

    const query = ` INSERT INTO registered_teams (TeamName, TeamLeadUserId, TeamSize, College, State, EventId ) VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [TeamName, TeamLeadUserId, TeamSize, College, State, EventId];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};


const createEventRegistration = ( EventId, TeamId, ParticipationMode, Status, ProblemStatementId, callback) => {
    // Check if team is already registered for this event
    const checkQuery = `SELECT Id FROM event_registrations WHERE EventId = ? AND TeamId = ?`;
    db.query(checkQuery, [EventId, TeamId], (err, existing) => {
        if (err) return callback(err, null);
        if (existing && existing.length > 0) {
            const error = new Error('This team is already registered for this event. A participant/team can only register once per event.');
            error.status = 400;
            return callback(error, null);
        }

        // Validate event registration pause status
        const eventQuery = `SELECT EventName, VirtualRegistrationOpen, PhysicalRegistrationOpen, RegistrationOpen FROM events WHERE Id = ?`;
        db.query(eventQuery, [EventId], (evErr, evRows) => {
            if (!evErr && evRows && evRows.length > 0) {
                const ev = evRows[0];
                if (ParticipationMode === 'Virtual' && (ev.VirtualRegistrationOpen === 0 || ev.VirtualRegistrationOpen === false)) {
                    const error = new Error(`Registration for the Virtual track is currently paused by the event admin.`);
                    error.status = 403;
                    return callback(error, null);
                }
                if (ParticipationMode === 'Physical' && (ev.PhysicalRegistrationOpen === 0 || ev.PhysicalRegistrationOpen === false)) {
                    const error = new Error(`Registration for the Physical track is currently paused by the event admin.`);
                    error.status = 403;
                    return callback(error, null);
                }
                if (ev.RegistrationOpen === 0 || ev.RegistrationOpen === false) {
                    const error = new Error(`Registration for this event is currently paused by the event admin.`);
                    error.status = 403;
                    return callback(error, null);
                }
            }

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
        });
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