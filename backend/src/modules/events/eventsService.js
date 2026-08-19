const db = require('../../config/db');

const createEvent = (EventName, Description, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, SuperAdminId, AdminId, PrimaryColor, SecondaryColor, TertiaryColor, callback) => {

    const query = ` INSERT INTO events ( EventName, Description, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, SuperAdminId, AdminId, PrimaryColor, SecondaryColor, TertiaryColor ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [EventName, Description, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, SuperAdminId, AdminId, PrimaryColor, SecondaryColor, TertiaryColor];


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
    const query = ` SELECT * FROM Events where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateEventById = (id, EventName, Description, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, PrimaryColor, SecondaryColor, TertiaryColor, callback) => {
    const query = ` Update Events SET EventName = ?, Description = ?, StartDate = ?, EndDate = ?, RegistrationStart = ?, RegistrationEnd = ?, Location = ?, EventType = ? WHERE Id = ? `;
    db.query(query, [EventName, Description, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, id, PrimaryColor, SecondaryColor, TertiaryColor ], (err, result) => {

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
    updateEventById,
    deleteEvent

};