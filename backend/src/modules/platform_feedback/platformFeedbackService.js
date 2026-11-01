const db = require('../../config/db');

// Ensure table exists on initialization
const initTable = () => {
    const createSql = `
        CREATE TABLE IF NOT EXISTS platform_feedback (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            UserId INT NULL,
            UserName VARCHAR(100) NOT NULL,
            UserEmail VARCHAR(150) NULL,
            UserPhoto VARCHAR(500) NULL,
            Rating TINYINT NOT NULL,
            Category VARCHAR(100) DEFAULT 'General Experience',
            Comments TEXT NOT NULL,
            Status VARCHAR(20) DEFAULT 'approved',
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(createSql, (err) => {
        if (err) console.error("Error creating platform_feedback table:", err);
        // Ensure UserPhoto column exists in pre-existing tables
        db.query(`ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS UserPhoto VARCHAR(500) NULL AFTER UserEmail`, () => {});
    });
};

initTable();

const createPlatformFeedback = (data, callback) => {
    const { UserId, UserName, UserEmail, UserPhoto, Rating, Category, Comments } = data;
    const query = `
        INSERT INTO platform_feedback (UserId, UserName, UserEmail, UserPhoto, Rating, Category, Comments, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
    `;
    db.query(query, [UserId || null, UserName, UserEmail || null, UserPhoto || null, Rating, Category || 'General Experience', Comments], (err, result) => {
        if (err) return callback(err, null);
        callback(null, {
            Id: result.insertId,
            UserId,
            UserName,
            UserEmail,
            UserPhoto: UserPhoto || null,
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
        SELECT 
            pf.Id, 
            pf.UserId, 
            pf.UserName, 
            pf.UserEmail, 
            pf.Rating, 
            pf.Category, 
            pf.Comments, 
            pf.CreatedAt,
            COALESCE(
                NULLIF(TRIM(pf.UserPhoto), ''),
                (
                    SELECT u.Photo FROM users u 
                    WHERE (pf.UserId IS NOT NULL AND u.Id = pf.UserId)
                       OR (pf.UserEmail IS NOT NULL AND LOWER(TRIM(u.Email)) = LOWER(TRIM(pf.UserEmail)))
                       OR (LOWER(TRIM(u.UserName)) = LOWER(TRIM(pf.UserName)))
                    AND u.Photo IS NOT NULL AND TRIM(u.Photo) != ''
                    LIMIT 1
                ),
                (
                    SELECT rtm.Photo FROM registered_team_members rtm 
                    WHERE (pf.UserId IS NOT NULL AND rtm.UserId = pf.UserId)
                       OR (pf.UserEmail IS NOT NULL AND LOWER(TRIM(rtm.MemberEmail)) = LOWER(TRIM(pf.UserEmail)))
                       OR (LOWER(TRIM(rtm.MemberName)) = LOWER(TRIM(pf.UserName)))
                    AND rtm.Photo IS NOT NULL AND TRIM(rtm.Photo) != ''
                    ORDER BY rtm.Id DESC
                    LIMIT 1
                ),
                (
                    SELECT ect.Photo FROM event_core_team ect 
                    WHERE (pf.UserEmail IS NOT NULL AND LOWER(TRIM(ect.Email)) = LOWER(TRIM(pf.UserEmail)))
                       OR (LOWER(TRIM(ect.Name)) = LOWER(TRIM(pf.UserName)))
                    AND ect.Photo IS NOT NULL AND TRIM(ect.Photo) != ''
                    ORDER BY ect.Id DESC
                    LIMIT 1
                )
            ) AS UserPhoto
        FROM platform_feedback pf
        WHERE pf.Status = 'approved' AND pf.Rating >= 3
        ORDER BY 
            (CASE 
                WHEN (
                    COALESCE(
                        NULLIF(TRIM(pf.UserPhoto), ''),
                        (SELECT u.Photo FROM users u WHERE (pf.UserId IS NOT NULL AND u.Id = pf.UserId) OR (pf.UserEmail IS NOT NULL AND LOWER(TRIM(u.Email)) = LOWER(TRIM(pf.UserEmail))) LIMIT 1)
                    ) IS NOT NULL
                ) THEN 0 
                ELSE 1 
            END) ASC,
            pf.Rating DESC, 
            pf.CreatedAt DESC 
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
