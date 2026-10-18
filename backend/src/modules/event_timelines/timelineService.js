const db = require("../../config/db");

const getTimelinesByEvent = (eventId, callback) => {
    const query = `
        SELECT Id, EventId, Track, TimelineDate, Heading, Description, OrderIndex, CreatedAt, UpdatedAt 
        FROM event_timelines 
        WHERE EventId = ? 
        ORDER BY Track ASC, OrderIndex ASC, Id ASC
    `;

    db.query(query, [eventId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const getTimelineById = (id, callback) => {
    const query = `SELECT * FROM event_timelines WHERE Id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};

const createTimeline = (data, callback) => {
    const { EventId, Track = 'General', TimelineDate, Heading, Description = '', OrderIndex = 0 } = data;

    const query = `
        INSERT INTO event_timelines (EventId, Track, TimelineDate, Heading, Description, OrderIndex) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [EventId, Track, TimelineDate, Heading, Description, OrderIndex], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, {
            Id: result.insertId,
            EventId,
            Track,
            TimelineDate,
            Heading,
            Description,
            OrderIndex
        });
    });
};

const updateTimeline = (id, data, callback) => {
    const { Track, TimelineDate, Heading, Description, OrderIndex } = data;

    const fields = [];
    const values = [];

    if (Track !== undefined) {
        fields.push("Track = ?");
        values.push(Track);
    }
    if (TimelineDate !== undefined) {
        fields.push("TimelineDate = ?");
        values.push(TimelineDate);
    }
    if (Heading !== undefined) {
        fields.push("Heading = ?");
        values.push(Heading);
    }
    if (Description !== undefined) {
        fields.push("Description = ?");
        values.push(Description);
    }
    if (OrderIndex !== undefined) {
        fields.push("OrderIndex = ?");
        values.push(OrderIndex);
    }

    if (fields.length === 0) {
        return callback(null, { message: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE event_timelines SET ${fields.join(", ")} WHERE Id = ?`;

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

const deleteTimeline = (id, callback) => {
    const query = `DELETE FROM event_timelines WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

module.exports = {
    getTimelinesByEvent,
    getTimelineById,
    createTimeline,
    updateTimeline,
    deleteTimeline
};
