const db = require('../../config/db');

// Sessions
const getSessions = (eventId, callback) => {
    const query = `
        SELECT * FROM workshop_sessions 
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
        INSERT INTO workshop_sessions 
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
        UPDATE workshop_sessions 
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
    const query = `DELETE FROM workshop_sessions WHERE Id = ?`;
    db.query(query, [sessionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result);
    });
};

// Resources
const getResources = (eventId, callback) => {
    const query = `
        SELECT * FROM workshop_resources 
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
        ResourceType = 'Document',
        ResourceUrl,
        Description = null,
        SessionId = null
    } = data;

    const query = `
        INSERT INTO workshop_resources (EventId, Title, ResourceType, ResourceUrl, Description, SessionId)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [EventId, Title, ResourceType, ResourceUrl, Description, SessionId], (err, result) => {
        if (err) return callback(err, null);
        return callback(null, { insertId: result.insertId, ...data });
    });
};

const deleteResource = (resourceId, callback) => {
    const query = `DELETE FROM workshop_resources WHERE Id = ?`;
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

module.exports = {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getResources,
    createResource,
    deleteResource,
    getAttendance,
    markAttendance
};
