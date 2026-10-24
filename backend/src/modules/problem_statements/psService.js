const db = require('../../config/db');

// ========================
// ADMIN: CRUD Themes for an Event
// ========================

const getAllThemes = (eventId, callback) => {
    const query = `
        SELECT et.*, 
               COUNT(eps.Id) AS StatementCount
        FROM event_themes et
        LEFT JOIN event_problem_statements eps ON eps.EventId = et.EventId AND LOWER(eps.Theme) = LOWER(et.ThemeName)
        WHERE et.EventId = ?
        GROUP BY et.Id
        ORDER BY et.DisplayOrder ASC, et.Id ASC
    `;
    db.query(query, [eventId], callback);
};

const createTheme = (eventId, data, callback) => {
    const { ThemeName, Description, DisplayOrder } = data;
    const query = `INSERT INTO event_themes (EventId, ThemeName, Description, DisplayOrder) VALUES (?, ?, ?, ?)`;
    db.query(query, [eventId, ThemeName, Description || '', DisplayOrder || 0], (err, result) => {
        if (err) return callback(err);
        callback(null, { id: result.insertId, message: 'Theme created successfully' });
    });
};

const updateTheme = (id, data, callback) => {
    const { ThemeName, Description, DisplayOrder } = data;
    const query = `UPDATE event_themes SET ThemeName = ?, Description = ?, DisplayOrder = ? WHERE Id = ?`;
    db.query(query, [ThemeName, Description || '', DisplayOrder || 0, id], callback);
};

const deleteTheme = (id, callback) => {
    db.query(`DELETE FROM event_themes WHERE Id = ?`, [id], callback);
};

// ========================
// ADMIN: CRUD Problem Statements for an Event
// ========================

const getAllByEvent = (eventId, callback) => {
    const query = `
        SELECT eps.*, 
               COUNT(pss.Id) AS SelectedTeams
        FROM event_problem_statements eps
        LEFT JOIN problem_statement_selections pss ON pss.ProblemStatementId = eps.Id
        WHERE eps.EventId = ?
        GROUP BY eps.Id
        ORDER BY eps.DisplayOrder ASC, eps.Id ASC
    `;
    db.query(query, [eventId], callback);
};

const createProblemStatement = (eventId, data, callback) => {
    const { ProblemCode, Title, Description, Category, Theme, MaxTeams, DisplayOrder } = data;
    const query = `
        INSERT INTO event_problem_statements (EventId, ProblemCode, Title, Description, Category, Theme, MaxTeams, DisplayOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [eventId, ProblemCode, Title, Description || null, Category || null, Theme || null, MaxTeams || 5, DisplayOrder || 0], (err, result) => {
        if (err) return callback(err);
        callback(null, { id: result.insertId, message: 'Problem statement created successfully' });
    });
};

const updateProblemStatement = (id, data, callback) => {
    const { ProblemCode, Title, Description, Category, Theme, MaxTeams, DisplayOrder } = data;
    const query = `
        UPDATE event_problem_statements 
        SET ProblemCode = ?, Title = ?, Description = ?, Category = ?, Theme = ?, MaxTeams = ?, DisplayOrder = ?
        WHERE Id = ?
    `;
    db.query(query, [ProblemCode, Title, Description || null, Category || null, Theme || null, MaxTeams || 5, DisplayOrder || 0, id], callback);
};

const deleteProblemStatement = (id, callback) => {
    db.query(`DELETE FROM event_problem_statements WHERE Id = ?`, [id], callback);
};

// ========================
// ADMIN: Publish / Unpublish Themes & Problem Statements
// ========================

const publishTheme = (eventId, published, callback) => {
    db.query(`UPDATE events SET ThemePublished = ? WHERE Id = ?`, [published ? 1 : 0, eventId], callback);
};

const publishProblemStatements = (eventId, published, callback) => {
    db.query(`UPDATE events SET ProblemStatementsPublished = ? WHERE Id = ?`, [published ? 1 : 0, eventId], callback);
};

const setSelectionDeadline = (eventId, deadline, callback) => {
    let mysqlVal = null;
    if (deadline) {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
            mysqlVal = d.toISOString().slice(0, 19).replace('T', ' ');
        }
    }
    db.query(`UPDATE events SET PSSelectionDeadline = ? WHERE Id = ?`, [mysqlVal, eventId], callback);
};

const setMaxTeamsPerStatement = (eventId, maxTeams, callback) => {
    db.query(`UPDATE events SET PSMaxTeamsPerStatement = ? WHERE Id = ?`, [maxTeams || 5, eventId], callback);
};

const getPublishStatus = (eventId, callback) => {
    db.query(
        `SELECT ThemePublished, ProblemStatementsPublished, PSSelectionDeadline, PSMaxTeamsPerStatement FROM events WHERE Id = ?`,
        [eventId],
        (err, rows) => {
            if (err) return callback(err);
            callback(null, rows[0] || {});
        }
    );
};

// ========================
// TEAM: Select a Problem Statement (Thread-Safe + Leader Verification)
// ========================

const selectProblemStatement = (eventId, teamId, problemStatementId, userId = null, userRole = null, callback = () => {}) => {
    // 1. Check if problem statements are published
    db.query(`SELECT ProblemStatementsPublished, PSSelectionDeadline FROM events WHERE Id = ?`, [eventId], (err, evRows) => {
        if (err) return callback(err);
        const ev = evRows[0];
        if (!ev || !ev.ProblemStatementsPublished) {
            return callback({ status: 400, message: 'Problem statements are not published yet.' });
        }

        // 2. Check deadline with timezone-safe UTC normalization
        if (ev.PSSelectionDeadline) {
            let deadlineMs = 0;
            if (ev.PSSelectionDeadline instanceof Date) {
                deadlineMs = ev.PSSelectionDeadline.getTime();
            } else {
                const s = String(ev.PSSelectionDeadline).trim();
                const normalized = s.includes('T') ? (s.endsWith('Z') ? s : s + 'Z') : s.replace(' ', 'T') + 'Z';
                deadlineMs = new Date(normalized).getTime();
                if (isNaN(deadlineMs)) deadlineMs = new Date(s).getTime();
            }
            if (Date.now() > deadlineMs) {
                return callback({ status: 400, message: 'Problem statement selection deadline has passed.' });
            }
        }

        // 3. Verify Team Leader authorization if userId provided and not an admin
        const proceedWithSelection = () => {
            db.getConnection((connErr, conn) => {
                if (connErr) return callback(connErr);

                conn.beginTransaction((txErr) => {
                    if (txErr) {
                        conn.release();
                        return callback(txErr);
                    }

                    // Check if statement exists, and count other teams already assigned to it with lock
                    const checkSql = `
                        SELECT eps.Id, eps.MaxTeams,
                               (SELECT COUNT(*) 
                                FROM problem_statement_selections pss 
                                WHERE pss.ProblemStatementId = eps.Id AND pss.TeamId != ?) AS CurrentOtherTeams
                        FROM event_problem_statements eps
                        WHERE eps.Id = ? AND eps.EventId = ?
                        FOR UPDATE
                    `;

                    conn.query(checkSql, [teamId, problemStatementId, eventId], (psErr, psRows) => {
                        if (psErr) {
                            return conn.rollback(() => {
                                conn.release();
                                callback(psErr);
                            });
                        }

                        if (!psRows || psRows.length === 0) {
                            return conn.rollback(() => {
                                conn.release();
                                callback({ status: 404, message: 'Problem statement not found for this event.' });
                            });
                        }

                        const ps = psRows[0];
                        if (ps.CurrentOtherTeams >= ps.MaxTeams) {
                            return conn.rollback(() => {
                                conn.release();
                                callback({ status: 400, message: `This problem statement has already reached its limit (${ps.MaxTeams} teams). Please select another.` });
                            });
                        }

                        // Upsert: Record team's selection
                        const upsertQuery = `
                            INSERT INTO problem_statement_selections (EventId, TeamId, ProblemStatementId, SelectionType)
                            VALUES (?, ?, ?, 'manual')
                            ON DUPLICATE KEY UPDATE ProblemStatementId = VALUES(ProblemStatementId), SelectionType = 'manual', SelectedAt = CURRENT_TIMESTAMP
                        `;

                        conn.query(upsertQuery, [eventId, teamId, problemStatementId], (insErr) => {
                            if (insErr) {
                                return conn.rollback(() => {
                                    conn.release();
                                    callback(insErr);
                                });
                            }

                            conn.commit((commitErr) => {
                                conn.release();
                                if (commitErr) return callback(commitErr);
                                callback(null, { message: 'Problem statement selected and locked in successfully.' });
                            });
                        });
                    });
                });
            });
        };

        const checkExistingSelectionThenProceed = () => {
            if (userRole === 'admin') {
                return proceedWithSelection();
            }
            db.query(
                `SELECT Id, ProblemStatementId FROM problem_statement_selections WHERE EventId = ? AND TeamId = ?`,
                [eventId, teamId],
                (selErr, selRows) => {
                    if (selErr) return callback(selErr);
                    if (selRows && selRows.length > 0) {
                        return callback({
                            status: 400,
                            message: 'A problem statement has already been selected and locked. Only an event admin can modify or reassign your selection.'
                        });
                    }
                    proceedWithSelection();
                }
            );
        };

        if (userId && userRole !== 'admin') {
            db.query(
                `SELECT Id, TeamLeadUserId FROM registered_teams WHERE Id = ? AND EventId = ?`,
                [teamId, eventId],
                (teamErr, teamRows) => {
                    if (teamErr) return callback(teamErr);
                    if (teamRows && teamRows.length > 0) {
                        const team = teamRows[0];
                        if (team.TeamLeadUserId && String(team.TeamLeadUserId) !== String(userId)) {
                            return callback({ status: 403, message: 'Only the Team Leader or registered participant can choose the problem statement.' });
                        }
                    }
                    checkExistingSelectionThenProceed();
                }
            );
        } else {
            checkExistingSelectionThenProceed();
        }
    });
};

// ========================
// GET: Selections with Team & PS details
// ========================

const getSelectionsByEvent = (eventId, callback) => {
    const query = `
        SELECT 
            pss.Id, pss.TeamId, pss.ProblemStatementId, pss.SelectionType, pss.SelectedAt,
            t.TeamName, t.College, t.TeamSize,
            eps.ProblemCode, eps.Title AS ProblemTitle, eps.Category, eps.MaxTeams,
            hps.GithubRepoUrl, hps.LiveDemoUrl, hps.DrivePptUrl, hps.TechStack,
            hps.Description AS ProjectDescription, hps.SubmittedAt AS ProjectSubmittedAt
        FROM problem_statement_selections pss
        INNER JOIN registered_teams t ON t.Id = pss.TeamId
        INNER JOIN event_problem_statements eps ON eps.Id = pss.ProblemStatementId
        LEFT JOIN hackathon_project_submissions hps ON hps.EventId = pss.EventId AND hps.TeamId = pss.TeamId
        WHERE pss.EventId = ?
        ORDER BY eps.DisplayOrder ASC, pss.SelectedAt ASC
    `;
    db.query(query, [eventId], callback);
};

// ========================
// TEAM: Get specific team's selection
// ========================

const getTeamSelection = (eventId, teamId, callback) => {
    const query = `
        SELECT 
            pss.Id, pss.TeamId, pss.ProblemStatementId, pss.SelectionType, pss.SelectedAt,
            eps.ProblemCode, eps.Title AS ProblemTitle, eps.Description, eps.Category, eps.Theme, eps.MaxTeams
        FROM problem_statement_selections pss
        INNER JOIN event_problem_statements eps ON eps.Id = pss.ProblemStatementId
        WHERE pss.EventId = ? AND pss.TeamId = ?
    `;
    db.query(query, [eventId, teamId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0] || null);
    });
};

// ========================
// ADMIN: Auto-assign remaining teams
// ========================

const autoAssignRemainingTeams = (eventId, callback) => {
    // 1. Get all teams for this event that haven't selected a PS yet
    const unselectedTeamsQuery = `
        SELECT t.Id AS TeamId, t.TeamName
        FROM registered_teams t
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
        WHERE t.EventId = ? 
          AND (er.ParticipationMode IS NULL OR LOWER(er.ParticipationMode) = 'virtual' OR LOWER(er.ParticipationMode) = 'both')
          AND t.Id NOT IN (SELECT pss.TeamId FROM problem_statement_selections pss WHERE pss.EventId = ?)
    `;

    db.query(unselectedTeamsQuery, [eventId, eventId], (err, unselectedTeams) => {
        if (err) return callback(err);
        if (!unselectedTeams || unselectedTeams.length === 0) {
            return callback(null, { message: 'All teams have already selected a problem statement.', assigned: 0 });
        }

        // 2. Get all PS with remaining capacity
        const psQuery = `
            SELECT eps.Id, eps.MaxTeams, COUNT(pss.Id) AS CurrentCount
            FROM event_problem_statements eps
            LEFT JOIN problem_statement_selections pss ON pss.ProblemStatementId = eps.Id
            WHERE eps.EventId = ?
            GROUP BY eps.Id
            HAVING CurrentCount < eps.MaxTeams
            ORDER BY CurrentCount ASC, eps.DisplayOrder ASC
        `;

        db.query(psQuery, [eventId], (err2, availablePS) => {
            if (err2) return callback(err2);
            if (!availablePS || availablePS.length === 0) {
                return callback(null, { message: 'No problem statements have remaining capacity.', assigned: 0 });
            }

            // Round-robin assign
            let psIndex = 0;
            let assignedCount = 0;
            const currentCounts = availablePS.map(ps => ps.CurrentCount);
            const insertValues = [];

            for (const team of unselectedTeams) {
                // Find next PS with capacity
                let found = false;
                for (let i = 0; i < availablePS.length; i++) {
                    const idx = (psIndex + i) % availablePS.length;
                    if (currentCounts[idx] < availablePS[idx].MaxTeams) {
                        insertValues.push([eventId, team.TeamId, availablePS[idx].Id, 'auto']);
                        currentCounts[idx]++;
                        psIndex = (idx + 1) % availablePS.length;
                        assignedCount++;
                        found = true;
                        break;
                    }
                }
                if (!found) break; // No more room
            }

            if (insertValues.length === 0) {
                return callback(null, { message: 'No remaining capacity for auto-assignment.', assigned: 0 });
            }

            const bulkInsertQuery = `
                INSERT INTO problem_statement_selections (EventId, TeamId, ProblemStatementId, SelectionType)
                VALUES ?
                ON DUPLICATE KEY UPDATE ProblemStatementId = VALUES(ProblemStatementId), SelectionType = 'auto', SelectedAt = CURRENT_TIMESTAMP
            `;
            db.query(bulkInsertQuery, [insertValues], (err3) => {
                if (err3) return callback(err3);
                callback(null, { message: `Auto-assigned ${assignedCount} teams to problem statements.`, assigned: assignedCount });
            });
        });
    });
};

// ========================
// ADMIN: Reassign a team's selection
// ========================

const reassignTeamSelection = (selectionId, newProblemStatementId, callback) => {
    const query = `
        UPDATE problem_statement_selections 
        SET ProblemStatementId = ?, SelectionType = 'admin_reassigned', SelectedAt = CURRENT_TIMESTAMP
        WHERE Id = ?
    `;
    db.query(query, [newProblemStatementId, selectionId], (err, result) => {
        if (err) return callback(err);
        db.query(`SELECT EventId, TeamId, ProblemStatementId FROM problem_statement_selections WHERE Id = ?`, [selectionId], (err2, rows) => {
            if (err2 || !rows || rows.length === 0) return callback(null, { message: 'Reassigned successfully' });
            callback(null, { message: 'Problem statement reassigned successfully', selection: rows[0] });
        });
    });
};

// ========================
// ADMIN: Remove a team's selection
// ========================

const removeSelection = (selectionId, callback) => {
    db.query(`DELETE FROM problem_statement_selections WHERE Id = ?`, [selectionId], callback);
};

module.exports = {
    getAllThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    getAllByEvent,
    createProblemStatement,
    updateProblemStatement,
    deleteProblemStatement,
    publishTheme,
    publishProblemStatements,
    setSelectionDeadline,
    setMaxTeamsPerStatement,
    getPublishStatus,
    selectProblemStatement,
    getTeamSelection,
    getSelectionsByEvent,
    autoAssignRemainingTeams,
    removeSelection,
    reassignTeamSelection
};
