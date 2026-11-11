const db = require('../../config/db');
const { createNotification } = require('../notifications/notificationService');
const { recordMutation } = require('../security/auditService');
const DEFAULT_DOMAINS = [
    'Artificial Intelligence & Machine Learning',
    'Internet of Things (IoT) & Embedded Systems',
    'Robotics & Automation',
    'Web & Cloud Application Development',
    'Mobile Application Development',
    'Cybersecurity & Blockchain',
    'Data Science & Big Data Analytics',
    'Renewable Energy & Clean Tech',
    'Open Innovation & Hardware Prototypes'
];
const DEFAULT_CRITERIA = [
    { CriteriaName: 'Innovation & Creativity', MaxMarks: 25, DisplayOrder: 1 },
    { CriteriaName: 'Technical Implementation & Prototype', MaxMarks: 25, DisplayOrder: 2 },
    { CriteriaName: 'Problem Solving & Feasibility', MaxMarks: 20, DisplayOrder: 3 },
    { CriteriaName: 'Real-world Impact & Commercial Potential', MaxMarks: 15, DisplayOrder: 4 },
    { CriteriaName: 'Presentation & Demonstration', MaxMarks: 15, DisplayOrder: 5 }
];
// CONFIGURATION & LIFECYCLE
const getConfig = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM project_expo_configs WHERE EventId = ?`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                const config = rows[0];
                try {
                    config.AllowedDepartments = JSON.parse(config.AllowedDepartments || '[]');
                } catch {
                    config.AllowedDepartments = config.AllowedDepartments ? config.AllowedDepartments.split(',').map(s => s.trim()) : [];
                }
                try {
                    config.AllowedBranches = JSON.parse(config.AllowedBranches || '[]');
                } catch {
                    config.AllowedBranches = config.AllowedBranches ? config.AllowedBranches.split(',').map(s => s.trim()) : [];
                }
                try {
                    config.AllowedYears = JSON.parse(config.AllowedYears || '[]');
                } catch {
                    config.AllowedYears = config.AllowedYears ? config.AllowedYears.split(',').map(s => s.trim()) : [];
                }
                return resolve(config);
            }
            // Return defaults if not configured yet
            return resolve({
                EventId: Number(eventId),
                ParticipationType: 'Both',
                MinTeamSize: 1,
                MaxTeamSize: 4,
                AllowedDepartments: ['All Departments'],
                AllowedBranches: ['All Branches'],
                AllowedYears: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
                SubmissionDeadline: null,
                MaxSubmissions: 100,
                TotalBooths: 50,
                BoothPrefix: 'STALL-',
                PresentationDurationMinutes: 15,
                Guidelines: '1. Working prototype demonstration is mandatory.\n2. Poster / Banner standee dimensions must be 3ft x 2ft.\n3. Teams must report to their assigned booth 30 minutes before judging starts.\n4. Power sockets and Wi-Fi will be provided at each booth.',
                RequiredDocuments: 'Project Abstract (PDF), Final Presentation (PPT), Working Demo Video / Photos',
                Status: 'DRAFT'
            });
        });
    });
};
const saveConfig = (eventId, data) => {
    return new Promise((resolve, reject) => {
        const {
            ParticipationType = 'Both',
            MinTeamSize = 1,
            MaxTeamSize = 4,
            AllowedDepartments = [],
            AllowedBranches = [],
            AllowedYears = [],
            SubmissionDeadline = null,
            MaxSubmissions = 100,
            TotalBooths = 50,
            BoothPrefix = 'STALL-',
            PresentationDurationMinutes = 15,
            Guidelines = '',
            RequiredDocuments = '',
            Status = 'CONFIGURATION'
        } = data;
        const deptsJson = Array.isArray(AllowedDepartments) ? JSON.stringify(AllowedDepartments) : JSON.stringify([]);
        const branchesJson = Array.isArray(AllowedBranches) ? JSON.stringify(AllowedBranches) : JSON.stringify([]);
        const yearsJson = Array.isArray(AllowedYears) ? JSON.stringify(AllowedYears) : JSON.stringify([]);
        const query = `
            INSERT INTO project_expo_configs
            (EventId, ParticipationType, MinTeamSize, MaxTeamSize, AllowedDepartments, AllowedBranches, AllowedYears,
             SubmissionDeadline, MaxSubmissions, TotalBooths, BoothPrefix, PresentationDurationMinutes, Guidelines, RequiredDocuments, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            ParticipationType = VALUES(ParticipationType),
            MinTeamSize = VALUES(MinTeamSize),
            MaxTeamSize = VALUES(MaxTeamSize),
            AllowedDepartments = VALUES(AllowedDepartments),
            AllowedBranches = VALUES(AllowedBranches),
            AllowedYears = VALUES(AllowedYears),
            SubmissionDeadline = VALUES(SubmissionDeadline),
            MaxSubmissions = VALUES(MaxSubmissions),
            TotalBooths = VALUES(TotalBooths),
            BoothPrefix = VALUES(BoothPrefix),
            PresentationDurationMinutes = VALUES(PresentationDurationMinutes),
            Guidelines = VALUES(Guidelines),
            RequiredDocuments = VALUES(RequiredDocuments),
            Status = VALUES(Status)
        `;
        db.query(query, [
            eventId, ParticipationType, MinTeamSize, MaxTeamSize, deptsJson, branchesJson, yearsJson,
            SubmissionDeadline ? new Date(SubmissionDeadline) : null,
            MaxSubmissions, TotalBooths, BoothPrefix, PresentationDurationMinutes, Guidelines, RequiredDocuments, Status
        ], (err) => {
            if (err) return reject(err);
            getConfig(eventId).then(resolve).catch(reject);
        });
    });
};
const updateStatus = (eventId, status, req = null) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT Status FROM project_expo_configs WHERE EventId = ?`, [eventId], (prevErr, prevRows) => {
            const previousStatus = prevRows?.[0]?.Status || 'Draft';
            const query = `
                INSERT INTO project_expo_configs (EventId, Status)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE Status = VALUES(Status)
            `;
            db.query(query, [eventId, status], (err, result) => {
                if (err) return reject(err);
                recordMutation({
                    actorUserId: req?.user?.Id || req?.user?.id || null,
                    actorEmail: req?.user?.Email || req?.user?.email || req?.user?.UserName || 'system@ayojan.in',
                    actorRole: req?.user?.role || 'admin',
                    eventId,
                    action: 'UPDATE_STATUS',
                    module: 'PROJECT_EXPO',
                    entityType: 'EXPO_CONFIG',
                    entityId: eventId,
                    previousValue: { status: previousStatus },
                    newValue: { status },
                    req
                });
                resolve({ success: true, status });
            });
        });
    });
};
// DOMAINS
const getDomains = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM project_expo_domains WHERE EventId = ? ORDER BY DisplayOrder ASC, Id ASC`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) return resolve(rows);
            // Seed default domains if none exist
            const values = DEFAULT_DOMAINS.map((name, idx) => [eventId, name, null, idx + 1]);
            const insertQuery = `INSERT INTO project_expo_domains (EventId, DomainName, Description, DisplayOrder) VALUES ?`;
            db.query(insertQuery, [values], (insertErr) => {
                if (insertErr) return reject(insertErr);
                db.query(query, [eventId], (err2, rows2) => {
                    if (err2) return reject(err2);
                    resolve(rows2);
                });
            });
        });
    });
};
const saveDomains = (eventId, domains) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(domains) || domains.length === 0) {
            return reject(new Error('Domains list must be a non-empty array'));
        }
        db.getConnection(async (connErr, conn) => {
            if (connErr) return reject(connErr);
            try {
                await conn.promise().beginTransaction();
                await conn.promise().query(`DELETE FROM project_expo_domains WHERE EventId = ?`, [eventId]);
                const values = domains.map((d, idx) => [
                    eventId,
                    typeof d === 'string' ? d.trim() : d.DomainName.trim(),
                    typeof d === 'object' ? (d.Description || null) : null,
                    idx + 1
                ]);
                await conn.promise().query(
                    `INSERT INTO project_expo_domains (EventId, DomainName, Description, DisplayOrder) VALUES ?`,
                    [values]
                );
                await conn.promise().commit();
                conn.release();
                getDomains(eventId).then(resolve).catch(reject);
            } catch (err) {
                await conn.promise().rollback();
                conn.release();
                reject(err);
            }
        });
    });
};
// SUBMISSIONS
const getSubmissions = (eventId, filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                s.*,
                t.TeamName,
                t.TeamLeadUserId AS LeaderId,
                u.UserName AS LeaderName,
                u.Email AS LeaderEmail,
                u.Mobile AS LeaderMobile,
                d.DomainName,
                b.BoothNumber,
                b.LocationZone AS BoothZone,
                sch.SlotDate AS PresentationDate,
                sch.StartTime AS PresentationStartTime,
                sch.EndTime AS PresentationEndTime,
                (SELECT COUNT(*) FROM registered_team_members tm WHERE tm.TeamId = t.Id) AS MemberCount,
                (SELECT AVG(sc.Score) FROM project_expo_scores sc WHERE sc.TeamId = t.Id) AS AvgScore
            FROM project_expo_submissions s
            JOIN registered_teams t ON s.TeamId = t.Id
            LEFT JOIN users u ON t.TeamLeadUserId = u.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            LEFT JOIN project_expo_booths b ON b.AllocatedTeamId = t.Id
            LEFT JOIN project_expo_schedules sch ON sch.TeamId = t.Id
            WHERE s.EventId = ?
        `;
        const params = [eventId];
        if (filters.domainId) {
            query += ` AND s.DomainId = ?`;
            params.push(filters.domainId);
        }
        if (filters.status) {
            query += ` AND s.Status = ?`;
            params.push(filters.status);
        }
        if (filters.search) {
            query += ` AND (s.ProjectTitle LIKE ? OR t.TeamName LIKE ? OR u.UserName LIKE ? OR u.Email LIKE ?)`;
            const term = `%${filters.search}%`;
            params.push(term, term, term, term);
        }
        query += ` ORDER BY s.SubmittedAt DESC`;
        db.query(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const getSubmissionByTeam = (eventId, teamId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                s.*,
                t.TeamName,
                t.TeamLeadUserId AS LeaderId,
                d.DomainName,
                b.BoothNumber,
                b.LocationZone AS BoothZone,
                sch.SlotDate AS PresentationDate,
                sch.StartTime AS PresentationStartTime,
                sch.EndTime AS PresentationEndTime,
                sch.RoomOrBooth AS PresentationVenue
            FROM project_expo_submissions s
            JOIN registered_teams t ON s.TeamId = t.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            LEFT JOIN project_expo_booths b ON b.AllocatedTeamId = t.Id
            LEFT JOIN project_expo_schedules sch ON sch.TeamId = t.Id
            WHERE s.EventId = ? AND s.TeamId = ?
        `;
        db.query(query, [eventId, teamId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows.length > 0 ? rows[0] : null);
        });
    });
};
const upsertSubmission = (data) => {
    return new Promise((resolve, reject) => {
        const {
            EventId,
            TeamId,
            DomainId = null,
            ProjectTitle,
            ProblemStatement = '',
            Abstract = '',
            ProposedSolution = '',
            TechnologiesUsed = '',
            InnovationUniqueness = '',
            RealWorldApplications = '',
            GithubRepoUrl = null,
            LiveDemoUrl = null,
            PptUrl = null,
            DocumentationUrl = null,
            MediaUrls = null,
            Status = 'SUBMITTED',
            SubmittedByUserId = null
        } = data;
        if (!EventId || !TeamId || !ProjectTitle) {
            return reject(new Error('EventId, TeamId, and ProjectTitle are required.'));
        }
        const mediaJson = MediaUrls ? (typeof MediaUrls === 'string' ? MediaUrls : JSON.stringify(MediaUrls)) : null;
        const query = `
            INSERT INTO project_expo_submissions
            (EventId, TeamId, DomainId, ProjectTitle, ProblemStatement, Abstract, ProposedSolution,
             TechnologiesUsed, InnovationUniqueness, RealWorldApplications, GithubRepoUrl, LiveDemoUrl,
             PptUrl, DocumentationUrl, MediaUrls, Status, SubmittedByUserId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            DomainId = VALUES(DomainId),
            ProjectTitle = VALUES(ProjectTitle),
            ProblemStatement = VALUES(ProblemStatement),
            Abstract = VALUES(Abstract),
            ProposedSolution = VALUES(ProposedSolution),
            TechnologiesUsed = VALUES(TechnologiesUsed),
            InnovationUniqueness = VALUES(InnovationUniqueness),
            RealWorldApplications = VALUES(RealWorldApplications),
            GithubRepoUrl = VALUES(GithubRepoUrl),
            LiveDemoUrl = VALUES(LiveDemoUrl),
            PptUrl = VALUES(PptUrl),
            DocumentationUrl = VALUES(DocumentationUrl),
            MediaUrls = VALUES(MediaUrls),
            Status = VALUES(Status),
            SubmittedByUserId = VALUES(SubmittedByUserId)
        `;
        db.query(query, [
            EventId, TeamId, DomainId, ProjectTitle, ProblemStatement, Abstract, ProposedSolution,
            TechnologiesUsed, InnovationUniqueness, RealWorldApplications, GithubRepoUrl, LiveDemoUrl,
            PptUrl, DocumentationUrl, mediaJson, Status, SubmittedByUserId
        ], (err) => {
            if (err) return reject(err);
            getSubmissionByTeam(EventId, TeamId).then(resolve).catch(reject);
        });
    });
};
const reviewSubmission = (submissionId, { status, adminFeedback }, req = null) => {
    return new Promise((resolve, reject) => {
        // Fetch submission for diff & notification
        db.query(
            `SELECT s.*, t.TeamLeadUserId AS LeaderId, e.EventName
             FROM project_expo_submissions s
             JOIN registered_teams t ON s.TeamId = t.Id
             JOIN events e ON s.EventId = e.Id
             WHERE s.Id = ?`,
            [submissionId],
            (err1, rows) => {
                if (err1) return reject(err1);
                const sub = rows && rows.length > 0 ? rows[0] : null;
                const prevStatus = sub?.Status;
                const query = `
                    UPDATE project_expo_submissions
                    SET Status = ?, AdminFeedback = ?
                    WHERE Id = ?
                `;
                db.query(query, [status, adminFeedback || null, submissionId], (err, res) => {
                    if (err) return reject(err);
                    if (sub && sub.LeaderId) {
                        createNotification({
                            UserId: sub.LeaderId,
                            Title: `Project ${status === 'APPROVED' ? 'Approved' : status === 'CHANGES_REQUESTED' ? 'Correction Requested' : 'Review Updated'}`,
                            Message: `Your project "${sub.ProjectTitle}" for ${sub.EventName} has been marked as ${status}.${adminFeedback ? ` Feedback: ${adminFeedback}` : ''}`,
                            Type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'WARNING',
                            LinkUrl: `/user/teamInfo/${sub.TeamId}`
                        }).catch(() => {});
                    }
                    // Audit state mutation
                    recordMutation({
                        actor: req?.user,
                        module: 'project_expo',
                        action: 'REVIEW_SUBMISSION',
                        entityType: 'project_expo_submission',
                        entityId: submissionId,
                        eventId: sub?.EventId,
                        previousState: { status: prevStatus },
                        newState: { status, adminFeedback },
                        diff: { status: { from: prevStatus, to: status }, adminFeedback },
                        req
                    });
                    resolve({ success: true, submissionId, status });
                });
            }
        );
    });
};
// BOOTHS / STALLS
const getBooths = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                b.*,
                t.TeamName,
                t.TeamLeadUserId AS LeaderId,
                u.UserName AS LeaderName,
                u.Email AS LeaderEmail,
                u.Mobile AS LeaderMobile,
                s.ProjectTitle,
                d.DomainName
            FROM project_expo_booths b
            LEFT JOIN registered_teams t ON b.AllocatedTeamId = t.Id
            LEFT JOIN users u ON t.TeamLeadUserId = u.Id
            LEFT JOIN project_expo_submissions s ON s.TeamId = t.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            WHERE b.EventId = ?
            ORDER BY b.Id ASC
        `;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const batchGenerateBooths = (eventId, { count = 50, prefix = 'STALL-', locationZone = 'Exhibition Hall A' }) => {
    return new Promise((resolve, reject) => {
        const numCount = parseInt(count, 10) || 50;
        if (numCount < 1 || numCount > 300) {
            return reject(new Error('Booth count must be between 1 and 300'));
        }
        const values = [];
        for (let i = 1; i <= numCount; i++) {
            const numStr = i < 10 ? `0${i}` : `${i}`;
            const boothNo = `${prefix || 'STALL-'}${numStr}`;
            values.push([eventId, boothNo, locationZone || 'Main Hall', 'AVAILABLE', null, null]);
        }
        const query = `
            INSERT IGNORE INTO project_expo_booths
            (EventId, BoothNumber, LocationZone, Status, AllocatedTeamId, Notes)
            VALUES ?
        `;
        db.query(query, [values], (err, result) => {
            if (err) return reject(err);
            getBooths(eventId).then(resolve).catch(reject);
        });
    });
};
const allocateBooth = (boothId, teamId, req = null) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (connErr, conn) => {
            if (connErr) return reject(connErr);
            try {
                await conn.promise().beginTransaction();
                // 1. Get booth info
                const [bRows] = await conn.promise().query(`SELECT * FROM project_expo_booths WHERE Id = ?`, [boothId]);
                if (bRows.length === 0) {
                    throw new Error('Booth not found.');
                }
                const booth = bRows[0];
                // 2. Clear any prior booth allocation for this team in this event
                await conn.promise().query(
                    `UPDATE project_expo_booths
                     SET AllocatedTeamId = NULL, Status = 'AVAILABLE', AllocatedAt = NULL
                     WHERE EventId = ? AND AllocatedTeamId = ?`,
                    [booth.EventId, teamId]
                );
                // 3. Allocate this booth
                await conn.promise().query(
                    `UPDATE project_expo_booths
                     SET AllocatedTeamId = ?, Status = 'ALLOCATED', AllocatedAt = NOW()
                     WHERE Id = ?`,
                    [teamId, boothId]
                );
                await conn.promise().commit();
                conn.release();
                recordMutation({
                    actorUserId: req?.user?.Id || req?.user?.id || null,
                    actorEmail: req?.user?.Email || req?.user?.email || req?.user?.UserName || 'system@ayojan.in',
                    actorRole: req?.user?.role || 'admin',
                    eventId: booth.EventId,
                    action: 'ALLOCATE_BOOTH',
                    module: 'PROJECT_EXPO',
                    entityType: 'BOOTH',
                    entityId: boothId,
                    previousValue: { status: booth.Status, allocatedTeamId: booth.AllocatedTeamId },
                    newValue: { status: 'ALLOCATED', allocatedTeamId: teamId, boothNumber: booth.BoothNumber },
                    req
                });
                // Notify team
                db.query(
                    `SELECT t.TeamLeadUserId AS LeaderId, e.EventName
                     FROM registered_teams t
                     JOIN events e ON t.EventId = e.Id
                     WHERE t.Id = ?`,
                    [teamId],
                    (err, rows) => {
                        if (!err && rows && rows.length > 0) {
                            const { LeaderId, EventName } = rows[0];
                            if (LeaderId) {
                                createNotification({
                                    UserId: LeaderId,
                                    Title: `Booth Allocated: ${booth.BoothNumber}`,
                                    Message: `Your team has been allocated ${booth.BoothNumber} (${booth.LocationZone || 'Main Hall'}) for ${EventName}.`,
                                    Type: 'SUCCESS',
                                    LinkUrl: `/user/teamInfo/${teamId}`
                                }).catch(() => {});
                            }
                        }
                    }
                );
                resolve({ success: true, boothId, teamId, boothNumber: booth.BoothNumber });
            } catch (err) {
                await conn.promise().rollback();
                conn.release();
                reject(err);
            }
        });
    });
};
const deallocateBooth = (boothId, req = null) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM project_expo_booths WHERE Id = ?`, [boothId], (bErr, bRows) => {
            const booth = bRows?.[0] || {};
            const query = `
                UPDATE project_expo_booths
                SET AllocatedTeamId = NULL, Status = 'AVAILABLE', AllocatedAt = NULL
                WHERE Id = ?
            `;
            db.query(query, [boothId], (err) => {
                if (err) return reject(err);
                recordMutation({
                    actorUserId: req?.user?.Id || req?.user?.id || null,
                    actorEmail: req?.user?.Email || req?.user?.email || req?.user?.UserName || 'system@ayojan.in',
                    actorRole: req?.user?.role || 'admin',
                    eventId: booth.EventId || null,
                    action: 'DEALLOCATE_BOOTH',
                    module: 'PROJECT_EXPO',
                    entityType: 'BOOTH',
                    entityId: boothId,
                    previousValue: { status: booth.Status, allocatedTeamId: booth.AllocatedTeamId },
                    newValue: { status: 'AVAILABLE', allocatedTeamId: null },
                    req
                });
                resolve({ success: true, boothId });
            });
        });
    });
};
const deleteBooth = (boothId, req = null) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM project_expo_booths WHERE Id = ?`, [boothId], (bErr, bRows) => {
            if (bErr) return reject(bErr);
            if (!bRows || bRows.length === 0) {
                return reject(new Error('Stall not found.'));
            }
            const booth = bRows[0];
            // Disallow removal if a team is currently assigned to this stall
            if (booth.AllocatedTeamId || booth.Status === 'ALLOCATED') {
                return reject(new Error(`Cannot delete ${booth.BoothNumber} because it is currently assigned to a team. Please free the stall before removing it.`));
            }
            db.query(`DELETE FROM project_expo_booths WHERE Id = ?`, [boothId], (err) => {
                if (err) return reject(err);
                recordMutation({
                    actorUserId: req?.user?.Id || req?.user?.id || null,
                    actorEmail: req?.user?.Email || req?.user?.email || req?.user?.UserName || 'system@ayojan.in',
                    actorRole: req?.user?.role || 'admin',
                    eventId: booth.EventId || null,
                    action: 'DELETE_BOOTH',
                    module: 'PROJECT_EXPO',
                    entityType: 'BOOTH',
                    entityId: boothId,
                    previousValue: booth,
                    newValue: null,
                    req
                });
                resolve({ success: true, boothId, boothNumber: booth.BoothNumber });
            });
        });
    });
};
// PRESENTATION SCHEDULES
const getSchedules = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                sch.*,
                t.TeamName,
                s.ProjectTitle,
                d.DomainName,
                b.BoothNumber,
                ev.Name AS JudgeName,
                COALESCE(ev.EventRole, ev.Role, 'Technical Jury') AS JudgeDesignation
            FROM project_expo_schedules sch
            JOIN registered_teams t ON sch.TeamId = t.Id
            LEFT JOIN project_expo_submissions s ON s.TeamId = t.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            LEFT JOIN project_expo_booths b ON b.AllocatedTeamId = t.Id
            LEFT JOIN evaluators ev ON sch.JudgeId = ev.Id
            WHERE sch.EventId = ?
            ORDER BY sch.SlotDate ASC, sch.StartTime ASC
        `;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const upsertSchedule = (data) => {
    return new Promise((resolve, reject) => {
        const {
            Id,
            EventId,
            TeamId,
            SlotDate,
            StartTime,
            EndTime,
            RoomOrBooth = null,
            JudgeId = null,
            Status = 'SCHEDULED'
        } = data;
        if (!EventId || !TeamId || !SlotDate || !StartTime || !EndTime) {
            return reject(new Error('EventId, TeamId, SlotDate, StartTime, and EndTime are required.'));
        }
        if (Id) {
            const query = `
                UPDATE project_expo_schedules
                SET TeamId = ?, SlotDate = ?, StartTime = ?, EndTime = ?, RoomOrBooth = ?, JudgeId = ?, Status = ?
                WHERE Id = ? AND EventId = ?
            `;
            db.query(query, [TeamId, SlotDate, StartTime, EndTime, RoomOrBooth, JudgeId, Status, Id, EventId], (err) => {
                if (err) return reject(err);
                resolve({ success: true, id: Id });
            });
        } else {
            const query = `
                INSERT INTO project_expo_schedules
                (EventId, TeamId, SlotDate, StartTime, EndTime, RoomOrBooth, JudgeId, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [EventId, TeamId, SlotDate, StartTime, EndTime, RoomOrBooth, JudgeId, Status], (err, res) => {
                if (err) return reject(err);
                resolve({ success: true, id: res.insertId });
            });
        }
    });
};
const deleteSchedule = (scheduleId) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM project_expo_schedules WHERE Id = ?`;
        db.query(query, [scheduleId], (err) => {
            if (err) return reject(err);
            resolve({ success: true, scheduleId });
        });
    });
};
// EVALUATION CRITERIA & SCORES
const getCriteria = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM project_expo_criteria WHERE EventId = ? ORDER BY DisplayOrder ASC, Id ASC`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) return resolve(rows);
            // Seed default rubrics
            const values = DEFAULT_CRITERIA.map(c => [eventId, c.CriteriaName, c.MaxMarks, c.DisplayOrder]);
            const insertQuery = `INSERT INTO project_expo_criteria (EventId, CriteriaName, MaxMarks, DisplayOrder) VALUES ?`;
            db.query(insertQuery, [values], (insertErr) => {
                if (insertErr) return reject(insertErr);
                db.query(query, [eventId], (err2, rows2) => {
                    if (err2) return reject(err2);
                    resolve(rows2);
                });
            });
        });
    });
};
const saveCriteria = (eventId, criteriaList) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(criteriaList) || criteriaList.length === 0) {
            return reject(new Error('Criteria list must be a non-empty array'));
        }
        db.getConnection(async (connErr, conn) => {
            if (connErr) return reject(connErr);
            try {
                await conn.promise().beginTransaction();
                await conn.promise().query(`DELETE FROM project_expo_criteria WHERE EventId = ?`, [eventId]);
                const values = criteriaList.map((c, idx) => [
                    eventId,
                    c.CriteriaName.trim(),
                    parseInt(c.MaxMarks, 10) || 20,
                    idx + 1
                ]);
                await conn.promise().query(
                    `INSERT INTO project_expo_criteria (EventId, CriteriaName, MaxMarks, DisplayOrder) VALUES ?`,
                    [values]
                );
                await conn.promise().commit();
                conn.release();
                getCriteria(eventId).then(resolve).catch(reject);
            } catch (err) {
                await conn.promise().rollback();
                conn.release();
                reject(err);
            }
        });
    });
};
const getScores = (eventId, teamId = null, judgeId = null) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                sc.*,
                COALESCE(c.CriteriaName, 'Evaluation Criterion') AS CriteriaName,
                COALESCE(c.MaxMarks, 20) AS MaxMarks,
                COALESCE(t.TeamName, CONCAT('Team #', sc.TeamId)) AS TeamName,
                s.ProjectTitle,
                COALESCE(ev.Name, CONCAT('Judge #', sc.JudgeId)) AS JudgeName,
                COALESCE(ev.EventRole, ev.Role, 'Technical Jury') AS JudgeDesignation
            FROM project_expo_scores sc
            LEFT JOIN project_expo_criteria c ON sc.CriteriaId = c.Id
            LEFT JOIN registered_teams t ON sc.TeamId = t.Id
            LEFT JOIN project_expo_submissions s ON s.TeamId = t.Id
            LEFT JOIN evaluators ev ON sc.JudgeId = ev.Id
            WHERE sc.EventId = ?
        `;
        const params = [eventId];
        if (teamId) {
            query += ` AND sc.TeamId = ?`;
            params.push(teamId);
        }
        if (judgeId) {
            query += ` AND sc.JudgeId = ?`;
            params.push(judgeId);
        }
        query += ` ORDER BY sc.CreatedAt DESC`;
        db.query(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const submitScore = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const {
                EventId,
                TeamId,
                JudgeId,
                scores,
                CriteriaId,
                Score,
                Feedback = ''
            } = data;
            if (!EventId || !TeamId || !JudgeId) {
                return reject(new Error('EventId, TeamId, and JudgeId are required.'));
            }
            // Batch mode if scores array is provided
            if (Array.isArray(scores) && scores.length > 0) {
                const query = `
                    INSERT INTO project_expo_scores (EventId, TeamId, JudgeId, CriteriaId, Score, Feedback)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    Score = VALUES(Score),
                    Feedback = VALUES(Feedback)
                `;
                for (const item of scores) {
                    await new Promise((res, rej) => {
                        db.query(query, [
                            EventId,
                            TeamId,
                            JudgeId,
                            item.CriteriaId || item.criteriaId,
                            item.Score !== undefined ? item.Score : item.score !== undefined ? item.score : 0,
                            item.Feedback || item.feedback || Feedback || ''
                        ], (err, r) => {
                            if (err) return rej(err);
                            res(r);
                        });
                    });
                }
                return resolve({ success: true, count: scores.length });
            }
            // Single item mode
            if (!CriteriaId || Score === undefined) {
                return reject(new Error('CriteriaId and Score are required.'));
            }
            const query = `
                INSERT INTO project_expo_scores (EventId, TeamId, JudgeId, CriteriaId, Score, Feedback)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                Score = VALUES(Score),
                Feedback = VALUES(Feedback)
            `;
            db.query(query, [EventId, TeamId, JudgeId, CriteriaId, Score, Feedback], (err, res) => {
                if (err) return reject(err);
                resolve({ success: true });
            });
        } catch (err) {
            reject(err);
        }
    });
};
const getJudges = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                e.Id,
                e.EventId,
                e.Name,
                e.Email,
                e.Username,
                e.Track,
                e.College,
                e.Role,
                COALESCE(e.EventRole, e.Role, 'Technical Evaluator') AS EventRole,
                e.Status,
                e.PlainTextPassword,
                e.CreatedAt,
                (SELECT COUNT(DISTINCT sc.TeamId) FROM project_expo_scores sc WHERE sc.JudgeId = e.Id AND sc.EventId = e.EventId) AS TeamsEvaluatedCount,
                (SELECT COUNT(sc.Id) FROM project_expo_scores sc WHERE sc.JudgeId = e.Id AND sc.EventId = e.EventId) AS TotalScoresSubmitted,
                (SELECT COALESCE(ROUND(AVG(sc.Score), 1), 0) FROM project_expo_scores sc WHERE sc.JudgeId = e.Id AND sc.EventId = e.EventId) AS AvgScoreGiven
            FROM evaluators e
            WHERE e.EventId = ?
            ORDER BY e.Id ASC
        `;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
// RESULTS & RANKINGS
const getRankings = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                t.Id AS TeamId,
                t.TeamName,
                u.UserName AS LeaderName,
                u.Email AS LeaderEmail,
                s.ProjectTitle,
                d.DomainName,
                b.BoothNumber,
                COUNT(DISTINCT sc.JudgeId) AS JudgesEvaluatedCount,
                COALESCE(SUM(sc.Score), 0) AS TotalScore,
                COALESCE(SUM(sc.Score) / NULLIF(COUNT(DISTINCT sc.JudgeId), 0), 0) AS AvgScore
            FROM registered_teams t
            LEFT JOIN users u ON t.TeamLeadUserId = u.Id
            LEFT JOIN project_expo_submissions s ON s.TeamId = t.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            LEFT JOIN project_expo_booths b ON b.AllocatedTeamId = t.Id
            LEFT JOIN project_expo_scores sc ON sc.TeamId = t.Id AND sc.EventId = t.EventId
            WHERE t.EventId = ?
            GROUP BY t.Id, t.TeamName, u.UserName, u.Email, s.ProjectTitle, d.DomainName, b.BoothNumber
            ORDER BY TotalScore DESC, AvgScore DESC
        `;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const getResults = (eventId, onlyPublished = false) => {
    return new Promise((resolve, reject) => {
        let whereClause = `WHERE r.EventId = ?`;
        if (onlyPublished) {
            whereClause += ` AND (r.IsPublished = 1 OR e.PhysicalResultsPublished = 1)`;
        }
        const query = `
            SELECT
                r.*,
                t.TeamName,
                u.UserName AS LeaderName,
                s.ProjectTitle,
                d.DomainName,
                b.BoothNumber
            FROM project_expo_results r
            JOIN registered_teams t ON r.TeamId = t.Id
            JOIN events e ON r.EventId = e.Id
            LEFT JOIN users u ON t.TeamLeadUserId = u.Id
            LEFT JOIN project_expo_submissions s ON s.TeamId = t.Id
            LEFT JOIN project_expo_domains d ON s.DomainId = d.Id
            LEFT JOIN project_expo_booths b ON b.AllocatedTeamId = t.Id
            ${whereClause}
            ORDER BY r.RankPosition ASC, r.TotalScore DESC
            LIMIT 3
        `;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};
const publishResults = (eventId, winnersList, req = null) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(winnersList) || winnersList.length === 0) {
            return reject(new Error('Winners list must be a non-empty array'));
        }
        // Ensure all evaluators have completed scoring for all rounds before declaring winners
        const evaluatorService = require('../evaluators/evaluatorService');
        evaluatorService.getEventResults(eventId, 'Physical', (checkErr, checkData) => {
            if (checkErr) return reject(checkErr);
            if (!checkData || !checkData.isOverallPublishReady) {
                const pendingNames = (checkData?.overallPendingRounds || []).map(r => r.roundName).join(', ');
                return reject(new Error(`Cannot declare official winners: All evaluators must finish scoring all teams in every round first. Incomplete rounds: ${pendingNames || 'all'}.`));
            }

            db.getConnection(async (connErr, conn) => {
                if (connErr) return reject(connErr);
                try {
                    await conn.promise().beginTransaction();
                    // Clear previous results
                    await conn.promise().query(`DELETE FROM project_expo_results WHERE EventId = ?`, [eventId]);
                    const values = winnersList.map((w, idx) => [
                        eventId,
                        w.TeamId,
                        w.Category || 'Excellence Award',
                        w.RankPosition || (idx + 1),
                        parseFloat(w.TotalScore) || 0.00,
                        w.PrizeAmount || null,
                        1,
                        new Date()
                    ]);
                    await conn.promise().query(
                        `INSERT INTO project_expo_results
                         (EventId, TeamId, Category, RankPosition, TotalScore, PrizeAmount, IsPublished, PublishedAt)
                         VALUES ?`,
                        [values]
                    );
                    // Update Expo Config lifecycle status to RESULTS_PUBLISHED and sync event PhysicalResultsPublished
                    await conn.promise().query(
                        `UPDATE project_expo_configs SET Status = 'RESULTS_PUBLISHED' WHERE EventId = ?`,
                        [eventId]
                    );
                    await conn.promise().query(
                        `UPDATE events SET PhysicalResultsPublished = 1 WHERE Id = ?`,
                        [eventId]
                    );
                    await conn.promise().commit();
                    conn.release();
                    recordMutation({
                        actorUserId: req?.user?.Id || req?.user?.id || null,
                        actorEmail: req?.user?.Email || req?.user?.email || req?.user?.UserName || 'system@ayojan.in',
                        actorRole: req?.user?.role || 'admin',
                        eventId,
                        action: 'PUBLISH_RESULTS',
                        module: 'PROJECT_EXPO',
                        entityType: 'RESULTS',
                        entityId: eventId,
                        previousValue: { status: 'EVALUATION_COMPLETED', isPublished: false },
                        newValue: { status: 'RESULTS_PUBLISHED', isPublished: true, winnersCount: winnersList.length },
                        req
                    });
                    // Trigger notifications to winners
                    winnersList.forEach((w) => {
                        db.query(
                            `SELECT t.TeamLeadUserId AS LeaderId, e.EventName
                             FROM registered_teams t
                             JOIN events e ON t.EventId = e.Id
                             WHERE t.Id = ?`,
                            [w.TeamId],
                            (err, rows) => {
                                if (!err && rows && rows.length > 0) {
                                    const { LeaderId, EventName } = rows[0];
                                    if (LeaderId) {
                                        createNotification({
                                            UserId: LeaderId,
                                            Title: `Congratulations! ${w.Category}`,
                                            Message: `Your team won ${w.Category} in ${EventName}! Check out the published results.`,
                                            Type: 'SUCCESS',
                                            LinkUrl: `/user/teamInfo/${w.TeamId}`
                                        }).catch(() => {});
                                    }
                                }
                            }
                        );
                    });
                    getResults(eventId).then(resolve).catch(reject);
                } catch (err) {
                    await conn.promise().rollback();
                    conn.release();
                    reject(err);
                }
            });
        });
    });
};
module.exports = {
    getConfig,
    saveConfig,
    updateStatus,
    getDomains,
    saveDomains,
    getSubmissions,
    getSubmissionByTeam,
    upsertSubmission,
    reviewSubmission,
    getBooths,
    batchGenerateBooths,
    allocateBooth,
    deallocateBooth,
    deleteBooth,
    getSchedules,
    upsertSchedule,
    deleteSchedule,
    getCriteria,
    saveCriteria,
    getScores,
    submitScore,
    getJudges,
    getRankings,
    getResults,
    publishResults
};
