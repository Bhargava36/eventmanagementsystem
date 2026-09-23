const db = require('../../config/db');

const createEvent = (EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor,PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, callback) => {

    const query = ` INSERT INTO events ( EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor];


    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllEvents = (callback) => {

    const query = ` SELECT * FROM events ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getEventById = (id, callback) => {
    const query = `SELECT * FROM events WHERE Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Get event by ID DB error:", err);
            return callback(err, null);
        }

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
    const query = ` Update Events SET EventName = ?, Description = ?, Facilities = ?, Requirements = ?, TeamSize = ?, StartDate = ?, EndDate = ?, RegistrationStart = ?, RegistrationEnd = ?, Location = ?, EventType = ?, EventStatus = ?, HackathonMode = ?, PrimaryColor = ?, SecondaryColor = ?, TertiaryColor = ?, PrimaryTextColor = ?, SecondaryTextColor = ?, TertiaryTextColor = ? WHERE Id = ? `;
    db.query(query, [EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    }
    );
};

const deleteEvent = (id, callback) => {

    const query = ` DELETE FROM Events WHERE Id = ? `;

    db.query(query, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    }
    );
};


module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    updateEventById,
    deleteEvent
};