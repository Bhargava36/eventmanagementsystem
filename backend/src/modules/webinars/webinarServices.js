const db = require('../../config/db');
// Sessions (Keynotes, Panels & Virtual Broadcasts)
const getSessions = (eventId, callback) => {
    const query = `
        SELECT * FROM webinar_sessions
        WHERE EventId = ?
        ORDER BY DayNumber ASC, StartTime ASC, Id ASC
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const createSession = (data, callback) => {
    const {
        EventId,
        SessionTitle,
        DayNumber = 1,
        SessionDate = null,
        StartTime = null,
        EndTime = null,
        SpeakerName = null,
        SpeakerDesignation = null,
        SpeakerCompany = null,
        SpeakerPhoto = null,
        VenueOrMeetLink = null,
        Description = null,
        ResourcesUrl = null,
        DisplayOrder = 0
    } = data;
    const query = `
        INSERT INTO webinar_sessions
        (EventId, SessionTitle, DayNumber, SessionDate, StartTime, EndTime, SpeakerName, SpeakerDesignation, SpeakerCompany, SpeakerPhoto, VenueOrMeetLink, Description, ResourcesUrl, DisplayOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        query,
        [EventId, SessionTitle, DayNumber, SessionDate, StartTime, EndTime, SpeakerName, SpeakerDesignation, SpeakerCompany, SpeakerPhoto, VenueOrMeetLink, Description, ResourcesUrl, DisplayOrder],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, { insertId: result.insertId, ...data });
        }
    );
};
const updateSession = (sessionId, data, callback) => {
    const {
        SessionTitle,
        DayNumber,
        SessionDate,
        StartTime,
        EndTime,
        SpeakerName,
        SpeakerDesignation,
        SpeakerCompany,
        SpeakerPhoto,
        VenueOrMeetLink,
        Description,
        ResourcesUrl,
        DisplayOrder
    } = data;
    const query = `
        UPDATE webinar_sessions
        SET SessionTitle = COALESCE(?, SessionTitle),
            DayNumber = COALESCE(?, DayNumber),
            SessionDate = COALESCE(?, SessionDate),
            StartTime = COALESCE(?, StartTime),
            EndTime = COALESCE(?, EndTime),
            SpeakerName = COALESCE(?, SpeakerName),
            SpeakerDesignation = COALESCE(?, SpeakerDesignation),
            SpeakerCompany = COALESCE(?, SpeakerCompany),
            SpeakerPhoto = COALESCE(?, SpeakerPhoto),
            VenueOrMeetLink = COALESCE(?, VenueOrMeetLink),
            Description = COALESCE(?, Description),
            ResourcesUrl = COALESCE(?, ResourcesUrl),
            DisplayOrder = COALESCE(?, DisplayOrder)
        WHERE Id = ?
    `;
    db.query(
        query,
        [SessionTitle, DayNumber, SessionDate, StartTime, EndTime, SpeakerName, SpeakerDesignation, SpeakerCompany, SpeakerPhoto, VenueOrMeetLink, Description, ResourcesUrl, DisplayOrder, sessionId],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, result);
        }
    );
};
const deleteSession = (sessionId, callback) => {
    const query = `DELETE FROM webinar_sessions WHERE Id = ?`;
    db.query(query, [sessionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
// Resources (Decks, Replay Videos, Whitepapers & Delegate Handouts)
const getResources = (eventId, callback) => {
    const query = `
        SELECT * FROM webinar_resources
        WHERE EventId = ?
        ORDER BY Id DESC
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const createResource = (data, callback) => {
    const {
        EventId,
        Title,
        ResourceType = 'Deck',
        ResourceUrl,
        Description = null,
        SessionId = null
    } = data;
    const query = `
        INSERT INTO webinar_resources (EventId, Title, ResourceType, ResourceUrl, Description, SessionId)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [EventId, Title, ResourceType, ResourceUrl, Description, SessionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, { insertId: result.insertId, ...data });
    });
};
const deleteResource = (resourceId, callback) => {
    const query = `DELETE FROM webinar_resources WHERE Id = ?`;
    db.query(query, [resourceId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
// Attendance
const getAttendance = (eventId, dayNumber = 1, sessionSlot = 'Morning', callback) => {
    const query = `
        SELECT DISTINCT
            tm.UserId,
            COALESCE(u.UserName, tm.MemberName) AS UserName,
            COALESCE(u.Email, tm.MemberEmail) AS Email,
            COALESCE(u.Mobile, '') AS Mobile,
            COALESCE(tm.MemberCollege, rt.College, u.College, '') AS College,
            rt.TeamName,
            rt.Id AS TeamId,
            COALESCE(ea.Status, 'not_checked_in') AS AttendanceStatus,
            ea.CheckInTime,
            ea.Remarks,
            ? AS DayNumber,
            ? AS SessionSlot
        FROM registered_teams rt
        JOIN registered_team_members tm ON tm.TeamId = rt.Id
        LEFT JOIN users u ON tm.UserId = u.Id
        LEFT JOIN event_attendance ea ON ea.EventId = rt.EventId
            AND ea.UserId = tm.UserId
            AND ea.DayNumber = ?
            AND ea.SessionSlot = ?
        WHERE rt.EventId = ?
        ORDER BY tm.Id ASC
    `;
    const allRecordsQuery = `
        SELECT ea.UserId, ea.DayNumber, ea.SessionSlot, ea.Status, ea.CheckInTime
        FROM event_attendance ea
        WHERE ea.EventId = ?
    `;
    db.query(query, [dayNumber, sessionSlot, dayNumber, sessionSlot, eventId], (err, results) => {
        if (err) return callback(err, null, null);
        db.query(allRecordsQuery, [eventId], (aErr, allRecords) => {
            if (aErr) {
                return callback(null, results, []);
            }
            return callback(null, results, allRecords || []);
        });
    });
};
const markAttendance = (eventId, userId, status, markedBy, dayNumber = 1, sessionSlot = 'Morning', attendanceDate = null, callback) => {
    const checkInTime = status === 'checked_in' ? new Date() : null;
    const query = `
        INSERT INTO event_attendance (EventId, UserId, Status, CheckInTime, CheckedInBy, DayNumber, SessionSlot, AttendanceDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            Status = VALUES(Status),
            CheckInTime = VALUES(CheckInTime),
            CheckedInBy = VALUES(CheckedInBy),
            AttendanceDate = VALUES(AttendanceDate),
            UpdatedAt = CURRENT_TIMESTAMP
    `;
    db.query(query, [eventId, userId, status, checkInTime, markedBy, dayNumber, sessionSlot, attendanceDate], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
const getUserAttendance = (eventId, userId, callback) => {
    const query = `
        SELECT
            ea.UserId,
            ea.DayNumber,
            ea.SessionSlot,
            ea.Status,
            ea.CheckInTime,
            ea.Remarks,
            ea.AttendanceDate
        FROM event_attendance ea
        WHERE ea.EventId = ? AND ea.UserId = ?
        ORDER BY ea.DayNumber ASC, ea.SessionSlot ASC
    `;
    db.query(query, [eventId, userId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results || []);
    });
};
// Webinar Delegate Feedback
const submitWebinarFeedback = (data, callback) => {
    const {
        EventId,
        UserId = null,
        UserName,
        UserEmail = null,
        UserPhoto = null,
        KeynoteRating = 5,
        AudioVideoRating = 5,
        ContentQuality = 5,
        OverallRating = 5,
        FavoriteSpeaker = null,
        Comments,
        Suggestions = null
    } = data;
    const query = `
        INSERT INTO webinar_feedback
        (EventId, UserId, UserName, UserEmail, UserPhoto, KeynoteRating, AudioVideoRating, ContentQuality, OverallRating, FavoriteSpeaker, Comments, Suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        query,
        [EventId, UserId, UserName, UserEmail, UserPhoto, KeynoteRating, AudioVideoRating, ContentQuality, OverallRating, FavoriteSpeaker, Comments, Suggestions],
        (err, result) => {
            if (err) return callback(err, null);
            // Also mirror in main feedback table with Category='Webinar Experience' for platform-wide visibility
            const mirrorQuery = `
                INSERT INTO feedback (UserName, EventName, Category, Rating, Comments, EventId, AdminId)
                SELECT ?, e.EventName, 'Webinar Experience', ?, ?, ?, (SELECT Id FROM event_admins WHERE EventId = e.Id LIMIT 1)
                FROM events e
                WHERE e.Id = ?
            `;
            db.query(mirrorQuery, [UserName, OverallRating, Comments, EventId, EventId], () => {});
            return callback(null, {
                insertId: result.insertId,
                ...data,
                CreatedAt: new Date()
            });
        }
    );
};
const getEventFeedback = (eventId, callback) => {
    const query = `
        SELECT
            wf.*,
            COALESCE(u.Photo, wf.UserPhoto) AS Photo
        FROM webinar_feedback wf
        LEFT JOIN users u ON wf.UserId = u.Id
        WHERE wf.EventId = ?
        ORDER BY wf.CreatedAt DESC
    `;
    const statsQuery = `
        SELECT
            COUNT(*) AS TotalFeedbacks,
            ROUND(AVG(OverallRating), 1) AS AvgOverall,
            ROUND(AVG(KeynoteRating), 1) AS AvgKeynote,
            ROUND(AVG(AudioVideoRating), 1) AS AvgAudioVideo,
            ROUND(AVG(ContentQuality), 1) AS AvgContent
        FROM webinar_feedback
        WHERE EventId = ?
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err, null, null);
        db.query(statsQuery, [eventId], (sErr, statsResult) => {
            const stats = (statsResult && statsResult[0]) || {
                TotalFeedbacks: results.length,
                AvgOverall: 0,
                AvgKeynote: 0,
                AvgAudioVideo: 0,
                AvgContent: 0
            };
            return callback(null, results, stats);
        });
    });
};
const getAllWebinarFeedback = (callback) => {
    const query = `
        SELECT
            wf.*,
            e.EventName,
            COALESCE(u.Photo, wf.UserPhoto) AS Photo
        FROM webinar_feedback wf
        LEFT JOIN events e ON wf.EventId = e.Id
        LEFT JOIN users u ON wf.UserId = u.Id
        ORDER BY wf.CreatedAt DESC
    `;
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};
const deleteWebinarFeedback = (id, callback) => {
    const query = `DELETE FROM webinar_feedback WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
// Webinar Live Q&A Services
const getWebinarQuestions = (eventId, currentUserId = null, callback) => {
    const query = `
        SELECT
            wq.*,
            COALESCE(u.Photo, NULL) AS AuthorPhoto,
            EXISTS(
                SELECT 1 FROM webinar_question_upvotes wqu
                WHERE wqu.QuestionId = wq.Id AND wqu.UserId = ?
            ) AS HasUpvoted
        FROM webinar_questions wq
        LEFT JOIN users u ON wq.UserId = u.Id
        WHERE wq.EventId = ? AND wq.Status != 'dismissed'
        ORDER BY
            CASE WHEN wq.Status = 'pinned' THEN 0 ELSE 1 END ASC,
            wq.Upvotes DESC,
            wq.CreatedAt DESC
    `;
    db.query(query, [currentUserId || 0, eventId], (err, rows) => {
        if (err) return callback(err, null);
        return callback(null, rows || []);
    });
};
const createWebinarQuestion = (data, callback) => {
    const { EventId, UserId = null, AuthorName, TargetSpeaker = 'All Speakers & Panel', QuestionText } = data;
    const query = `
        INSERT INTO webinar_questions (EventId, UserId, AuthorName, TargetSpeaker, QuestionText, Upvotes, Status)
        VALUES (?, ?, ?, ?, ?, 1, 'open')
    `;
    db.query(query, [EventId, UserId, AuthorName, TargetSpeaker, QuestionText], (err, result) => {
        if (err) return callback(err, null);
        if (UserId) {
            db.query(
                `INSERT IGNORE INTO webinar_question_upvotes (QuestionId, UserId) VALUES (?, ?)`,
                [result.insertId, UserId],
                () => {}
            );
        }
        return callback(null, {
            Id: result.insertId,
            EventId,
            UserId,
            AuthorName,
            TargetSpeaker,
            QuestionText,
            Upvotes: 1,
            Status: 'open',
            CreatedAt: new Date(),
            HasUpvoted: 1
        });
    });
};
const upvoteWebinarQuestion = (questionId, userId, callback) => {
    if (!userId) {
        db.query(`UPDATE webinar_questions SET Upvotes = Upvotes + 1 WHERE Id = ?`, [questionId], (err) => {
            if (err) return callback(err, null);
            return callback(null, { upvoted: true });
        });
        return;
    }
    db.query(
        `SELECT 1 FROM webinar_question_upvotes WHERE QuestionId = ? AND UserId = ?`,
        [questionId, userId],
        (err, exists) => {
            if (err) return callback(err, null);
            if (exists && exists.length > 0) {
                db.query(`DELETE FROM webinar_question_upvotes WHERE QuestionId = ? AND UserId = ?`, [questionId, userId], () => {});
                db.query(`UPDATE webinar_questions SET Upvotes = GREATEST(1, Upvotes - 1) WHERE Id = ?`, [questionId], () => {});
                return callback(null, { upvoted: false });
            } else {
                db.query(`INSERT INTO webinar_question_upvotes (QuestionId, UserId) VALUES (?, ?)`, [questionId, userId], () => {});
                db.query(`UPDATE webinar_questions SET Upvotes = Upvotes + 1 WHERE Id = ?`, [questionId], () => {});
                return callback(null, { upvoted: true });
            }
        }
    );
};
const updateWebinarQuestionStatus = (questionId, updateData, callback) => {
    const { Status, Answer = null, AnsweredBy = null } = updateData;
    const updates = ['Status = ?'];
    const values = [Status];
    if (Answer !== undefined) {
        updates.push('Answer = ?');
        values.push(Answer);
        updates.push('AnsweredAt = NOW()');
    }
    if (AnsweredBy !== undefined) {
        updates.push('AnsweredBy = ?');
        values.push(AnsweredBy);
    }
    values.push(questionId);
    const query = `UPDATE webinar_questions SET ${updates.join(', ')} WHERE Id = ?`;
    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
const deleteWebinarQuestion = (questionId, callback) => {
    db.query(`DELETE FROM webinar_questions WHERE Id = ?`, [questionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};
module.exports = {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getResources,
    createResource,
    deleteResource,
    getAttendance,
    markAttendance,
    getUserAttendance,
    submitWebinarFeedback,
    getEventFeedback,
    getAllWebinarFeedback,
    deleteWebinarFeedback,
    getWebinarQuestions,
    createWebinarQuestion,
    upvoteWebinarQuestion,
    updateWebinarQuestionStatus,
    deleteWebinarQuestion
};
