const db = require('../../config/db');

// Ensure table exists on initialization
const initTable = () => {
    const createSql = `
        CREATE TABLE IF NOT EXISTS platform_feedback (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            UserId INT NULL,
            UserName VARCHAR(100) NOT NULL,
            UserEmail VARCHAR(150) NULL,
            Rating TINYINT NOT NULL,
            Category VARCHAR(100) DEFAULT 'General Experience',
            Comments TEXT NOT NULL,
            Status VARCHAR(20) DEFAULT 'approved',
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createSql, (err) => {
        if (err) console.error("Error creating platform_feedback table:", err);
    });
};

initTable();

const createPlatformFeedback = (data, callback) => {
    const { UserId, UserName, UserEmail, Rating, Category, Comments } = data;
    const query = `
        INSERT INTO platform_feedback (UserId, UserName, UserEmail, Rating, Category, Comments, Status)
        VALUES (?, ?, ?, ?, ?, ?, 'approved')
    `;
    db.query(query, [UserId || null, UserName, UserEmail || null, Rating, Category || 'General Experience', Comments], (err, result) => {
        if (err) return callback(err, null);
        callback(null, {
            Id: result.insertId,
            UserId,
            UserName,
            UserEmail,
            Rating,
            Category: Category || 'General Experience',
            Comments,
            Status: 'approved',
            CreatedAt: new Date()
        });
    });
};

const getAllPlatformFeedback = (callback) => {
    const query = `SELECT * FROM platform_feedback ORDER BY CreatedAt DESC`;
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const getTestimonials = (limit = 12, callback) => {
    const query = `
        SELECT Id, UserId, UserName, UserEmail, Rating, Category, Comments, CreatedAt 
        FROM platform_feedback 
        WHERE Status = 'approved' AND Rating >= 3
        ORDER BY Rating DESC, CreatedAt DESC 
        LIMIT ?
    `;
    db.query(query, [Number(limit)], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const deletePlatformFeedback = (id, callback) => {
    const query = `DELETE FROM platform_feedback WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

module.exports = {
    createPlatformFeedback,
    getAllPlatformFeedback,
    getTestimonials,
    deletePlatformFeedback
};
