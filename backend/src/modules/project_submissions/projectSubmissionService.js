const db = require('../../config/db');

/**
 * Get project submission for a specific team in an event
 */
const getSubmissionByTeam = (eventId, teamId, callback) => {
    const query = `
        SELECT 
            s.*,
            t.TeamName,
            t.TeamLeadUserId,
            ps.ProblemCode,
            ps.Title AS ProblemTitle,
            ps.Category AS ProblemCategory,
            u.UserName AS SubmittedByName
        FROM hackathon_project_submissions s
        INNER JOIN registered_teams t ON t.Id = s.TeamId
        LEFT JOIN event_problem_statements ps ON ps.Id = s.ProblemStatementId
        LEFT JOIN users u ON u.Id = s.SubmittedByUserId
        WHERE s.EventId = ? AND s.TeamId = ?
        LIMIT 1
    `;
    db.query(query, [eventId, teamId], (err, results) => {
        if (err) return callback(err);
        return callback(null, results.length > 0 ? results[0] : null);
    });
};

/**
 * Get all project submissions for an event (Admin / Evaluator view)
 */
const getAllSubmissionsByEvent = (eventId, callback) => {
    const query = `
        SELECT 
            s.*,
            t.TeamName,
            t.TeamLeadUserId,
            u_lead.UserName AS TeamLeadName,
            u_lead.Email AS TeamLeadEmail,
            ps.ProblemCode,
            ps.Title AS ProblemTitle,
            ps.Category AS ProblemCategory,
            u_sub.UserName AS SubmittedByName
        FROM hackathon_project_submissions s
        INNER JOIN registered_teams t ON t.Id = s.TeamId
        LEFT JOIN users u_lead ON u_lead.Id = t.TeamLeadUserId
        LEFT JOIN event_problem_statements ps ON ps.Id = s.ProblemStatementId
        LEFT JOIN users u_sub ON u_sub.Id = s.SubmittedByUserId
        WHERE s.EventId = ?
        ORDER BY s.UpdatedAt DESC
    `;
    db.query(query, [eventId], (err, results) => {
        if (err) return callback(err);
        return callback(null, results || []);
    });
};

/**
 * Submit or update project submission by team lead or team member
 */
const submitProject = (eventId, teamId, userId, userRole, submissionData, callback) => {
    const {
        githubRepoUrl,
        liveDemoUrl,
        drivePptUrl,
        techStack,
        description
    } = submissionData;

    if (!githubRepoUrl && !liveDemoUrl && !drivePptUrl) {
        const error = new Error('Please provide at least one link (GitHub Repo, Live Demo, or Presentation Deck).');
        error.status = 400;
        return callback(error);
    }

    // 1. Verify team belongs to event and get TeamLeadUserId
    db.query(
        'SELECT Id, TeamLeadUserId FROM registered_teams WHERE Id = ? AND EventId = ?',
        [teamId, eventId],
        (err, teamResults) => {
            if (err) return callback(err);
            if (teamResults.length === 0) {
                const error = new Error('Team not found for this event.');
                error.status = 404;
                return callback(error);
            }

            const team = teamResults[0];

            // Check authorization: Admin, Team Leader, or registered team member
            if (userRole === 'admin' || userRole === 'Admin') {
                proceedSave();
            } else if (userId && Number(team.TeamLeadUserId) === Number(userId)) {
                proceedSave();
            } else if (userId) {
                // Check if user is a member of the team
                db.query(
                    'SELECT Id FROM registered_team_members WHERE TeamId = ? AND UserId = ?',
                    [teamId, userId],
                    (memberErr, memberRows) => {
                        if (memberErr) return callback(memberErr);
                        if (!memberRows || memberRows.length === 0) {
                            const forbidden = new Error('Only team members or the team lead can submit project details.');
                            forbidden.status = 403;
                            return callback(forbidden);
                        }
                        proceedSave();
                    }
                );
            } else {
                const unauth = new Error('Authentication required to submit project.');
                unauth.status = 401;
                return callback(unauth);
            }

            function proceedSave() {
                // Find selected problem statement if any
                db.query(
                    'SELECT ProblemStatementId FROM problem_statement_selections WHERE EventId = ? AND TeamId = ?',
                    [eventId, teamId],
                    (psErr, psRows) => {
                        if (psErr) return callback(psErr);

                        const problemStatementId = psRows && psRows.length > 0 ? psRows[0].ProblemStatementId : null;

                        const upsertQuery = `
                            INSERT INTO hackathon_project_submissions (
                                EventId, TeamId, ProblemStatementId,
                                GithubRepoUrl, LiveDemoUrl, DrivePptUrl,
                                TechStack, Description, SubmittedByUserId,
                                SubmittedAt, UpdatedAt
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                            ON DUPLICATE KEY UPDATE
                                ProblemStatementId = COALESCE(VALUES(ProblemStatementId), ProblemStatementId),
                                GithubRepoUrl = VALUES(GithubRepoUrl),
                                LiveDemoUrl = VALUES(LiveDemoUrl),
                                DrivePptUrl = VALUES(DrivePptUrl),
                                TechStack = VALUES(TechStack),
                                Description = VALUES(Description),
                                SubmittedByUserId = VALUES(SubmittedByUserId),
                                UpdatedAt = NOW()
                        `;

                        db.query(
                            upsertQuery,
                            [
                                eventId,
                                teamId,
                                problemStatementId,
                                (githubRepoUrl || '').trim() || null,
                                (liveDemoUrl || '').trim() || null,
                                (drivePptUrl || '').trim() || null,
                                (techStack || '').trim() || null,
                                (description || '').trim() || null,
                                userId || null
                            ],
                            (saveErr, saveRes) => {
                                if (saveErr) return callback(saveErr);

                                // Fetch the newly saved record
                                getSubmissionByTeam(eventId, teamId, (fetchErr, record) => {
                                    if (fetchErr) return callback(null, { message: 'Project submitted successfully' });
                                    return callback(null, {
                                        message: 'Project submitted successfully',
                                        submission: record
                                    });
                                });
                            }
                        );
                    }
                );
            }
        }
    );
};

module.exports = {
    getSubmissionByTeam,
    getAllSubmissionsByEvent,
    submitProject
};
