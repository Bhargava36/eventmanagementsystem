const db = require('../../config/db');

const createFeedback = (feedbackData, callback) => {
    const { UserName, EventName, Category, Rating, Comments } = feedbackData;
    const eventQuery = `SELECT e.Id AS EventId, e.EventName, u.Id AS AdminId FROM events e LEFT JOIN users u ON u.EventId = e.Id AND u.RoleId = 2 WHERE LOWER(TRIM(e.EventName)) = LOWER(TRIM(?)) LIMIT 1`;
    db.query(eventQuery, [EventName], (eventErr, eventResults) => {
        if (eventErr) {
            return callback(eventErr, null);
        }
        if (eventResults.length === 0) {
            return callback(new Error('Event not found. Please enter a valid event name.'), null);
        }
        const event = eventResults[0];
        const insertQuery = `INSERT INTO feedback (UserName, EventName, Category, Rating, Comments, EventId, AdminId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertQuery, [UserName, event.EventName, Category, Rating, Comments, event.EventId, event.AdminId], (insertErr, result) => {
            if (insertErr) {
                return callback(insertErr, null);
            }
            callback(null, {
                Id: result.insertId,
                UserName,
                EventName: event.EventName,
                Category,
                Rating,
                Comments,
                EventId: event.EventId,
                AdminId: event.AdminId
            });
        });
    });
};

const getAllFeedback = (callback) => {
    const query = `SELECT f.Id, f.UserName, f.EventName, f.Category, f.Rating, f.Comments, f.EventId, f.AdminId, f.CreatedAt FROM feedback f ORDER BY f.CreatedAt DESC`;
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const getFeedbackByAdmin = (adminId, callback) => {
    const query = `SELECT Id, UserName, EventName, Category, Rating, Comments, EventId, AdminId, CreatedAt FROM feedback WHERE AdminId = ? ORDER BY CreatedAt DESC`;
    db.query(query, [adminId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const getFeedbackById = (id, callback) => {
    const query = `SELECT Id, UserName, EventName, Category, Rating, Comments, EventId, AdminId, CreatedAt FROM feedback WHERE Id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results.length > 0 ? results[0] : null);
    });
};

module.exports = {
    createFeedback,
    getAllFeedback,
    getFeedbackByAdmin,
    getFeedbackById
};