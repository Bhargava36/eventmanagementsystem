const db = require("../../config/db");

const getParticipantsByEvent = (EventId, callback) => {
    const query = ` SELECT u.Id AS UserId, u.UserName AS ParticipantName, u.Email, t.Id AS TeamId, t.TeamName, t.College, c.IdCardNumber, CASE WHEN c.Id IS NULL THEN 0 ELSE 1 END AS IdCardGenerated FROM event_registrations er INNER JOIN registered_teams t ON t.Id = er.TeamId INNER JOIN registered_team_members tm ON tm.TeamId = t.Id INNER JOIN users u ON u.Id = tm.UserId LEFT JOIN participant_id_cards c ON c.EventId = er.EventId AND c.UserId = u.Id WHERE er.EventId = ? AND er.ParticipationMode = 'Physical' AND er.Status = 'approved' ORDER BY t.TeamName, u.UserName`;
    db.query(query, [EventId], (err, result) => {
        if (err) {
            console.error("Get participants error:", err);
            return callback(err, null);
        }
        callback(null, result);
    });
};

const verifyParticipantId = (EventId, UserId, IdCardNumber, callback) => {
    const query = ` SELECT c.IdCardNumber, u.UserName AS ParticipantName, t.TeamName, t.College, e.EventName, e.StartDate, e.Location FROM participant_id_cards c INNER JOIN events e ON e.Id = c.EventId INNER JOIN users u ON u.Id = c.UserId INNER JOIN event_registrations er ON er.EventId = c.EventId AND er.Status = 'approved' AND er.ParticipationMode = 'Physical' INNER JOIN registered_teams t ON t.Id = er.TeamId INNER JOIN registered_team_members tm ON tm.TeamId = t.Id AND tm.UserId = c.UserId WHERE c.EventId = ? AND c.UserId = ? AND c.IdCardNumber = ? LIMIT 1`;
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
        }
    );
};

module.exports = {
    getParticipantsByEvent,
    verifyParticipantId,
    generateParticipantIds
};