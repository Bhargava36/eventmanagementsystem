const db = require('../../config/db');

const createTeam = (UserId, TeamId, Role, Gender, callback) => {
    const query = `INSERT INTO team_members (UserId, TeamId, Role, Gender) VALUES (?, ?, ?, ?)`;
    db.query(query, [UserId, TeamId, Role, Gender], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getAllTeams = (callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id ORDER BY t.Id DESC`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamById = (id, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id WHERE t.Id = ? LIMIT 1`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByCollege = (college, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.College) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [college], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByState = (state, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.State) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [state], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByStatement = (id, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id WHERE t.EventId = ? ORDER BY t.Id DESC`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByTech = (tech, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.Tech_Stack) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [tech], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamsCount = (callback) => {
    const query = `SELECT COUNT(*) AS teamsCount FROM teams`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result[0]);
    });
};

const getTeamCountByEvent = (EventId, callback) => {

    const query = ` SELECT COUNT(*) AS teamCount FROM teams WHERE EventId = ?`;
    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getMyTeams = (userId, callback) => {
    const query = `SELECT teams.Id AS TeamId, teams.TeamName, teams.TeamSize, teams.EventId, teams.College, teams.State, events.EventName, events.StartDate, events.EndDate, team_members.Role, event_registrations.Id AS RegistrationId, event_registrations.Status AS RegistrationStatus FROM team_members INNER JOIN teams ON team_members.TeamId = teams.Id INNER JOIN events ON teams.EventId = events.Id LEFT JOIN event_registrations ON event_registrations.TeamId = teams.Id AND event_registrations.EventId = teams.EventId WHERE team_members.UserId = ? ORDER BY events.StartDate DESC`;

    db.query(query, [userId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamInfo = (teamId, userId, callback) => {
    const query = ` SELECT tm.TeamId, tm.UserId FROM team_members tm WHERE tm.TeamId = ? AND tm.UserId = ? LIMIT 1 `;
    db.query(query, [teamId, userId], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, null);
        }

        const teamQuery = ` SELECT t.Id AS TeamId, t.TeamName, t.TeamSize, t.College, t.State, t.TeamLeadUserId, e.Id AS EventId, e.EventName, e.Description AS EventDescription, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM teams t INNER JOIN events e ON t.EventId = e.Id WHERE t.Id = ? LIMIT 1 `;
        db.query(teamQuery, [teamId], (err, result) => {
            if (err) {
                return callback(err, null);

            }
            if (result.length === 0) {
                return callback(null, null);
            }

            const memberQuery = ` SELECT tm.UserId, tm.Role, tm.Gender, tm.CreatedAt, u.UserName, u.Email, u.College, u.State FROM team_members tm INNER JOIN users u ON tm.UserId = u.Id WHERE tm.TeamId = ? ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, u.UserName `;
            db.query(memberQuery, [teamId], (err, memberResult) => {
                if (err) { 
                    return callback(err); 
                }
                callback(null, { team: result[0], members: memberResult });
            });
        });
    });
};

const getTeamsByEvent = (EventId, callback) => {
    const query = `
        SELECT 
            t.*,
            er.ParticipationMode,
            er.Status AS RegistrationStatus,
            er.Id AS RegistrationId,
            u.UserName AS LeaderName,
            u.Email AS LeaderEmail,
            (SELECT COUNT(*) FROM team_members tm WHERE tm.TeamId = t.Id) AS MemberCount
        FROM teams t
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
        LEFT JOIN users u ON t.TeamLeadUserId = u.Id
        WHERE t.EventId = ? 
        ORDER BY t.Id DESC
    `;

    db.query(query, [EventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
};

const updateTeamById = (
    id, TeamName, TeamLeadUserId, TeamSize, College, State, ProblemStatementId, Tech_Stack, EventId, callback ) => {
    const query = `UPDATE teams SET TeamName = ?, TeamLeadUserId = ?, TeamSize = ?, College = ?, State = ?, ProblemStatementId = ?, Tech_Stack = ?, EventId = ? WHERE Id = ? `;

    const values = [TeamName, TeamLeadUserId, TeamSize, College, State, ProblemStatementId, Tech_Stack, EventId, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    getTeamByCollege,
    getTeamByState,
    getTeamByStatement,
    getTeamByTech,
    getTeamsCount,
    getMyTeams,
    getTeamInfo,
    getTeamCountByEvent,
    getTeamsByEvent,
    updateTeamById
};
