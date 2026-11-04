const db = require('../../config/db');

const createFeedback = (feedbackData, callback) => {
    const { UserName, EventName, EventId, Category, Rating, Comments } = feedbackData;
    let eventQuery = '';
    let eventParams = [];
    if (EventId && Number(EventId) > 0) {
        eventQuery = `
            SELECT e.Id AS EventId, e.EventName, 
                   COALESCE(
                       (SELECT Id FROM event_admins WHERE EventId = e.Id LIMIT 1),
                       (SELECT Id FROM users WHERE EventId = e.Id AND RoleId = 2 LIMIT 1)
                   ) AS AdminId 
            FROM events e 
            WHERE e.Id = ? 
            LIMIT 1
        `;
        eventParams = [Number(EventId)];
    } else {
        eventQuery = `
            SELECT e.Id AS EventId, e.EventName, 
                   COALESCE(
                       (SELECT Id FROM event_admins WHERE EventId = e.Id LIMIT 1),
                       (SELECT Id FROM users WHERE EventId = e.Id AND RoleId = 2 LIMIT 1)
                   ) AS AdminId 
            FROM events e 
            WHERE LOWER(TRIM(e.EventName)) = LOWER(TRIM(?)) 
            LIMIT 1
        `;
        eventParams = [EventName];
    }

    db.query(eventQuery, eventParams, (eventErr, eventResults) => {
        if (eventErr) return callback(eventErr, null);
        if (!eventResults || eventResults.length === 0) {
            return callback(new Error('Event not found. Please provide a valid event.'), null);
        }
        const event = eventResults[0];

        // Check if user already submitted feedback for this event
        const checkQuery = `SELECT Id FROM feedback WHERE EventId = ? AND LOWER(TRIM(UserName)) = LOWER(TRIM(?)) LIMIT 1`;
        db.query(checkQuery, [event.EventId, UserName], (checkErr, checkRows) => {
            if (checkErr) return callback(checkErr, null);

            if (checkRows && checkRows.length > 0) {
                // Update existing feedback
                const existingId = checkRows[0].Id;
                const updateQuery = `
                    UPDATE feedback 
                    SET Rating = ?, Comments = ?, Category = ?, CreatedAt = CURRENT_TIMESTAMP 
                    WHERE Id = ?
                `;
                db.query(updateQuery, [Rating, Comments, Category, existingId], (upErr) => {
                    if (upErr) return callback(upErr, null);
                    // Also sync to seminar_attendance if delegate exists
                    db.query(
                        `UPDATE seminar_attendance SET FeedbackSubmitted = 1, FeedbackRating = ?, FeedbackComments = ? WHERE EventId = ? AND LOWER(TRIM(FullName)) = LOWER(TRIM(?))`,
                        [Rating, Comments, event.EventId, UserName],
                        () => {}
                    );
                    return callback(null, {
                        Id: existingId,
                        UserName,
                        EventName: event.EventName,
                        Category,
                        Rating,
                        Comments,
                        EventId: event.EventId,
                        AdminId: event.AdminId,
                        isUpdated: true
                    });
                });
            } else {
                // Insert new feedback
                const insertQuery = `INSERT INTO feedback (UserName, EventName, Category, Rating, Comments, EventId, AdminId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                db.query(insertQuery, [UserName, event.EventName, Category, Rating, Comments, event.EventId, event.AdminId], (insertErr, result) => {
                    if (insertErr) return callback(insertErr, null);
                    // Also sync to seminar_attendance if delegate exists
                    db.query(
                        `UPDATE seminar_attendance SET FeedbackSubmitted = 1, FeedbackRating = ?, FeedbackComments = ? WHERE EventId = ? AND LOWER(TRIM(FullName)) = LOWER(TRIM(?))`,
                        [Rating, Comments, event.EventId, UserName],
                        () => {}
                    );
                    return callback(null, {
                        Id: result.insertId,
                        UserName,
                        EventName: event.EventName,
                        Category,
                        Rating,
                        Comments,
                        EventId: event.EventId,
                        AdminId: event.AdminId,
                        isUpdated: false
                    });
                });
            }
        });
    });
};

// Unified single query for all events feedback
const getAllFeedback = (callback) => {
    const query = `
        SELECT 
            f.Id, 
            f.UserName, 
            f.EventName, 
            f.Category, 
            f.Rating, 
            f.Comments, 
            f.EventId, 
            f.AdminId, 
            f.CreatedAt,
            u.Photo AS UserPhoto
        FROM feedback f 
        LEFT JOIN users u ON LOWER(TRIM(u.UserName)) = LOWER(TRIM(f.UserName))
        ORDER BY f.CreatedAt DESC
    `;
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results || []);
    });
};

// Unified single query for event-scoped feedback
const getFeedbackByEvent = (eventId, callback) => {
    const query = `
        SELECT 
            f.Id, 
            f.UserName, 
            f.EventName, 
            f.Category, 
            f.Rating, 
            f.Comments, 
            f.EventId, 
            f.AdminId, 
            f.CreatedAt,
            u.Photo AS UserPhoto
        FROM feedback f 
        LEFT JOIN users u ON LOWER(TRIM(u.UserName)) = LOWER(TRIM(f.UserName))
        WHERE f.EventId = ?
        ORDER BY f.CreatedAt DESC
    `;
    db.query(query, [Number(eventId)], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results || []);
    });
};

// Unified single query for admin-scoped feedback
const getFeedbackByAdmin = (adminId, callback) => {
    const query = `
        SELECT 
            f.Id, 
            f.UserName, 
            f.EventName, 
            f.Category, 
            f.Rating, 
            f.Comments, 
            f.EventId, 
            f.AdminId, 
            f.CreatedAt,
            u.Photo AS UserPhoto
        FROM feedback f 
        LEFT JOIN users u ON LOWER(TRIM(u.UserName)) = LOWER(TRIM(f.UserName))
        WHERE f.AdminId = ? OR f.EventId IN (SELECT EventId FROM event_admins WHERE Id = ?)
        ORDER BY f.CreatedAt DESC
    `;
    db.query(query, [Number(adminId), Number(adminId)], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results || []);
    });
};

const getFeedbackById = (id, callback) => {
    const query = `
        SELECT f.Id, f.UserName, f.EventName, f.Category, f.Rating, f.Comments, f.EventId, f.AdminId, f.CreatedAt, u.Photo AS UserPhoto 
        FROM feedback f 
        LEFT JOIN users u ON LOWER(TRIM(u.UserName)) = LOWER(TRIM(f.UserName))
        WHERE f.Id = ?
    `;
    db.query(query, [id], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results.length > 0 ? results[0] : null);
    });
};

const deleteFeedback = (id, callback) => {
    const query = `DELETE FROM feedback WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

module.exports = {
    createFeedback,
    getAllFeedback,
    getFeedbackByAdmin,
    getFeedbackByEvent,
    getFeedbackById,
    deleteFeedback
};