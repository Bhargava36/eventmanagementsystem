const db = require('../../config/db');

// --- Speakers ---
const getSpeakers = (eventId, callback) => {
    const query = `
        SELECT * FROM seminar_speakers 
        WHERE EventId = ? 
        ORDER BY OrderIndex ASC, Id ASC
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};

const createSpeaker = (data, callback) => {
    const {
        EventId,
        Name,
        Designation = '',
        Organization = '',
        Topic = '',
        Bio = '',
        PhotoUrl = '',
        LinkedinUrl = '',
        OrderIndex = 0
    } = data;

    const query = `
        INSERT INTO seminar_speakers 
        (EventId, Name, Designation, Organization, Topic, Bio, PhotoUrl, LinkedinUrl, OrderIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [EventId, Name, Designation, Organization, Topic, Bio, PhotoUrl, LinkedinUrl, OrderIndex],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, { insertId: result.insertId, ...data });
        }
    );
};

const updateSpeaker = (speakerId, data, callback) => {
    const {
        Name,
        Designation,
        Organization,
        Topic,
        Bio,
        PhotoUrl,
        LinkedinUrl,
        OrderIndex
    } = data;

    const query = `
        UPDATE seminar_speakers SET
            Name = COALESCE(?, Name),
            Designation = COALESCE(?, Designation),
            Organization = COALESCE(?, Organization),
            Topic = COALESCE(?, Topic),
            Bio = COALESCE(?, Bio),
            PhotoUrl = COALESCE(?, PhotoUrl),
            LinkedinUrl = COALESCE(?, LinkedinUrl),
            OrderIndex = COALESCE(?, OrderIndex)
        WHERE Id = ?
    `;

    db.query(
        query,
        [Name, Designation, Organization, Topic, Bio, PhotoUrl, LinkedinUrl, OrderIndex, speakerId],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, result);
        }
    );
};

const deleteSpeaker = (speakerId, callback) => {
    const query = `DELETE FROM seminar_speakers WHERE Id = ?`;
    db.query(query, [speakerId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

// --- Sessions / Agenda ---
const getSessions = (eventId, callback) => {
    const query = `
        SELECT * FROM seminar_sessions 
        WHERE EventId = ? 
        ORDER BY OrderIndex ASC, StartTime ASC, Id ASC
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
        SessionDate = null,
        DayNumber = 1,
        StartTime,
        EndTime,
        SpeakerName = '',
        HallName = 'Main Auditorium',
        Description = '',
        ResourcesUrl = '',
        OrderIndex = 0
    } = data;

    const query = `
        INSERT INTO seminar_sessions 
        (EventId, SessionTitle, SessionDate, DayNumber, StartTime, EndTime, SpeakerName, HallName, Description, ResourcesUrl, OrderIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [EventId, SessionTitle, SessionDate, DayNumber, StartTime, EndTime, SpeakerName, HallName, Description, ResourcesUrl, OrderIndex],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, { insertId: result.insertId, ...data });
        }
    );
};

const updateSession = (sessionId, data, callback) => {
    const {
        SessionTitle,
        SessionDate,
        DayNumber,
        StartTime,
        EndTime,
        SpeakerName,
        HallName,
        Description,
        ResourcesUrl,
        OrderIndex
    } = data;

    const query = `
        UPDATE seminar_sessions SET
            SessionTitle = COALESCE(?, SessionTitle),
            SessionDate = COALESCE(?, SessionDate),
            DayNumber = COALESCE(?, DayNumber),
            StartTime = COALESCE(?, StartTime),
            EndTime = COALESCE(?, EndTime),
            SpeakerName = COALESCE(?, SpeakerName),
            HallName = COALESCE(?, HallName),
            Description = COALESCE(?, Description),
            ResourcesUrl = COALESCE(?, ResourcesUrl),
            OrderIndex = COALESCE(?, OrderIndex)
        WHERE Id = ?
    `;

    db.query(
        query,
        [SessionTitle, SessionDate, DayNumber, StartTime, EndTime, SpeakerName, HallName, Description, ResourcesUrl, OrderIndex, sessionId],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, result);
        }
    );
};

const deleteSession = (sessionId, callback) => {
    const query = `DELETE FROM seminar_sessions WHERE Id = ?`;
    db.query(query, [sessionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

// --- Delegates & Attendance ---
const getDelegates = (eventId, callback) => {
    const query = `
        SELECT DISTINCT
            u.Id AS UserId,
            u.UserName,
            u.Email,
            COALESCE(u.Mobile, '') AS Mobile,
            COALESCE(u.College, rt.College, '') AS College,
            rt.Id AS TeamId,
            rt.TeamName,
            COALESCE(sa.CheckInStatus, 'Registered') AS CheckInStatus,
            sa.CheckInTime,
            sa.CheckInBy,
            COALESCE(sa.FeedbackSubmitted, FALSE) AS FeedbackSubmitted,
            COALESCE(sa.FeedbackRating, 0) AS FeedbackRating,
            sa.FeedbackComments,
            COALESCE(sa.CertificateIssued, FALSE) AS CertificateIssued,
            er.CreatedAt AS RegistrationDate
        FROM registered_teams rt
        JOIN event_registrations er ON er.TeamId = rt.Id AND er.EventId = ?
        JOIN users u ON u.Id = rt.TeamLeadUserId
        LEFT JOIN seminar_attendance sa ON sa.EventId = ? AND sa.UserId = u.Id
        WHERE rt.EventId = ?
        ORDER BY rt.Id DESC
    `;
    db.query(query, [eventId, eventId, eventId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results || []);
    });
};

const checkInDelegate = ({ eventId, userId, teamId, checkInBy = 'Admin Gate', status = 'CheckedIn' }, callback) => {
    const isPresent = status === 'CheckedIn' || status === 'checked_in' || status === 'present';
    const isAbsent = status === 'Absent' || status === 'absent';
    const finalStatus = isPresent ? 'CheckedIn' : isAbsent ? 'Absent' : 'Registered';

    const query = `
        INSERT INTO seminar_attendance (EventId, UserId, TeamId, CheckInStatus, CheckInTime, CheckInBy)
        VALUES (?, ?, ?, ?, ${isPresent ? 'NOW()' : 'NULL'}, ?)
        ON DUPLICATE KEY UPDATE
            CheckInStatus = VALUES(CheckInStatus),
            CheckInTime = IF(VALUES(CheckInStatus) = 'CheckedIn', COALESCE(CheckInTime, NOW()), NULL),
            CheckInBy = VALUES(CheckInBy)
    `;
    db.query(query, [eventId, userId, teamId || null, finalStatus, checkInBy], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

const submitFeedback = ({ eventId, userId, rating, comments }, callback) => {
    const query = `
        INSERT INTO seminar_attendance (EventId, UserId, FeedbackSubmitted, FeedbackRating, FeedbackComments)
        VALUES (?, ?, TRUE, ?, ?)
        ON DUPLICATE KEY UPDATE
            FeedbackSubmitted = TRUE,
            FeedbackRating = VALUES(FeedbackRating),
            FeedbackComments = VALUES(FeedbackComments)
    `;
    db.query(query, [eventId, userId, rating || 5, comments || ''], (err, result) => {
        if (err) return callback(err, null);

        // Mirror directly into central feedback table
        const mirrorQuery = `
            INSERT INTO feedback (UserName, EventName, Category, Rating, Comments, EventId, AdminId)
            SELECT u.UserName, e.EventName, 'Seminar Experience', ?, ?, e.Id, (SELECT Id FROM event_admins WHERE EventId = e.Id LIMIT 1)
            FROM users u, events e
            WHERE u.Id = ? AND e.Id = ?
            ON DUPLICATE KEY UPDATE
                Rating = VALUES(Rating),
                Comments = VALUES(Comments)
        `;
        db.query(mirrorQuery, [rating || 5, comments || '', userId, eventId], () => {});

        return callback(null, result);
    });
};

const issueCertificate = ({ eventId, userId }, callback) => {
    const query = `
        UPDATE seminar_attendance 
        SET CertificateIssued = TRUE 
        WHERE EventId = ? AND UserId = ?
    `;
    db.query(query, [eventId, userId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

// --- Resources ---
const getResources = (eventId, callback) => {
    const query = `
        SELECT * FROM seminar_resources 
        WHERE EventId = ? 
        ORDER BY Id DESC
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};

const createResource = (data, callback) => {
    const { EventId, Title, ResourceType = 'Slides', ResourceUrl, Description = '' } = data;
    const query = `
        INSERT INTO seminar_resources (EventId, Title, ResourceType, ResourceUrl, Description)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [EventId, Title, ResourceType, ResourceUrl, Description], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, { insertId: result.insertId, ...data });
    });
};

const deleteResource = (resourceId, callback) => {
    const query = `DELETE FROM seminar_resources WHERE Id = ?`;
    db.query(query, [resourceId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

const updateResource = (resourceId, data, callback) => {
    const { Title, ResourceType, ResourceUrl, Description = '' } = data;
    const query = `
        UPDATE seminar_resources SET
            Title = COALESCE(?, Title),
            ResourceType = COALESCE(?, ResourceType),
            ResourceUrl = COALESCE(?, ResourceUrl),
            Description = COALESCE(?, Description)
        WHERE Id = ?
    `;
    db.query(query, [Title, ResourceType, ResourceUrl, Description, resourceId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

module.exports = {
    getSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getDelegates,
    checkInDelegate,
    submitFeedback,
    issueCertificate,
    getResources,
    createResource,
    updateResource,
    deleteResource
};
