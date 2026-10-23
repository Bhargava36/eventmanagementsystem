const db = require("../../config/db");

const getParticipantsByEvent = (EventId, callback) => {
    const query = ` SELECT 
        u.Id AS UserId, 
        COALESCE(NULLIF(tm.MemberName, ''), u.UserName, 'Member') AS ParticipantName, 
        COALESCE(NULLIF(tm.MemberEmail, ''), u.Email, '') AS Email, 
        t.Id AS TeamId, 
        t.TeamName, 
        COALESCE(NULLIF(tm.MemberCollege, ''), u.College, t.College, '') AS College, 
        COALESCE(NULLIF(tm.Gender, ''), u.Gender, 'Male') AS Gender,
        COALESCE(tm.Photo, u.Photo) AS Photo,
        c.IdCardNumber, 
        CASE WHEN c.Id IS NULL THEN 0 ELSE 1 END AS IdCardGenerated,
        COALESCE(ea.Status, 'not_checked_in') AS AttendanceStatus,
        ea.CheckInTime,
        ea.CheckOutTime,
        ea.CheckedInBy,
        ea.CheckedOutBy,
        ea.Remarks
    FROM event_registrations er 
    INNER JOIN registered_teams t ON t.Id = er.TeamId 
    INNER JOIN registered_team_members tm ON tm.TeamId = t.Id 
    INNER JOIN users u ON u.Id = tm.UserId 
    LEFT JOIN participant_id_cards c ON c.EventId = er.EventId AND c.UserId = u.Id 
    LEFT JOIN event_attendance ea ON ea.EventId = er.EventId AND ea.UserId = u.Id
    WHERE er.EventId = ? AND er.ParticipationMode = 'Physical' AND er.Status = 'approved' 
    ORDER BY t.TeamName, ParticipantName`;

    db.query(query, [EventId], (err, result) => {
        if (err) {
            console.error("Get participants error:", err);
            return callback(err, null);
        }
        callback(null, result);
    });
};

const verifyParticipantId = (EventId, UserId, IdCardNumber, callback) => {
    const query = ` SELECT 
        c.IdCardNumber, 
        u.UserName AS ParticipantName, 
        u.Email,
        t.TeamName, 
        t.College, 
        e.EventName, 
        e.StartDate, 
        e.Location,
        COALESCE(ea.Status, 'not_checked_in') AS AttendanceStatus,
        ea.CheckInTime,
        ea.CheckOutTime
    FROM participant_id_cards c 
    INNER JOIN events e ON e.Id = c.EventId 
    INNER JOIN users u ON u.Id = c.UserId 
    INNER JOIN event_registrations er ON er.EventId = c.EventId AND er.Status = 'approved' AND er.ParticipationMode = 'Physical' 
    INNER JOIN registered_teams t ON t.Id = er.TeamId 
    INNER JOIN registered_team_members tm ON tm.TeamId = t.Id AND tm.UserId = c.UserId 
    LEFT JOIN event_attendance ea ON ea.EventId = c.EventId AND ea.UserId = c.UserId
    WHERE c.EventId = ? AND c.UserId = ? AND c.IdCardNumber = ? 
    LIMIT 1`;

    db.query(query, [EventId, UserId, IdCardNumber], (err, result) => {
        if (err) {
            console.error("Verify participant ID error:", err);
            return callback(err, null);
        }
        callback(null, result[0] || null);
    });
};

const generateParticipantIds = (EventId, callback) => {
    db.query("SELECT IDCardEnabled FROM events WHERE Id = ?", [EventId], (eventError, events) => {
        if (eventError) {
            return callback(eventError, null);
        }
        if (!events || events.length === 0) {
            const missingEventError = new Error("Event was not found.");
            missingEventError.status = 404;
            return callback(missingEventError, null);
        }
        if (Number(events[0].IDCardEnabled) !== 1) {
            const disabledError = new Error(
                "ID card generation is not enabled for this event."
            );
            disabledError.status = 403;
            return callback(disabledError, null);
        }
        getParticipantsByEvent(EventId, (err, participants) => {
            if (err) {
                return callback(err, null);
            }
            if (!participants || participants.length === 0) {
                return callback(null, {
                    generated: 0,
                    message: "No eligible physical participants found."
                });
            }
            const pendingParticipants = participants.filter(
                (participant) => !participant.IdCardNumber
            );

            if (pendingParticipants.length === 0) {
                return callback(null, {
                    generated: 0,
                    message: "All eligible participants already have ID cards."
                });
            }
            const values = pendingParticipants.map((participant) => [ EventId, participant.UserId, `EV${EventId}-U${participant.UserId}`]);
            const insertQuery = ` INSERT IGNORE INTO participant_id_cards (EventId, UserId, IdCardNumber) VALUES ? `;
            db.query(insertQuery, [values], (insertError, result) => {
                if (insertError) {
                    console.error("Generate ID cards error:", insertError);
                    return callback(insertError, null);
                }
                callback(null, {
                    generated: result.affectedRows,
                    message: `${result.affectedRows} ID card(s) generated successfully.`
                });
            });
        });
    });
};

// Check-in participant with exact timestamp
const recordCheckIn = (EventId, UserId, checkedInBy, remarks, callback) => {
    const query = `
        INSERT INTO event_attendance (EventId, UserId, Status, CheckInTime, CheckedInBy, Remarks)
        VALUES (?, ?, 'checked_in', NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE 
            Status = 'checked_in', 
            CheckInTime = COALESCE(CheckInTime, NOW()), 
            CheckedInBy = COALESCE(?, CheckedInBy), 
            Remarks = COALESCE(?, Remarks)
    `;
    db.query(query, [EventId, UserId, checkedInBy || 'Admin', remarks || null, checkedInBy || 'Admin', remarks || null], (err, result) => {
        if (err) {
            console.error("Record check-in error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Participant checked in successfully." });
    });
};

// Check-out participant with exact timestamp
const recordCheckOut = (EventId, UserId, checkedOutBy, remarks, callback) => {
    const query = `
        INSERT INTO event_attendance (EventId, UserId, Status, CheckOutTime, CheckedOutBy, Remarks)
        VALUES (?, ?, 'checked_out', NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE 
            Status = 'checked_out', 
            CheckOutTime = NOW(), 
            CheckedOutBy = COALESCE(?, CheckedOutBy), 
            Remarks = COALESCE(?, Remarks)
    `;
    db.query(query, [EventId, UserId, checkedOutBy || 'Admin', remarks || null, checkedOutBy || 'Admin', remarks || null], (err, result) => {
        if (err) {
            console.error("Record check-out error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Participant checked out successfully." });
    });
};

// Reset attendance status
const resetAttendance = (EventId, UserId, callback) => {
    const query = `
        UPDATE event_attendance 
        SET Status = 'not_checked_in', CheckInTime = NULL, CheckOutTime = NULL, CheckedInBy = NULL, CheckedOutBy = NULL 
        WHERE EventId = ? AND UserId = ?
    `;
    db.query(query, [EventId, UserId], (err, result) => {
        if (err) {
            console.error("Reset attendance error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Attendance status reset to pending." });
    });
};

// Instant scan / toggle check-in & check-out by ID Card Number
const scanAttendance = (EventId, IdCardNumber, operatorName, callback) => {
    const trimmedId = String(IdCardNumber || '').trim();
    const findQuery = `
        SELECT c.UserId, u.UserName AS ParticipantName, t.TeamName, COALESCE(ea.Status, 'not_checked_in') AS CurrentStatus
        FROM participant_id_cards c
        INNER JOIN users u ON u.Id = c.UserId
        INNER JOIN event_registrations er ON er.EventId = c.EventId AND er.Status = 'approved' AND er.ParticipationMode = 'Physical'
        INNER JOIN registered_teams t ON t.Id = er.TeamId
        INNER JOIN registered_team_members tm ON tm.TeamId = t.Id AND tm.UserId = c.UserId
        LEFT JOIN event_attendance ea ON ea.EventId = c.EventId AND ea.UserId = c.UserId
        WHERE c.EventId = ? AND (c.IdCardNumber = ? OR u.Id = ?)
        LIMIT 1
    `;
    const numId = Number(trimmedId.replace(/\D/g, ''));
    db.query(findQuery, [EventId, trimmedId, numId || 0], (err, rows) => {
        if (err) return callback(err);
        if (!rows || rows.length === 0) {
            return callback(null, { notFound: true, message: `No active participant found for ID: ${trimmedId}` });
        }

        const participant = rows[0];
        const nextStatus = participant.CurrentStatus === 'checked_in' ? 'checked_out' : 'checked_in';

        if (nextStatus === 'checked_in') {
            recordCheckIn(EventId, participant.UserId, operatorName || 'Admin Scanner', 'Scanned at gate', (cErr) => {
                if (cErr) return callback(cErr);
                callback(null, {
                    action: 'checked_in',
                    participantName: participant.ParticipantName,
                    teamName: participant.TeamName,
                    message: `✅ ${participant.ParticipantName} (${participant.TeamName}) checked in successfully.`
                });
            });
        } else {
            recordCheckOut(EventId, participant.UserId, operatorName || 'Admin Scanner', 'Scanned at exit gate', (cErr) => {
                if (cErr) return callback(cErr);
                callback(null, {
                    action: 'checked_out',
                    participantName: participant.ParticipantName,
                    teamName: participant.TeamName,
                    message: `👋 ${participant.ParticipantName} (${participant.TeamName}) checked out successfully.`
                });
            });
        }
    });
};

module.exports = {
    getParticipantsByEvent,
    verifyParticipantId,
    generateParticipantIds,
    recordCheckIn,
    recordCheckOut,
    resetAttendance,
    scanAttendance
};