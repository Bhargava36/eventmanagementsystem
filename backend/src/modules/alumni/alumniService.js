const db = require('../../config/db');
const { sendMail } = require('../../config/mailer');

/**
 * Get Alumni Config for an event
 */
const getConfig = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM alumni_configs WHERE EventId = ?`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                return resolve(rows[0]);
            }
            // Return defaults if not configured yet
            return resolve({
                EventId: eventId,
                TargetBatches: '2015,2016,2017,2018,2019,2020,2021,2022,2023,2024',
                AllowGuests: 1,
                MaxGuests: 1,
                VenueHall: 'Main Campus Auditorium & Lawns',
                DressCode: 'Smart Casual / Traditional',
                WelcomeNote: 'Welcome back home! We are thrilled to celebrate your journey and reconnect.',
                AlumniFundLink: ''
            });
        });
    });
};

/**
 * Save / Update Alumni Config
 */
const saveConfig = (eventId, data) => {
    return new Promise((resolve, reject) => {
        const {
            TargetBatches,
            AllowGuests,
            MaxGuests,
            VenueHall,
            DressCode,
            WelcomeNote,
            AlumniFundLink
        } = data;

        const query = `
            INSERT INTO alumni_configs 
            (EventId, TargetBatches, AllowGuests, MaxGuests, VenueHall, DressCode, WelcomeNote, AlumniFundLink)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            TargetBatches = VALUES(TargetBatches),
            AllowGuests = VALUES(AllowGuests),
            MaxGuests = VALUES(MaxGuests),
            VenueHall = VALUES(VenueHall),
            DressCode = VALUES(DressCode),
            WelcomeNote = VALUES(WelcomeNote),
            AlumniFundLink = VALUES(AlumniFundLink)
        `;

        db.query(
            query,
            [
                eventId,
                TargetBatches || '',
                AllowGuests === false ? 0 : 1,
                MaxGuests || 1,
                VenueHall || 'Main Campus Auditorium & Lawns',
                DressCode || 'Smart Casual / Traditional',
                WelcomeNote || '',
                AlumniFundLink || ''
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve({ success: true, result });
            }
        );
    });
};

/**
 * Get Agenda / Activities for an Alumni Meet
 */
const getAgenda = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM alumni_sessions WHERE EventId = ? ORDER BY OrderIndex ASC, StartTime ASC`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Create Agenda Session
 */
const createAgenda = (eventId, data) => {
    return new Promise((resolve, reject) => {
        const {
            SessionTitle,
            SessionDate,
            StartTime,
            EndTime,
            SpeakerName,
            VenueHall,
            Description,
            OrderIndex
        } = data;

        const query = `
            INSERT INTO alumni_sessions 
            (EventId, SessionTitle, SessionDate, StartTime, EndTime, SpeakerName, VenueHall, Description, OrderIndex)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [
                eventId,
                SessionTitle,
                SessionDate || null,
                StartTime,
                EndTime || '',
                SpeakerName || '',
                VenueHall || 'Main Auditorium',
                Description || '',
                OrderIndex || 0
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve({ Id: result.insertId, ...data });
            }
        );
    });
};

/**
 * Update Agenda Session
 */
const updateAgenda = (sessionId, data) => {
    return new Promise((resolve, reject) => {
        const {
            SessionTitle,
            SessionDate,
            StartTime,
            EndTime,
            SpeakerName,
            VenueHall,
            Description,
            OrderIndex
        } = data;

        const query = `
            UPDATE alumni_sessions SET
            SessionTitle = ?, SessionDate = ?, StartTime = ?, EndTime = ?,
            SpeakerName = ?, VenueHall = ?, Description = ?, OrderIndex = ?
            WHERE Id = ?
        `;

        db.query(
            query,
            [
                SessionTitle,
                SessionDate || null,
                StartTime,
                EndTime || '',
                SpeakerName || '',
                VenueHall || 'Main Auditorium',
                Description || '',
                OrderIndex || 0,
                sessionId
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve({ success: true, result });
            }
        );
    });
};

/**
 * Delete Agenda Session
 */
const deleteAgenda = (sessionId) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM alumni_sessions WHERE Id = ?`, [sessionId], (err, result) => {
            if (err) return reject(err);
            resolve({ success: true, result });
        });
    });
};

/**
 * Get Distinguished Alumni Speakers
 */
const getSpeakers = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM alumni_speakers WHERE EventId = ? ORDER BY OrderIndex ASC, Id ASC`;
        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Create Alumni Speaker
 */
const createSpeaker = (eventId, data) => {
    return new Promise((resolve, reject) => {
        const {
            Name,
            GraduationYear,
            Branch,
            Designation,
            Company,
            Topic,
            Bio,
            PhotoUrl,
            LinkedinUrl,
            OrderIndex
        } = data;

        const query = `
            INSERT INTO alumni_speakers 
            (EventId, Name, GraduationYear, Branch, Designation, Company, Topic, Bio, PhotoUrl, LinkedinUrl, OrderIndex)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [
                eventId,
                Name,
                GraduationYear || '',
                Branch || '',
                Designation || '',
                Company || '',
                Topic || '',
                Bio || '',
                PhotoUrl || null,
                LinkedinUrl || '',
                OrderIndex || 0
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve({ Id: result.insertId, ...data });
            }
        );
    });
};

/**
 * Update Alumni Speaker
 */
const updateSpeaker = (speakerId, data) => {
    return new Promise((resolve, reject) => {
        const {
            Name,
            GraduationYear,
            Branch,
            Designation,
            Company,
            Topic,
            Bio,
            PhotoUrl,
            LinkedinUrl,
            OrderIndex
        } = data;

        const query = `
            UPDATE alumni_speakers SET
            Name = ?, GraduationYear = ?, Branch = ?, Designation = ?, Company = ?,
            Topic = ?, Bio = ?, PhotoUrl = ?, LinkedinUrl = ?, OrderIndex = ?
            WHERE Id = ?
        `;

        db.query(
            query,
            [
                Name,
                GraduationYear || '',
                Branch || '',
                Designation || '',
                Company || '',
                Topic || '',
                Bio || '',
                PhotoUrl || null,
                LinkedinUrl || '',
                OrderIndex || 0,
                speakerId
            ],
            (err, result) => {
                if (err) return reject(err);
                resolve({ success: true, result });
            }
        );
    });
};

/**
 * Delete Alumni Speaker
 */
const deleteSpeaker = (speakerId) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM alumni_speakers WHERE Id = ?`, [speakerId], (err, result) => {
            if (err) return reject(err);
            resolve({ success: true, result });
        });
    });
};

/**
 * Get All Registered Alumni for an Event
 * Directly utilizes existing registered_teams + users!
 */
const getRegistrations = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                rt.Id AS TeamId,
                rt.EventId,
                rt.TeamName,
                rt.GraduationYear,
                rt.CurrentCompany,
                rt.Designation,
                rt.City,
                rt.LinkedinUrl,
                rt.GuestCount,
                rt.GuestNames,
                COALESCE(rt.RsvpStatus, 'ATTENDING') AS RsvpStatus,
                COALESCE(rt.GateCheckInStatus, 'Registered') AS GateCheckInStatus,
                rt.GateCheckInTime,
                COALESCE(rt.FoodTokenScanned, 0) AS FoodTokenScanned,
                rt.FoodScannedTime,
                rt.CreatedAt,
                u.Id AS UserId,
                u.UserName,
                u.Email,
                u.Mobile,
                u.Photo,
                u.College
            FROM registered_teams rt
            LEFT JOIN users u ON u.Id = rt.TeamLeadUserId
            WHERE rt.EventId = ?
            ORDER BY rt.CreatedAt DESC
        `;

        db.query(query, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Register Alumnus RSVP
 * Directly writes to registered_teams, registered_team_members, and event_registrations!
 */
const registerAlumnus = async (eventId, userId, data) => {
    return new Promise((resolve, reject) => {
        const {
            GraduationYear,
            Branch,
            CurrentCompany,
            Designation,
            City,
            LinkedinUrl,
            GuestCount = 0,
            GuestNames = '',
            RsvpStatus = 'ATTENDING'
        } = data;

        // Fetch user info for TeamName
        db.query(`SELECT * FROM users WHERE Id = ?`, [userId], (err, uRows) => {
            if (err) return reject(err);
            const userObj = uRows[0] || {};
            const teamName = `Alumnus - ${userObj.UserName || 'Alumni Member'}`;

            // Check if user already registered for this event in registered_teams
            const checkQuery = `SELECT Id FROM registered_teams WHERE EventId = ? AND TeamLeadUserId = ?`;
            db.query(checkQuery, [eventId, userId], (chkErr, chkRows) => {
                if (chkErr) return reject(chkErr);

                if (chkRows.length > 0) {
                    // Update existing
                    const existingTeamId = chkRows[0].Id;
                    const updateQuery = `
                        UPDATE registered_teams SET
                        GraduationYear = ?,
                        CurrentCompany = ?,
                        Designation = ?,
                        City = ?,
                        LinkedinUrl = ?,
                        GuestCount = ?,
                        GuestNames = ?,
                        RsvpStatus = ?
                        WHERE Id = ?
                    `;
                    db.query(
                        updateQuery,
                        [
                            GraduationYear || '',
                            CurrentCompany || '',
                            Designation || '',
                            City || '',
                            LinkedinUrl || '',
                            GuestCount || 0,
                            GuestNames || '',
                            RsvpStatus || 'ATTENDING',
                            existingTeamId
                        ],
                        (updErr) => {
                            if (updErr) return reject(updErr);
                            resolve({ success: true, teamId: existingTeamId, updated: true });
                        }
                    );
                } else {
                    // Insert into registered_teams
                    const insertTeam = `
                        INSERT INTO registered_teams 
                        (TeamName, TeamLeadUserId, TeamSize, College, State, EventId, 
                         GraduationYear, CurrentCompany, Designation, City, LinkedinUrl, GuestCount, GuestNames, RsvpStatus)
                        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertTeam,
                        [
                            teamName,
                            userId,
                            userObj.College || 'College of Engineering',
                            userObj.State || City || 'India',
                            eventId,
                            GraduationYear || '',
                            CurrentCompany || '',
                            Designation || '',
                            City || '',
                            LinkedinUrl || '',
                            GuestCount || 0,
                            GuestNames || '',
                            RsvpStatus || 'ATTENDING'
                        ],
                        (insErr, insRes) => {
                            if (insErr) return reject(insErr);
                            const newTeamId = insRes.insertId;

                            // Insert into registered_team_members
                            const insertMember = `
                                INSERT INTO registered_team_members 
                                (UserId, TeamId, Role, MemberName, MemberEmail, MemberCollege)
                                VALUES (?, ?, 'TeamLead', ?, ?, ?)
                            `;
                            db.query(
                                insertMember,
                                [
                                    userId,
                                    newTeamId,
                                    userObj.UserName || 'Alumnus',
                                    userObj.Email || '',
                                    userObj.College || ''
                                ],
                                () => {}
                            );

                            // Insert into event_registrations
                            const insertReg = `
                                INSERT INTO event_registrations 
                                (EventId, TeamId, ParticipationMode, Status)
                                VALUES (?, ?, 'Physical', 'approved')
                                ON DUPLICATE KEY UPDATE Status = 'approved'
                            `;
                            db.query(insertReg, [eventId, newTeamId], () => {});

                            resolve({ success: true, teamId: newTeamId, created: true });
                        }
                    );
                }
            });
        });
    });
};

/**
 * Gate Check-in for Alumnus (Live QR Scanner)
 */
const checkInAlumnus = (eventId, payload) => {
    return new Promise((resolve, reject) => {
        const { teamId, userId, qrData } = payload;

        let query = '';
        let params = [];

        if (teamId) {
            query = `
                UPDATE registered_teams 
                SET GateCheckInStatus = 'CheckedIn', GateCheckInTime = NOW() 
                WHERE Id = ? AND EventId = ?
            `;
            params = [teamId, eventId];
        } else if (userId) {
            query = `
                UPDATE registered_teams 
                SET GateCheckInStatus = 'CheckedIn', GateCheckInTime = NOW() 
                WHERE TeamLeadUserId = ? AND EventId = ?
            `;
            params = [userId, eventId];
        } else {
            return reject(new Error('teamId or userId required for check-in'));
        }

        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) {
                return reject(new Error('No matching registration found for check-in'));
            }

            // Fetch updated record
            const selectQuery = `
                SELECT rt.*, u.UserName, u.Email 
                FROM registered_teams rt
                JOIN users u ON u.Id = rt.TeamLeadUserId
                WHERE ${teamId ? 'rt.Id = ?' : 'rt.TeamLeadUserId = ?'} AND rt.EventId = ?
            `;
            db.query(selectQuery, [teamId || userId, eventId], (sErr, sRows) => {
                if (sErr) return reject(sErr);
                resolve({ success: true, alumnus: sRows[0] });
            });
        });
    });
};

/**
 * Banquet / Food Token Scanner
 */
const scanFoodToken = (eventId, payload) => {
    return new Promise((resolve, reject) => {
        const { teamId, userId } = payload;

        let query = '';
        let params = [];

        if (teamId) {
            query = `
                UPDATE registered_teams 
                SET FoodTokenScanned = 1, FoodScannedTime = NOW() 
                WHERE Id = ? AND EventId = ?
            `;
            params = [teamId, eventId];
        } else if (userId) {
            query = `
                UPDATE registered_teams 
                SET FoodTokenScanned = 1, FoodScannedTime = NOW() 
                WHERE TeamLeadUserId = ? AND EventId = ?
            `;
            params = [userId, eventId];
        } else {
            return reject(new Error('teamId or userId required for food scan'));
        }

        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) {
                return reject(new Error('Registration not found or already verified'));
            }
            resolve({ success: true, message: 'Food token scanned and validated successfully' });
        });
    });
};

/**
 * Send Batch Invitations (Email / Dispatch)
 */
const sendBatchInvites = async (eventId, { subject, message, targetBatches }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Find past users / alumni in our database
            const query = `SELECT Id, UserName, Email FROM users WHERE Email IS NOT NULL AND Email != '' LIMIT 50`;
            db.query(query, async (err, users) => {
                if (err) return reject(err);

                let sentCount = 0;
                for (const u of users) {
                    try {
                        await sendMail({
                            to: u.Email,
                            subject: subject || 'Official Invitation: Annual Alumni Meet 2026',
                            text: message || `Dear ${u.UserName},\n\nYou are cordially invited to the Annual Alumni Meet. Please RSVP at our website.`
                        });
                        sentCount++;
                    } catch (e) {
                        // continue
                    }
                }

                resolve({ success: true, sentCount, totalTargeted: users.length });
            });
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Memories & Gallery
 */
const getMemories = (eventId) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM alumni_memories WHERE EventId = ? ORDER BY CreatedAt DESC`, [eventId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const createMemory = (eventId, { Title, MediaUrl, BatchYear, UploadedBy }) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO alumni_memories (EventId, Title, MediaUrl, BatchYear, UploadedBy) VALUES (?, ?, ?, ?, ?)`;
        db.query(query, [eventId, Title, MediaUrl, BatchYear || '', UploadedBy || 'Alumni Member'], (err, result) => {
            if (err) return reject(err);
            resolve({ Id: result.insertId, Title, MediaUrl, BatchYear });
        });
    });
};

const deleteMemory = (memoryId) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM alumni_memories WHERE Id = ?`, [memoryId], (err, result) => {
            if (err) return reject(err);
            resolve({ success: true });
        });
    });
};

module.exports = {
    getConfig,
    saveConfig,
    getAgenda,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    getSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    getRegistrations,
    registerAlumnus,
    checkInAlumnus,
    scanFoodToken,
    sendBatchInvites,
    getMemories,
    createMemory,
    deleteMemory
};

