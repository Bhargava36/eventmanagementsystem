const db = require('../../config/db');
const bcrypt = require('bcrypt');

const getEvaluatorsByEvent = (eventId, track, callback) => {
    let query = `
        SELECT Id, EventId, Name, Email, Username, PlainTextPassword, Track, College, Role, Status, CreatedAt, UpdatedAt 
        FROM evaluators 
        WHERE EventId = ?
    `;
    const params = [eventId];

    if (track) {
        query += ` AND Track = ?`;
        params.push(track);
    }

    query += ` ORDER BY CreatedAt DESC`;

    db.query(query, params, (err, rows) => {
        if (err) return callback(err, null);

        // Compute summary counts
        const total = rows.length;
        const active = rows.filter(r => r.Status === 'Active').length;
        const inactive = rows.filter(r => r.Status === 'Inactive').length;

        callback(null, {
            evaluators: rows,
            stats: { total, active, inactive }
        });
    });
};

const createEvaluator = async (data, callback) => {
    const { EventId, Name, Email, Username, Password, Track, College, Role } = data;

    if (!EventId || !Name || !Email || !Password) {
        const error = new Error('EventId, Name, Email and Password are required');
        error.status = 400;
        return callback(error, null);
    }

    const cleanUsername = (Username || Email).trim();
    const cleanTrack = Track === 'Virtual' ? 'Virtual' : 'Physical';

    // Check if evaluator already exists for this event and track with same email or username
    const checkSql = `SELECT Id FROM evaluators WHERE EventId = ? AND Track = ? AND (LOWER(Email) = LOWER(?) OR LOWER(Username) = LOWER(?)) LIMIT 1`;
    db.query(checkSql, [EventId, cleanTrack, Email.trim(), cleanUsername], async (chkErr, existing) => {
        if (chkErr) return callback(chkErr, null);
        if (existing && existing.length > 0) {
            const error = new Error('An evaluator with this email or username already exists for this event.');
            error.status = 400;
            return callback(error, null);
        }

        try {
            const hashedPassword = await bcrypt.hash(Password, 10);
            const insertSql = `
                INSERT INTO evaluators 
                (EventId, Name, Email, Username, Password, PlainTextPassword, Track, College, Role, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
            `;
            const params = [
                EventId,
                Name.trim(),
                Email.trim(),
                cleanUsername,
                hashedPassword,
                Password, // saved for easy admin sharing/display
                cleanTrack,
                College ? College.trim() : null,
                Role ? Role.trim() : 'Technical Evaluator'
            ];

            db.query(insertSql, params, (insErr, result) => {
                if (insErr) return callback(insErr, null);
                callback(null, {
                    id: result.insertId,
                    EventId,
                    Name: Name.trim(),
                    Email: Email.trim(),
                    Username: cleanUsername,
                    PlainTextPassword: Password,
                    Track: cleanTrack,
                    College: College ? College.trim() : null,
                    Role: Role ? Role.trim() : 'Technical Evaluator',
                    Status: 'Active'
                });
            });
        } catch (hashErr) {
            callback(hashErr, null);
        }
    });
};

const updateEvaluator = async (id, data, callback) => {
    const { Name, Email, Username, Password, Track, College, Role, Status } = data;

    let updateFields = [];
    let params = [];

    if (Name !== undefined) { updateFields.push('Name = ?'); params.push(Name.trim()); }
    if (Email !== undefined) { updateFields.push('Email = ?'); params.push(Email.trim()); }
    if (Username !== undefined) { updateFields.push('Username = ?'); params.push(Username.trim()); }
    if (Track !== undefined) { updateFields.push('Track = ?'); params.push(Track); }
    if (College !== undefined) { updateFields.push('College = ?'); params.push(College ? College.trim() : null); }
    if (Role !== undefined) { updateFields.push('Role = ?'); params.push(Role ? Role.trim() : 'Technical Evaluator'); }
    if (Status !== undefined) { updateFields.push('Status = ?'); params.push(Status); }

    if (Password) {
        try {
            const hashedPassword = await bcrypt.hash(Password, 10);
            updateFields.push('Password = ?'); params.push(hashedPassword);
            updateFields.push('PlainTextPassword = ?'); params.push(Password);
        } catch (hErr) {
            return callback(hErr, null);
        }
    }

    if (updateFields.length === 0) {
        return callback(null, { message: 'No fields to update' });
    }

    params.push(id);
    const sql = `UPDATE evaluators SET ${updateFields.join(', ')} WHERE Id = ?`;

    db.query(sql, params, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const deleteEvaluator = (id, callback) => {
    const sql = `DELETE FROM evaluators WHERE Id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

// ── ROUNDS & QUESTIONS SERVICES ──

const getEvaluationRounds = (eventId, track, callback) => {
    let roundQuery = `
        SELECT Id, EventId, Track, RoundOrder, RoundName, Description, Status, IsPublished, PublishedAt, CreatedAt, IsOpen, AllowScoreEdit 
        FROM evaluation_rounds 
        WHERE EventId = ?
    `;
    const params = [eventId];

    if (track) {
        roundQuery += ` AND Track = ?`;
        params.push(track);
    }

    roundQuery += ` ORDER BY Track ASC, RoundOrder ASC, Id ASC`;

    db.query(roundQuery, params, (err, rounds) => {
        if (err) return callback(err, null);
        if (rounds.length === 0) return callback(null, []);

        const roundIds = rounds.map(r => r.Id);
        const questionQuery = `
            SELECT Id, RoundId, QuestionText, MaxMarks, Description, QuestionOrder, CreatedAt 
            FROM evaluation_questions 
            WHERE RoundId IN (?)
            ORDER BY QuestionOrder ASC, Id ASC
        `;

        db.query(questionQuery, [roundIds], (qErr, questions) => {
            if (qErr) return callback(qErr, null);

            // Group questions by round
            const questionsByRound = {};
            questions.forEach(q => {
                if (!questionsByRound[q.RoundId]) {
                    questionsByRound[q.RoundId] = [];
                }
                questionsByRound[q.RoundId].push(q);
            });

            // Attach questions and compute totalMaxMarks
            const result = rounds.map(r => {
                const roundQuestions = questionsByRound[r.Id] || [];
                const totalMaxMarks = roundQuestions.reduce((sum, q) => sum + Number(q.MaxMarks || 0), 0);
                return {
                    ...r,
                    questions: roundQuestions,
                    totalMaxMarks
                };
            });

            callback(null, result);
        });
    });
};

const createEvaluationRound = (data, callback) => {
    const { EventId, Track, RoundName, Description, RoundOrder } = data;

    if (!EventId || !RoundName) {
        const error = new Error('EventId and RoundName are required');
        error.status = 400;
        return callback(error, null);
    }

    const cleanTrack = Track === 'Virtual' ? 'Virtual' : 'Physical';

    // If RoundOrder not provided, find max order + 1
    const orderSql = `SELECT COALESCE(MAX(RoundOrder), 0) + 1 AS nextOrder FROM evaluation_rounds WHERE EventId = ? AND Track = ?`;
    db.query(orderSql, [EventId, cleanTrack], (ordErr, ordRows) => {
        if (ordErr) return callback(ordErr, null);

        const order = RoundOrder !== undefined && RoundOrder !== null ? Number(RoundOrder) : (ordRows[0]?.nextOrder || 1);

        const insertSql = `
            INSERT INTO evaluation_rounds (EventId, Track, RoundOrder, RoundName, Description, Status)
            VALUES (?, ?, ?, ?, ?, 'Active')
        `;

        db.query(insertSql, [EventId, cleanTrack, order, RoundName.trim(), Description ? Description.trim() : null], (insErr, result) => {
            if (insErr) return callback(insErr, null);
            callback(null, {
                Id: result.insertId,
                EventId,
                Track: cleanTrack,
                RoundOrder: order,
                RoundName: RoundName.trim(),
                Description: Description ? Description.trim() : null,
                Status: 'Active',
                questions: [],
                totalMaxMarks: 0
            });
        });
    });
};

const updateEvaluationRound = (id, data, callback) => {
    const { RoundName, Description, Status, RoundOrder, IsOpen, AllowScoreEdit } = data;
    let updateFields = [];
    let params = [];

    if (RoundName !== undefined) { updateFields.push('RoundName = ?'); params.push(RoundName.trim()); }
    if (Description !== undefined) { updateFields.push('Description = ?'); params.push(Description ? Description.trim() : null); }
    if (Status !== undefined) { updateFields.push('Status = ?'); params.push(Status); }
    if (RoundOrder !== undefined) { updateFields.push('RoundOrder = ?'); params.push(Number(RoundOrder)); }
    if (IsOpen !== undefined) {
        const openVal = (IsOpen === 1 || IsOpen === true || IsOpen === '1') ? 1 : 0;
        updateFields.push('IsOpen = ?');
        params.push(openVal);
        if (Status === undefined) {
            updateFields.push('Status = ?');
            params.push(openVal ? 'Active' : 'Completed');
        }
    }
    if (AllowScoreEdit !== undefined) {
        const editVal = (AllowScoreEdit === 1 || AllowScoreEdit === true || AllowScoreEdit === '1') ? 1 : 0;
        updateFields.push('AllowScoreEdit = ?');
        params.push(editVal);
    }

    if (updateFields.length === 0) return callback(null, { message: 'No fields to update' });

    params.push(id);
    const sql = `UPDATE evaluation_rounds SET ${updateFields.join(', ')} WHERE Id = ?`;

    db.query(sql, params, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const deleteEvaluationRound = (id, callback) => {
    const sql = `DELETE FROM evaluation_rounds WHERE Id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const createEvaluationQuestion = (roundId, data, callback) => {
    const { QuestionText, MaxMarks, Description, QuestionOrder } = data;

    if (!QuestionText) {
        const error = new Error('QuestionText is required');
        error.status = 400;
        return callback(error, null);
    }

    const marks = Number(MaxMarks) > 0 ? Number(MaxMarks) : 10;

    const orderSql = `SELECT COALESCE(MAX(QuestionOrder), 0) + 1 AS nextOrder FROM evaluation_questions WHERE RoundId = ?`;
    db.query(orderSql, [roundId], (ordErr, ordRows) => {
        if (ordErr) return callback(ordErr, null);

        const order = QuestionOrder !== undefined && QuestionOrder !== null ? Number(QuestionOrder) : (ordRows[0]?.nextOrder || 1);

        const sql = `
            INSERT INTO evaluation_questions (RoundId, QuestionText, MaxMarks, Description, QuestionOrder)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [roundId, QuestionText.trim(), marks, Description ? Description.trim() : null, order], (err, result) => {
            if (err) return callback(err, null);
            callback(null, {
                Id: result.insertId,
                RoundId: Number(roundId),
                QuestionText: QuestionText.trim(),
                MaxMarks: marks,
                Description: Description ? Description.trim() : null,
                QuestionOrder: order
            });
        });
    });
};

const updateEvaluationQuestion = (id, data, callback) => {
    const { QuestionText, MaxMarks, Description, QuestionOrder } = data;
    let updateFields = [];
    let params = [];

    if (QuestionText !== undefined) { updateFields.push('QuestionText = ?'); params.push(QuestionText.trim()); }
    if (MaxMarks !== undefined) { updateFields.push('MaxMarks = ?'); params.push(Number(MaxMarks)); }
    if (Description !== undefined) { updateFields.push('Description = ?'); params.push(Description ? Description.trim() : null); }
    if (QuestionOrder !== undefined) { updateFields.push('QuestionOrder = ?'); params.push(Number(QuestionOrder)); }

    if (updateFields.length === 0) return callback(null, { message: 'No fields to update' });

    params.push(id);
    const sql = `UPDATE evaluation_questions SET ${updateFields.join(', ')} WHERE Id = ?`;

    db.query(sql, params, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const deleteEvaluationQuestion = (id, callback) => {
    const sql = `DELETE FROM evaluation_questions WHERE Id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const evaluatorLogin = (username, password, callback) => {
    const cleanUsername = username.trim();
    const sql = `
        SELECT e.*, ev.EventName 
        FROM evaluators e 
        INNER JOIN events ev ON e.EventId = ev.Id 
        WHERE (LOWER(e.Username) = LOWER(?) OR LOWER(e.Email) = LOWER(?)) 
          AND e.Status = 'Active' 
        LIMIT 1
    `;

    db.query(sql, [cleanUsername, cleanUsername], async (err, rows) => {
        if (err) return callback(err, null);
        if (!rows || rows.length === 0) {
            const error = new Error('Invalid evaluator credentials or account is inactive');
            error.status = 401;
            return callback(error, null);
        }

        const evaluator = rows[0];
        const isMatch = await bcrypt.compare(password, evaluator.Password);

        if (!isMatch) {
            const error = new Error('Invalid evaluator credentials');
            error.status = 401;
            return callback(error, null);
        }

        delete evaluator.Password;
        delete evaluator.PlainTextPassword;
        callback(null, evaluator);
    });
};

const getTeamsForEvaluation = (eventId, track, callback) => {
    let sql = `
        SELECT 
            t.Id, 
            t.TeamName, 
            t.TeamSize, 
            t.College, 
            t.State, 
            t.EventId,
            COALESCE(er.ParticipationMode, 'Physical') AS ParticipationMode,
            COALESCE(er.Status, 'approved') AS RegistrationStatus,
            u.UserName AS TeamLeadName,
            u.Email AS TeamLeadEmail,
            ps.ProblemStatement AS ProblemStatementTitle,
            ps.ProblemCode
        FROM registered_teams t
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
        LEFT JOIN users u ON t.TeamLeadUserId = u.Id
        LEFT JOIN problem_statements ps ON COALESCE(er.ProblemStatementId, t.ProblemStatementId) = ps.Id
        WHERE t.EventId = ?
    `;
    const params = [eventId];

    if (track) {
        sql += ` AND (er.ParticipationMode = ? OR er.ParticipationMode IS NULL)`;
        params.push(track);
    }

    sql += ` ORDER BY t.Id ASC`;

    db.query(sql, params, (err, rows) => {
        if (err) return callback(err, null);
        callback(null, rows);
    });
};

const getScoresForRound = (roundId, evaluatorId, callback) => {
    let sql = `
        SELECT es.*, t.TeamName, e.Name AS EvaluatorName
        FROM evaluation_scores es
        INNER JOIN registered_teams t ON es.TeamId = t.Id
        INNER JOIN evaluators e ON es.EvaluatorId = e.Id
        WHERE es.RoundId = ?
    `;
    const params = [roundId];

    if (evaluatorId) {
        sql += ` AND es.EvaluatorId = ?`;
        params.push(evaluatorId);
    }

    db.query(sql, params, (err, rows) => {
        if (err) return callback(err, null);
        callback(null, rows);
    });
};

const saveEvaluationScore = (data, callback) => {
    const EventId = data.EventId || data.eventId;
    const Track = data.Track || data.track;
    const RoundId = data.RoundId || data.roundId;
    const TeamId = data.TeamId || data.teamId;
    const EvaluatorId = data.EvaluatorId || data.evaluatorId;
    const ScoresData = data.ScoresData || data.scoresData || data.criterionScores;
    const TotalScore = data.TotalScore !== undefined ? data.TotalScore : data.totalScore;
    const MaxPossibleScore = data.MaxPossibleScore !== undefined ? data.MaxPossibleScore : data.maxPossibleScore;
    const Feedback = data.Feedback !== undefined ? data.Feedback : data.feedback;
    const Status = data.Status || data.status;

    if (!RoundId || !TeamId || !EvaluatorId) {
        const error = new Error('RoundId, TeamId, and EvaluatorId are required');
        error.status = 400;
        return callback(error, null);
    }

    // 1. Verify round exists and check IsOpen & AllowScoreEdit
    const checkRoundSql = `SELECT Id, EventId, Track, IsOpen, Status, AllowScoreEdit FROM evaluation_rounds WHERE Id = ? LIMIT 1`;
    db.query(checkRoundSql, [RoundId], (rErr, roundRows) => {
        if (rErr) return callback(rErr, null);
        if (!roundRows || roundRows.length === 0) {
            const notFound = new Error('Evaluation round not found');
            notFound.status = 404;
            return callback(notFound, null);
        }

        const round = roundRows[0];
        const resolvedEventId = EventId || round.EventId;
        const resolvedTrack = Track || round.Track || 'Physical';

        // Check if round is open (IsOpen must be 1, or if null, Status must be Active)
        const isRoundOpen = round.IsOpen !== 0 && (round.IsOpen === 1 || round.Status === 'Active');
        if (!isRoundOpen) {
            const closedErr = new Error('This round has been closed by event admin. Scores cannot be submitted or changed.');
            closedErr.status = 403;
            return callback(closedErr, null);
        }

        // 2. Check if this evaluator has already submitted scores for this team in this round
        const checkScoreSql = `SELECT Id FROM evaluation_scores WHERE RoundId = ? AND TeamId = ? AND EvaluatorId = ? LIMIT 1`;
        db.query(checkScoreSql, [RoundId, TeamId, EvaluatorId], (sErr, scoreRows) => {
            if (sErr) return callback(sErr, null);

            const scoreExists = scoreRows && scoreRows.length > 0;
            const allowEdit = round.AllowScoreEdit === 1;

            if (scoreExists && !allowEdit) {
                const lockedErr = new Error('Score editing is locked by admin for this round. Evaluators do not have permission to edit submitted scores.');
                lockedErr.status = 403;
                return callback(lockedErr, null);
            }

            // 3. Save / Update evaluation score
            const jsonScores = typeof ScoresData === 'string' ? ScoresData : JSON.stringify(ScoresData || []);
            const numTotal = Number(TotalScore) || 0;
            const numMax = Number(MaxPossibleScore) || 0;
            const cleanFeedback = Feedback ? Feedback.trim() : null;
            const scoreStatus = Status || 'Submitted';

            const sql = `
                INSERT INTO evaluation_scores 
                    (EventId, Track, RoundId, TeamId, EvaluatorId, ScoresData, TotalScore, MaxPossibleScore, Feedback, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    ScoresData = VALUES(ScoresData),
                    TotalScore = VALUES(TotalScore),
                    MaxPossibleScore = VALUES(MaxPossibleScore),
                    Feedback = VALUES(Feedback),
                    Status = VALUES(Status),
                    UpdatedAt = CURRENT_TIMESTAMP
            `;

            const values = [
                resolvedEventId,
                resolvedTrack,
                RoundId,
                TeamId,
                EvaluatorId,
                jsonScores,
                numTotal,
                numMax,
                cleanFeedback,
                scoreStatus
            ];

            db.query(sql, values, (insErr, result) => {
                if (insErr) return callback(insErr, null);
                callback(null, {
                    id: result.insertId || (scoreRows[0]?.Id) || null,
                    message: scoreExists ? 'Score updated successfully' : 'Score submitted successfully',
                    totalScore: numTotal,
                    maxPossibleScore: numMax
                });
            });
        });
    });
};

const getEventResults = (eventId, track, callback) => {
    const cleanTrack = track === 'Virtual' ? 'Virtual' : 'Physical';

    getEvaluationRounds(eventId, cleanTrack, (rErr, rounds) => {
        if (rErr) return callback(rErr, null);

        getTeamsForEvaluation(eventId, cleanTrack, (tErr, teams) => {
            if (tErr) return callback(tErr, null);

            // 3. Fetch all active evaluators for this event & track
            const evalSql = `SELECT Id, Name, Email, Username, Role, College, Status FROM evaluators WHERE EventId = ? AND Track = ? AND Status = 'Active'`;
            db.query(evalSql, [eventId, cleanTrack], (eErr, allEvaluators) => {
                const evaluatorsList = allEvaluators || [];

                // 4. Fetch Scores with evaluator details
                const scoreSql = `
                    SELECT 
                        es.*, 
                        e.Name AS EvaluatorName, 
                        e.Role AS EvaluatorRole,
                        e.Email AS EvaluatorEmail,
                        e.College AS EvaluatorCollege
                    FROM evaluation_scores es
                    INNER JOIN evaluators e ON es.EvaluatorId = e.Id
                    WHERE es.EventId = ? AND es.Track = ?
                    ORDER BY es.UpdatedAt DESC
                `;

                db.query(scoreSql, [eventId, cleanTrack], (sErr, scores) => {
                    if (sErr) return callback(sErr, null);

                    // Group scores by TeamId and RoundId -> array of submissions
                    const scoresByTeamAndRound = {};
                    (scores || []).forEach(s => {
                        if (!scoresByTeamAndRound[s.TeamId]) {
                            scoresByTeamAndRound[s.TeamId] = {};
                        }
                        if (!scoresByTeamAndRound[s.TeamId][s.RoundId]) {
                            scoresByTeamAndRound[s.TeamId][s.RoundId] = [];
                        }
                        scoresByTeamAndRound[s.TeamId][s.RoundId].push(s);
                    });

                    const totalPossibleRoundMarks = (rounds || []).reduce((sum, r) => sum + (Number(r.totalMaxMarks) || 0), 0);

                    const leaderboard = (teams || []).map(team => {
                        const teamRounds = scoresByTeamAndRound[team.Id] || {};
                        let totalCumulativeScore = 0;
                        let roundsEvaluatedCount = 0;

                        const roundBreakdown = (rounds || []).map(r => {
                            const submissions = teamRounds[r.Id] || [];
                            const hasEvaluated = submissions.length > 0;

                            let roundAverageScore = null;
                            if (hasEvaluated) {
                                const sum = submissions.reduce((acc, sub) => acc + (Number(sub.TotalScore) || 0), 0);
                                roundAverageScore = Math.round((sum / submissions.length) * 100) / 100;
                                totalCumulativeScore += roundAverageScore;
                                roundsEvaluatedCount += 1;
                            }

                            return {
                                roundId: r.Id,
                                roundOrder: r.RoundOrder,
                                roundName: r.RoundName,
                                maxMarks: r.totalMaxMarks,
                                questions: r.questions || [],
                                hasEvaluated,
                                roundAverageScore,
                                submissionCount: submissions.length,
                                submissions: submissions.map(sub => {
                                    let parsedScores = [];
                                    try {
                                        parsedScores = typeof sub.ScoresData === 'string'
                                            ? JSON.parse(sub.ScoresData)
                                            : (sub.ScoresData || []);
                                    } catch (e) {
                                        parsedScores = [];
                                    }

                                    return {
                                        scoreId: sub.Id,
                                        evaluatorId: sub.EvaluatorId,
                                        evaluatorName: sub.EvaluatorName,
                                        evaluatorRole: sub.EvaluatorRole,
                                        evaluatorCollege: sub.EvaluatorCollege,
                                        totalScore: Number(sub.TotalScore) || 0,
                                        maxPossibleScore: Number(sub.MaxPossibleScore) || r.totalMaxMarks,
                                        scoresData: parsedScores,
                                        feedback: sub.Feedback || '',
                                        status: sub.Status || 'Submitted',
                                        updatedAt: sub.UpdatedAt
                                    };
                                })
                            };
                        });

                        return {
                            ...team,
                            roundBreakdown,
                            totalScore: Math.round(totalCumulativeScore * 100) / 100,
                            maxPossibleScore: totalPossibleRoundMarks,
                            roundsEvaluatedCount,
                            isFullyEvaluated: rounds.length > 0 && roundsEvaluatedCount === rounds.length,
                            isPartiallyEvaluated: roundsEvaluatedCount > 0 && roundsEvaluatedCount < rounds.length,
                            isNotEvaluated: roundsEvaluatedCount === 0
                        };
                    });

                    // Sort by totalScore DESC
                    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

                    // Assign ranks
                    let currentRank = 1;
                    leaderboard.forEach((t, i) => {
                        if (i > 0 && t.totalScore < leaderboard[i - 1].totalScore) {
                            currentRank = i + 1;
                        }
                        t.rank = t.totalScore > 0 ? currentRank : null;
                    });

                    const evaluatedTeams = leaderboard.filter(t => t.roundsEvaluatedCount > 0);
                    const avgScore = evaluatedTeams.length > 0
                        ? Math.round((evaluatedTeams.reduce((sum, t) => sum + t.totalScore, 0) / evaluatedTeams.length) * 100) / 100
                        : 0;

                    const evSql = `SELECT PhysicalResultsPublished, VirtualResultsPublished FROM events WHERE Id = ?`;
                    db.query(evSql, [eventId], (evErr, evRows) => {
                        const evRow = evRows?.[0] || {};
                        const overallResultsPublished = cleanTrack === 'Virtual'
                            ? Boolean(evRow.VirtualResultsPublished)
                            : Boolean(evRow.PhysicalResultsPublished);

                        callback(null, {
                            eventId: Number(eventId),
                            track: cleanTrack,
                            rounds,
                            overallResultsPublished,
                            allEvaluators: evaluatorsList,
                            evaluators: evaluatorsList,
                            totalPossibleMarks: totalPossibleRoundMarks,
                            leaderboard,
                            teams: leaderboard,
                            summary: {
                                totalRegisteredTeams: teams.length,
                                totalEvaluatedTeams: evaluatedTeams.length,
                                totalRounds: rounds.length,
                                totalEvaluators: evaluatorsList.length,
                                topTeam: evaluatedTeams.length > 0 ? evaluatedTeams[0] : null,
                                averageScore: avgScore
                            }
                        });
                    });
                });
            });
        });
    });
};

const publishRoundResults = (roundId, isPublished, callback) => {
    const pub = isPublished ? 1 : 0;
    const now = pub ? new Date() : null;
    const sql = `UPDATE evaluation_rounds SET IsPublished = ?, PublishedAt = ? WHERE Id = ?`;
    db.query(sql, [pub, now, roundId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, { roundId: Number(roundId), isPublished: Boolean(pub), publishedAt: now });
    });
};

const publishOverallResults = (eventId, track, isPublished, callback) => {
    const pub = isPublished ? 1 : 0;
    const col = track === 'Virtual' ? 'VirtualResultsPublished' : 'PhysicalResultsPublished';
    const sql = `UPDATE events SET ${col} = ? WHERE Id = ?`;
    db.query(sql, [pub, eventId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, { eventId: Number(eventId), track, isPublished: Boolean(pub) });
    });
};

const getTeamPublishedResults = (teamId, callback) => {
    const teamSql = `
        SELECT 
            t.Id AS TeamId, 
            t.TeamName, 
            t.TeamSize, 
            t.College, 
            t.State, 
            t.EventId,
            COALESCE(u.UserName, tm.MemberName, 'Lead') AS TeamLeadName,
            e.EventName,
            e.HackathonMode,
            e.TeamSize AS EventTeamSize,
            e.PhysicalResultsPublished,
            e.VirtualResultsPublished,
            COALESCE(er.ParticipationMode, 'Physical') AS ParticipationMode
        FROM registered_teams t
        LEFT JOIN events e ON t.EventId = e.Id
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
        LEFT JOIN registered_team_members tm ON tm.TeamId = t.Id AND LOWER(tm.Role) = 'teamlead'
        LEFT JOIN users u ON tm.UserId = u.Id
        WHERE t.Id = ?
        LIMIT 1
    `;

    db.query(teamSql, [teamId], (err, teamRows) => {
        if (err) return callback(err, null);
        if (!teamRows || teamRows.length === 0) {
            const notFound = new Error('Team not found');
            notFound.status = 404;
            return callback(notFound, null);
        }

        const team = teamRows[0];
        const track = team.ParticipationMode === 'Virtual' ? 'Virtual' : 'Physical';
        const isOverallPublished = track === 'Virtual' 
            ? Boolean(team.VirtualResultsPublished) 
            : Boolean(team.PhysicalResultsPublished);

        // Count total registrations for this event & track
        const countSql = `
            SELECT COUNT(*) AS totalRegistrations 
            FROM registered_teams rt
            LEFT JOIN event_registrations er ON er.TeamId = rt.Id AND er.EventId = rt.EventId
            WHERE rt.EventId = ? AND COALESCE(er.ParticipationMode, 'Physical') = ?
        `;
        db.query(countSql, [team.EventId, track], (cErr, countRows) => {
            const totalRegistrations = countRows?.[0]?.totalRegistrations || 0;

            // Fetch published rounds for this event and track
            const roundSql = `
                SELECT Id, RoundOrder, RoundName, Description, IsPublished, PublishedAt
                FROM evaluation_rounds
                WHERE EventId = ? AND Track = ? AND IsPublished = 1
                ORDER BY RoundOrder ASC
            `;
            db.query(roundSql, [team.EventId, track], (rErr, pubRounds) => {
                if (rErr) return callback(rErr, null);
                if (pubRounds.length === 0) {
                    return callback(null, {
                        team,
                        track,
                        totalRegistrations,
                        publishedRounds: [],
                        isOverallPublished,
                        overallRank: null,
                        totalPublishedScore: 0,
                        totalPublishedMaxMarks: 0,
                        percentage: 0
                    });
                }

                const pubRoundIds = pubRounds.map(r => r.Id);

                // Fetch scores for this team in these published rounds
                const scoreSql = `
                    SELECT 
                        es.*,
                        e.Name AS EvaluatorName,
                        e.Role AS EvaluatorRole
                    FROM evaluation_scores es
                    INNER JOIN evaluators e ON es.EvaluatorId = e.Id
                    WHERE es.TeamId = ? AND es.RoundId IN (?)
                    ORDER BY es.UpdatedAt DESC
                `;
                db.query(scoreSql, [teamId, pubRoundIds], (sErr, scores) => {
                    if (sErr) return callback(sErr, null);

                    const qSql = `
                        SELECT Id, RoundId, QuestionText, MaxMarks, QuestionOrder
                        FROM evaluation_questions
                        WHERE RoundId IN (?)
                        ORDER BY QuestionOrder ASC
                    `;
                    db.query(qSql, [pubRoundIds], (qErr, questions) => {
                        const qByRound = {};
                        (questions || []).forEach(q => {
                            if (!qByRound[q.RoundId]) qByRound[q.RoundId] = [];
                            qByRound[q.RoundId].push(q);
                        });

                        const scoresByRound = {};
                        (scores || []).forEach(s => {
                            if (!scoresByRound[s.RoundId]) scoresByRound[s.RoundId] = [];
                            scoresByRound[s.RoundId].push(s);
                        });

                        let totalPublishedScore = 0;
                        let totalPublishedMaxMarks = 0;

                        const roundBreakdown = pubRounds.map(r => {
                            const roundQuestions = qByRound[r.Id] || [];
                            const roundMaxMarks = roundQuestions.reduce((sum, q) => sum + Number(q.MaxMarks || 0), 0);
                            const subs = scoresByRound[r.Id] || [];
                            const hasScore = subs.length > 0;

                            let avgScore = null;
                            if (hasScore) {
                                const sum = subs.reduce((acc, sub) => acc + Number(sub.TotalScore || 0), 0);
                                avgScore = Math.round((sum / subs.length) * 100) / 100;
                                totalPublishedScore += avgScore;
                            }
                            totalPublishedMaxMarks += roundMaxMarks;

                            // Calculate marks awarded for each individual question
                            const parsedSubmissions = subs.map(sub => {
                                let parsed = [];
                                try {
                                    parsed = typeof sub.ScoresData === 'string' ? JSON.parse(sub.ScoresData) : (sub.ScoresData || []);
                                } catch(e) {}
                                return {
                                    evaluatorName: sub.EvaluatorName,
                                    evaluatorRole: sub.EvaluatorRole,
                                    totalScore: sub.TotalScore,
                                    scoresData: parsed,
                                    feedback: sub.Feedback
                                };
                            });

                            const questionsWithScores = roundQuestions.map(q => {
                                let qMarksSum = 0;
                                let qCount = 0;
                                parsedSubmissions.forEach(sub => {
                                    const match = (sub.scoresData || []).find(item => Number(item.questionId) === Number(q.Id));
                                    if (match && match.marks !== undefined && match.marks !== null) {
                                        qMarksSum += Number(match.marks);
                                        qCount++;
                                    }
                                });
                                const avgQMarks = qCount > 0 ? Math.round((qMarksSum / qCount) * 100) / 100 : null;
                                return {
                                    ...q,
                                    marksAwarded: avgQMarks
                                };
                            });

                            return {
                                roundId: r.Id,
                                roundOrder: r.RoundOrder,
                                roundName: r.RoundName,
                                description: r.Description,
                                maxMarks: roundMaxMarks,
                                questions: questionsWithScores,
                                hasScore,
                                score: avgScore,
                                averageScore: avgScore,
                                feedback: subs[0]?.Feedback || '',
                                submissions: parsedSubmissions,
                                evaluations: parsedSubmissions
                            };
                        });

                        const roundedTotalScore = Math.round(totalPublishedScore * 100) / 100;
                        const scorePercentage = totalPublishedMaxMarks > 0 ? Math.round((totalPublishedScore / totalPublishedMaxMarks) * 100) : 0;

                        if (isOverallPublished) {
                            getEventResults(team.EventId, track, (allErr, allRes) => {
                                let rank = null;
                                if (allRes?.leaderboard) {
                                    const match = allRes.leaderboard.find(t => t.Id === Number(teamId));
                                    rank = match ? match.rank : null;
                                }
                                callback(null, {
                                    team,
                                    track,
                                    totalRegistrations,
                                    publishedRounds: roundBreakdown,
                                    isOverallPublished: true,
                                    overallPublished: true,
                                    overallRank: rank,
                                    rank: rank,
                                    totalPublishedScore: roundedTotalScore,
                                    cumulativeScore: roundedTotalScore,
                                    totalPublishedMaxMarks,
                                    maxPossibleScore: totalPublishedMaxMarks,
                                    percentage: scorePercentage
                                });
                            });
                        } else {
                            callback(null, {
                                team,
                                track,
                                totalRegistrations,
                                publishedRounds: roundBreakdown,
                                isOverallPublished: false,
                                overallPublished: false,
                                overallRank: null,
                                rank: null,
                                totalPublishedScore: roundedTotalScore,
                                cumulativeScore: roundedTotalScore,
                                totalPublishedMaxMarks,
                                maxPossibleScore: totalPublishedMaxMarks,
                                percentage: scorePercentage
                            });
                        }
                    });
                });
            });
        });
    });
};

module.exports = {
    getEvaluatorsByEvent,
    createEvaluator,
    updateEvaluator,
    deleteEvaluator,
    getEvaluationRounds,
    createEvaluationRound,
    updateEvaluationRound,
    deleteEvaluationRound,
    createEvaluationQuestion,
    updateEvaluationQuestion,
    deleteEvaluationQuestion,
    evaluatorLogin,
    getTeamsForEvaluation,
    getScoresForRound,
    saveEvaluationScore,
    getEventResults,
    publishRoundResults,
    publishOverallResults,
    getTeamPublishedResults
};
