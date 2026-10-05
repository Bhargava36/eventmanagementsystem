const db = require('../../config/db');

const createTeam = (TeamName, TeamLeadEmail, TeamSize, EventId, MemberEmails, callback) => {
    if (!TeamName || !TeamLeadEmail || !TeamSize || !EventId) {
        const err = new Error('TeamName, TeamLeadEmail, TeamSize, and EventId are required');
        err.status = 400;
        return callback(err, null);
    }

    const leadEmailClean = String(TeamLeadEmail).trim().toLowerCase();
    const rawMembers = Array.isArray(MemberEmails) ? MemberEmails : [];
    const memberEmailsClean = rawMembers
        .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
        .filter(Boolean);

    // Check duplicate emails in the form submission
    const allEmails = [leadEmailClean, ...memberEmailsClean];
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
        const err = new Error('Duplicate emails detected. Each team member (including Team Lead) must have a unique registered email.');
        err.status = 400;
        return callback(err, null);
    }

    // 1. Fetch Team Lead User
    const leadQuery = `SELECT Id, UserName, Email, College, State, Gender FROM users WHERE LOWER(Email) = ? LIMIT 1`;
    db.query(leadQuery, [leadEmailClean], (err, leadRows) => {
        if (err) return callback(err, null);
        if (!leadRows || leadRows.length === 0) {
            const errNotFound = new Error(`Team Lead email "${TeamLeadEmail}" is not registered in EMS.`);
            errNotFound.status = 404;
            return callback(errNotFound, null);
        }

        const leader = leadRows[0];

        // 2. Check if Team Lead is ALREADY registered in this Event
        const checkLeadRegQuery = `
            SELECT t.TeamName, u.Email, u.UserName
            FROM registered_team_members tm
            INNER JOIN registered_teams t ON tm.TeamId = t.Id
            INNER JOIN users u ON tm.UserId = u.Id
            WHERE t.EventId = ? AND tm.UserId = ?
            LIMIT 1
        `;
        db.query(checkLeadRegQuery, [EventId, leader.Id], (err, existingLeadReg) => {
            if (err) return callback(err, null);
            if (existingLeadReg && existingLeadReg.length > 0) {
                const errAlready = new Error(
                    `Team Lead (${leader.Email}) is already registered for this event in team "${existingLeadReg[0].TeamName}". A participant can only register once per event.`
                );
                errAlready.status = 400;
                return callback(errAlready, null);
            }

            // 3. If there are team members, check them
            const proceedWithMembers = (membersList) => {
                // Check if any member is ALREADY registered in this Event
                if (membersList.length > 0) {
                    const memberUserIds = membersList.map((m) => m.Id);
                    const checkMemberRegQuery = `
                        SELECT t.TeamName, u.Email, u.UserName
                        FROM registered_team_members tm
                        INNER JOIN registered_teams t ON tm.TeamId = t.Id
                        INNER JOIN users u ON tm.UserId = u.Id
                        WHERE t.EventId = ? AND tm.UserId IN (?)
                        LIMIT 1
                    `;
                    db.query(checkMemberRegQuery, [EventId, memberUserIds], (err, existingMemberReg) => {
                        if (err) return callback(err, null);
                        if (existingMemberReg && existingMemberReg.length > 0) {
                            const errMemAlready = new Error(
                                `Team member (${existingMemberReg[0].Email}) is already registered for this event in team "${existingMemberReg[0].TeamName}". A participant can only register once per event.`
                            );
                            errMemAlready.status = 400;
                            return callback(errMemAlready, null);
                        }

                        insertTeamAndMembers(leader, membersList);
                    });
                } else {
                    insertTeamAndMembers(leader, []);
                }
            };

            const insertTeamAndMembers = (leader, membersList) => {
                const insertTeamSql = `
                    INSERT INTO registered_teams (TeamName, TeamLeadUserId, TeamSize, College, State, EventId)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                const teamValues = [
                    TeamName,
                    leader.Id,
                    Number(TeamSize),
                    leader.College || '',
                    leader.State || '',
                    Number(EventId)
                ];

                db.query(insertTeamSql, teamValues, (err, teamResult) => {
                    if (err) return callback(err, null);
                    const newTeamId = teamResult.insertId;

                    // Insert Team Lead into registered_team_members
                    const memberInserts = [
                        [leader.Id, newTeamId, 'TeamLead', leader.Gender || 'Male']
                    ];

                    // Insert other members into registered_team_members
                    for (const m of membersList) {
                        memberInserts.push([m.Id, newTeamId, 'TeamMember', m.Gender || 'Male']);
                    }

                    const insertMembersSql = `
                        INSERT INTO registered_team_members (UserId, TeamId, Role, Gender)
                        VALUES ?
                    `;
                    db.query(insertMembersSql, [memberInserts], (err) => {
                        if (err) return callback(err, null);
                        return callback(null, { teamId: newTeamId });
                    });
                });
            };

            if (memberEmailsClean.length > 0) {
                const membersQuery = `SELECT Id, UserName, Email, College, State, Gender FROM users WHERE LOWER(Email) IN (?)`;
                db.query(membersQuery, [memberEmailsClean], (err, memberRows) => {
                    if (err) return callback(err, null);
                    const foundRows = memberRows || [];
                    const foundEmails = new Set(foundRows.map((r) => r.Email.toLowerCase()));
                    const missingEmails = memberEmailsClean.filter((e) => !foundEmails.has(e));

                    if (missingEmails.length > 0) {
                        const errMissing = new Error(
                            `Team member email(s) not registered in EMS: ${missingEmails.join(', ')}. All members must have an active EMS account.`
                        );
                        errMissing.status = 404;
                        return callback(errMissing, null);
                    }

                    proceedWithMembers(foundRows);
                });
            } else {
                proceedWithMembers([]);
            }
        });
    });
};

const getAllTeams = (callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.Status FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id ORDER BY t.Id DESC`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamById = (id, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, t.CreatedAt, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus, er.ParticipationMode, er.Status AS RegistrationStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId WHERE t.Id = ? LIMIT 1`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, []);
        }

        const memberQuery = `SELECT tm.UserId, tm.Role, tm.Gender, tm.CreatedAt, u.UserName, u.Email, u.College, u.State FROM registered_team_members tm INNER JOIN users u ON tm.UserId = u.Id WHERE tm.TeamId = ? ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, u.UserName`;
        db.query(memberQuery, [id], (mErr, memberResult) => {
            if (mErr) {
                return callback(null, result);
            }
            const teamData = { ...result[0], members: memberResult };
            return callback(null, [teamData]);
        });
    });
};

const getTeamByCollege = (college, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.College) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [college], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByState = (state, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.State) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [state], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByStatement = (id, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id WHERE t.EventId = ? ORDER BY t.Id DESC`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamByTech = (tech, callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id WHERE LOWER(t.Tech_Stack) = LOWER(?) ORDER BY t.Id DESC`;
    db.query(query, [tech], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamsCount = (callback) => {
    const query = `SELECT COUNT(*) AS teamsCount FROM registered_teams`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result[0]);
    });
};

const getTeamCountByEvent = (EventId, callback) => {
    const query = ` SELECT COUNT(*) AS teamCount FROM registered_teams WHERE EventId = ?`;
    db.query(query, [EventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getMyTeams = (userId, callback) => {
    const query = `SELECT registered_teams.Id AS TeamId, registered_teams.TeamName, registered_teams.TeamSize, registered_teams.EventId, registered_teams.College, registered_teams.State, events.EventName, events.StartDate, events.EndDate, registered_team_members.Role, event_registrations.Id AS RegistrationId, event_registrations.Status AS RegistrationStatus, event_registrations.ParticipationMode FROM registered_team_members INNER JOIN registered_teams ON registered_team_members.TeamId = registered_teams.Id INNER JOIN events ON registered_teams.EventId = events.Id LEFT JOIN event_registrations ON event_registrations.TeamId = registered_teams.Id AND event_registrations.EventId = registered_teams.EventId WHERE registered_team_members.UserId = ? ORDER BY events.StartDate DESC`;

    db.query(query, [userId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamInfo = (teamId, userId, callback) => {
    const query = ` SELECT tm.TeamId, tm.UserId FROM registered_team_members tm WHERE tm.TeamId = ? AND tm.UserId = ? LIMIT 1 `;
    db.query(query, [teamId, userId], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, null);
        }

        const teamQuery = ` SELECT t.Id AS TeamId, t.TeamName, t.TeamSize, t.College, t.State, t.TeamLeadUserId, e.Id AS EventId, e.EventName, e.Description AS EventDescription, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t INNER JOIN events e ON t.EventId = e.Id WHERE t.Id = ? LIMIT 1 `;
        db.query(teamQuery, [teamId], (err, result) => {
            if (err) {
                return callback(err, null);

            }
            if (result.length === 0) {
                return callback(null, null);
            }

            const memberQuery = ` SELECT tm.UserId, tm.Role, tm.Gender, tm.CreatedAt, u.UserName, u.Email, u.College, u.State FROM registered_team_members tm INNER JOIN users u ON tm.UserId = u.Id WHERE tm.TeamId = ? ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, u.UserName `;
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
            (SELECT COUNT(*) FROM registered_team_members tm WHERE tm.TeamId = t.Id) AS MemberCount
        FROM registered_teams t
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
    const query = `UPDATE registered_teams SET TeamName = ?, TeamLeadUserId = ?, TeamSize = ?, College = ?, State = ?, ProblemStatementId = ?, Tech_Stack = ?, EventId = ? WHERE Id = ? `;

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
