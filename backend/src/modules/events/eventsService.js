const db = require('../../config/db');

const getEventStatus = (StartDate, EndDate) => {
    const today = new Date();
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);

    if (today < startDate) {
        return 'Upcoming';
    }

    if (today >= startDate && today <= endDate) {
        return 'Ongoing';
    }

    return 'Completed';
};

const createEvent = (EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, callback) => {
    EventStatus = getEventStatus(StartDate, EndDate);

    const query = `INSERT INTO events ( EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllEvents = (callback) => {
    const query = `SELECT * FROM events ORDER BY CreatedAt DESC`;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        result.forEach((event) => {
            event.EventStatus = getEventStatus( event.StartDate, event.EndDate);
        });

        return callback(null, result);
    });
};

const getEventById = (id, callback) => {
    const query = `SELECT * FROM events WHERE Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        if (result.length === 0) {
            return callback(null, []);
        }

        result[0].EventStatus = getEventStatus(result[0].StartDate, result[0].EndDate);

        return callback(null, result);
    });
};

const getEventCount = (callback) => {
    const query = `SELECT COUNT(*) AS eventCount FROM events`;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const updateEventById = (id, EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, callback) => {
    EventStatus = getEventStatus(StartDate, EndDate);

    const query = `UPDATE events SET EventName = ?, Description = ?, Facilities = ?, Requirements = ?, TeamSize = ?, StartDate = ?, EndDate = ?, RegistrationStart = ?, RegistrationEnd = ?, Location = ?, EventType = ?, EventStatus = ?, HackathonMode = ?, PrimaryColor = ?, SecondaryColor = ?, TertiaryColor = ?, PrimaryTextColor = ?, SecondaryTextColor = ?, TertiaryTextColor = ? WHERE Id = ?`;

    const values = [ EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const deleteEvent = (id, callback) => {
    const query = ` DELETE FROM events WHERE Id = ? `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    getEventStatus,
    updateEventById,
    deleteEvent
};