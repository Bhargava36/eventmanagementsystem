const db = require('../../config/db');

const createTeam = (TeamName, TeamLeadEmail, TeamSize, EventId, MemberEmails, ParticipationModeOrCallback, leadPhotoOrCallback, callbackArg) => {
    let ParticipationMode = null;
    let leadPhoto = null;
    let callback = null;

    if (typeof ParticipationModeOrCallback === 'function') {
        callback = ParticipationModeOrCallback;
    } else {
        ParticipationMode = typeof ParticipationModeOrCallback === 'string' ? ParticipationModeOrCallback : null;
        if (typeof leadPhotoOrCallback === 'function') {
            callback = leadPhotoOrCallback;
        } else {
            leadPhoto = typeof leadPhotoOrCallback === 'string' ? leadPhotoOrCallback : null;
            callback = callbackArg;
        }
    }

    if (!TeamName || !TeamLeadEmail || !TeamSize || !EventId) {
        const err = new Error('TeamName, TeamLeadEmail, TeamSize, and EventId are required');
        err.status = 400;
        return callback(err, null);
    }

    const leadEmailClean = String(TeamLeadEmail).trim().toLowerCase();
    const rawMembers = Array.isArray(MemberEmails) ? MemberEmails : [];
    const memberDetails = rawMembers.map((m) => {
        if (typeof m === 'string') {
            const email = m.trim().toLowerCase();
            return email ? { Name: '', Email: email, College: '', State: '', Gender: 'Male', Photo: null } : null;
        } else if (m && typeof m === 'object') {
            const email = (m.Email || m.email || '').trim().toLowerCase();
            return email ? {
                Name: (m.Name || m.UserName || m.name || '').trim(),
                Email: email,
                College: (m.College || m.college || '').trim(),
                State: (m.State || m.state || '').trim(),
                Gender: (m.Gender || m.gender || 'Male'),
                Photo: (m.Photo || m.photo || '').trim() || null
            } : null;
        }
        return null;
    }).filter(Boolean);

    const memberEmailsClean = memberDetails.map((m) => m.Email);

    // Check duplicate emails in the form submission
    const allEmails = [leadEmailClean, ...memberEmailsClean];
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== allEmails.length) {
        const err = new Error('Duplicate emails detected. Each team member (including Team Lead) must have a unique email.');
        err.status = 400;
        return callback(err, null);
    }

    // 1. Fetch Event and validate registration status & team size rules
    const eventQuery = `SELECT EventName, TeamSize, EventStatus, RegistrationEnd, VirtualRegistrationEnd, PhysicalRegistrationEnd, VirtualRegistrationOpen, PhysicalRegistrationOpen, RegistrationOpen FROM events WHERE Id = ?`;
    db.query(eventQuery, [EventId], (err, eventRows) => {
        if (err) return callback(err, null);
        if (!eventRows || eventRows.length === 0) {
            const errEv = new Error(`Event with ID ${EventId} not found.`);
            errEv.status = 404;
            return callback(errEv, null);
        }

        const ev = eventRows[0];

        // Check if registration is paused by admin
        if (ParticipationMode === 'Virtual' && (ev.VirtualRegistrationOpen === 0 || ev.VirtualRegistrationOpen === false)) {
            const errPaused = new Error(`Registration for the Virtual track is currently paused by the event admin.`);
            errPaused.status = 403;
            return callback(errPaused, null);
        }
        if (ParticipationMode === 'Physical' && (ev.PhysicalRegistrationOpen === 0 || ev.PhysicalRegistrationOpen === false)) {
            const errPaused = new Error(`Registration for the Physical track is currently paused by the event admin.`);
            errPaused.status = 403;
            return callback(errPaused, null);
        }
        if (ev.RegistrationOpen === 0 || ev.RegistrationOpen === false) {
            const errPaused = new Error(`Registration for event "${ev.EventName}" is currently paused by the event admin.`);
            errPaused.status = 403;
            return callback(errPaused, null);
        }

        // Validate Team Size against Admin Event Requirement
        let minSize = 1;
        let maxSize = 1;
        const rawTs = String(ev.TeamSize || '').trim().toLowerCase();
        
        if (rawTs === '1' || rawTs === 'solo' || rawTs === 'individual' || rawTs === '1-1' || rawTs.startsWith('1 member')) {
            minSize = 1;
            maxSize = 1;
        } else {
            const rangeMatch = rawTs.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
            if (rangeMatch) {
                const p1 = parseInt(rangeMatch[1], 10);
                const p2 = parseInt(rangeMatch[2], 10);
                if (!isNaN(p1) && !isNaN(p2) && p1 > 0 && p2 >= p1) {
                    minSize = p1;
                    maxSize = p2;
                }
            } else {
                const singleMatch = rawTs.match(/\b(\d+)\b/);
                if (singleMatch) {
                    const num = parseInt(singleMatch[1], 10);
                    if (!isNaN(num) && num > 0) {
                        minSize = num;
                        maxSize = num;
                    }
                } else {
                    minSize = 2;
                    maxSize = 4;
                }
            }
        }

        const requestedSize = Number(TeamSize);
        if (isNaN(requestedSize) || requestedSize < minSize || requestedSize > maxSize) {
            const sizeDesc = minSize === maxSize 
                ? (minSize === 1 ? '1 member (Individual / Solo)' : `${minSize} members`) 
                : `${minSize}-${maxSize} members`;
            const errSize = new Error(`Invalid team size. Event "${ev.EventName}" strictly requires ${sizeDesc}.`);
            errSize.status = 400;
            return callback(errSize, null);
        }

        // Total team formation count (1 Team Lead + memberEmails) MUST match requested size
        const totalMembers = 1 + memberEmailsClean.length;
        if (totalMembers !== requestedSize) {
            const neededOther = requestedSize - 1;
            const providedOther = memberEmailsClean.length;
            const errCount = new Error(
                `Team formation failed: Event requires exactly ${requestedSize} members. You must provide 1 Team Lead and ${neededOther} team member email(s). (Currently provided: ${providedOther} member(s))`
            );
            errCount.status = 400;
            return callback(errCount, null);
        }

        // 2. Fetch Team Lead User
        const leadQuery = `SELECT Id, UserName, Email, College, State, Gender, Photo FROM users WHERE LOWER(Email) = ? LIMIT 1`;
        db.query(leadQuery, [leadEmailClean], (err, leadRows) => {
            if (err) return callback(err, null);
            if (!leadRows || leadRows.length === 0) {
                const errNotFound = new Error(`Team Lead email "${TeamLeadEmail}" is not registered in EMS.`);
                errNotFound.status = 404;
                return callback(errNotFound, null);
            }

            const leader = leadRows[0];

            // 2. Check if Team Lead is ALREADY registered in this Event for the same track
            const checkLeadRegQuery = `
                SELECT t.TeamName, u.Email, u.UserName, er.ParticipationMode
                FROM registered_team_members tm
                INNER JOIN registered_teams t ON tm.TeamId = t.Id
                INNER JOIN users u ON tm.UserId = u.Id
                LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
                WHERE t.EventId = ? AND tm.UserId = ?
            `;
            db.query(checkLeadRegQuery, [EventId, leader.Id], (err, existingLeadReg) => {
                if (err) return callback(err, null);
                if (existingLeadReg && existingLeadReg.length > 0) {
                    const leadConflict = existingLeadReg.find((r) => {
                        if (!ParticipationMode) return true;
                        if (!r.ParticipationMode) return true;
                        return r.ParticipationMode.toLowerCase() === ParticipationMode.toLowerCase();
                    });
                    if (leadConflict) {
                        const trackText = ParticipationMode ? `for the ${ParticipationMode} track of` : 'for';
                        const errAlready = new Error(
                            `Team Lead (${leader.Email}) is already registered ${trackText} this event in team "${leadConflict.TeamName}". A participant can only register once per track.`
                        );
                        errAlready.status = 400;
                        return callback(errAlready, null);
                    }
                }

                // 3. Process team members (both EMS users and outside participants)
                const checkAndProceedWithMembers = (foundUsersMap) => {
                    const membersList = memberDetails.map((m) => {
                        const u = foundUsersMap.get(m.Email);
                        return {
                            UserId: u ? u.Id : null,
                            Name: u ? (u.UserName || m.Name) : m.Name,
                            Email: m.Email,
                            College: u ? (u.College || m.College) : m.College,
                            State: u ? (u.State || m.State) : m.State,
                            Gender: u ? (u.Gender || m.Gender || 'Male') : (m.Gender || 'Male'),
                            Photo: m.Photo || (u ? u.Photo : null) || null
                        };
                    });

                    const memberUserIds = membersList.filter((m) => m.UserId).map((m) => m.UserId);
                    const allMemberEmails = membersList.map((m) => m.Email);

                    if (membersList.length > 0) {
                        let checkMemberRegQuery = `
                            SELECT t.TeamName, tm.MemberEmail, u.Email, u.UserName, er.ParticipationMode
                            FROM registered_team_members tm
                            INNER JOIN registered_teams t ON tm.TeamId = t.Id
                            LEFT JOIN users u ON tm.UserId = u.Id
                            LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
                            WHERE t.EventId = ? AND (
                        `;
                        const queryParams = [EventId];
                        if (memberUserIds.length > 0) {
                            checkMemberRegQuery += ` tm.UserId IN (?) OR LOWER(tm.MemberEmail) IN (?) ) `;
                            queryParams.push(memberUserIds, allMemberEmails);
                        } else {
                            checkMemberRegQuery += ` LOWER(tm.MemberEmail) IN (?) ) `;
                            queryParams.push(allMemberEmails);
                        }

                        db.query(checkMemberRegQuery, queryParams, (err, existingMemberReg) => {
                            if (err) return callback(err, null);
                            if (existingMemberReg && existingMemberReg.length > 0) {
                                const memberConflict = existingMemberReg.find((r) => {
                                    if (!ParticipationMode) return true;
                                    if (!r.ParticipationMode) return true;
                                    return r.ParticipationMode.toLowerCase() === ParticipationMode.toLowerCase();
                                });
                                if (memberConflict) {
                                    const trackText = ParticipationMode ? `for the ${ParticipationMode} track of` : 'for';
                                    const conflictEmail = memberConflict.Email || memberConflict.MemberEmail;
                                    const errMemAlready = new Error(
                                        `Team member (${conflictEmail}) is already registered ${trackText} this event in team "${memberConflict.TeamName}". A participant can only register once per track.`
                                    );
                                    errMemAlready.status = 400;
                                    return callback(errMemAlready, null);
                                }
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

                        const finalLeadPhoto = leadPhoto || leader.Photo || null;
                        // Insert Team Lead into registered_team_members
                        const memberInserts = [
                            [leader.Id, newTeamId, 'TeamLead', leader.Gender || 'Male', leader.UserName || '', leader.Email, leader.College || '', leader.State || '', finalLeadPhoto]
                        ];

                        // Insert other members into registered_team_members (whether they have a UserId or are external)
                        for (const m of membersList) {
                            memberInserts.push([
                                m.UserId || null,
                                newTeamId,
                                'TeamMember',
                                m.Gender || 'Male',
                                m.Name || '',
                                m.Email,
                                m.College || '',
                                m.State || '',
                                m.Photo || null
                            ]);
                        }

                        const insertMembersSql = `
                            INSERT INTO registered_team_members (UserId, TeamId, Role, Gender, MemberName, MemberEmail, MemberCollege, MemberState, Photo)
                            VALUES ?
                        `;
                        db.query(insertMembersSql, [memberInserts], (err) => {
                            if (err) return callback(err, null);
                            return callback(null, { teamId: newTeamId });
                        });
                    });
                };

                if (memberEmailsClean.length > 0) {
                    const membersQuery = `SELECT Id, UserName, Email, College, State, Gender, Photo FROM users WHERE LOWER(Email) IN (?)`;
                    db.query(membersQuery, [memberEmailsClean], (err, memberRows) => {
                        if (err) return callback(err, null);
                        const foundUsersMap = new Map();
                        (memberRows || []).forEach((u) => {
                            foundUsersMap.set(u.Email.toLowerCase(), u);
                        });
                        checkAndProceedWithMembers(foundUsersMap);
                    });
                } else {
                    checkAndProceedWithMembers(new Map());
                }
            });
        });
    });
};

const getAllTeams = (callback) => {
    const query = `SELECT t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, e.EventName, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus FROM registered_teams t LEFT JOIN events e ON t.EventId = e.Id ORDER BY t.Id DESC`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getTeamById = (id, callback) => {
    const query = `
        SELECT 
            t.Id, t.TeamName, t.TeamLeadUserId, t.TeamSize, t.College, t.State, t.EventId, t.CreatedAt, 
            e.EventName, e.Description, e.Highlights, e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus, 
            e.Posters, e.PrimaryColor, e.SecondaryColor, e.TertiaryColor, e.PrimaryTextColor, e.SecondaryTextColor, e.TertiaryTextColor,
            e.HackathonMode, e.Facilities, e.Requirements, e.TeamSize AS EventTeamSize,
            e.PhysicalResultsPublished, e.VirtualResultsPublished,
            e.IdCardBackground, e.TeamCardBackground,
            er.ParticipationMode, er.Status AS RegistrationStatus 
        FROM registered_teams t 
        LEFT JOIN events e ON t.EventId = e.Id 
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId 
        WHERE t.Id = ? 
        LIMIT 1
    `;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (result.length === 0) {
            return callback(null, []);
        }

        const teamRaw = result[0];
        const memberQuery = `
            SELECT 
                tm.Id AS TeamMemberId,
                tm.UserId, 
                tm.Role, 
                COALESCE(NULLIF(tm.Gender, ''), u.Gender, 'Male') AS Gender, 
                tm.CreatedAt, 
                COALESCE(tm.Photo, u.Photo, '') AS Photo, 
                COALESCE(NULLIF(tm.MemberName, ''), u.UserName, 'Member') AS UserName, 
                COALESCE(NULLIF(tm.MemberEmail, ''), u.Email, '') AS Email, 
                COALESCE(NULLIF(tm.MemberCollege, ''), u.College, '') AS College, 
                COALESCE(NULLIF(tm.MemberState, ''), u.State, '') AS State,
                alloc.RoomId,
                acc.room_num AS RoomNumber,
                block.BlockName,
                block.Gender AS BlockGender,
                (alloc.RoomId IS NOT NULL) AS IsAllocated,
                idCard.IdCardNumber
            FROM registered_team_members tm 
            LEFT JOIN users u ON tm.UserId = u.Id 
            LEFT JOIN accommodation_allocations alloc ON alloc.EventId = ? AND alloc.UserId = tm.UserId
            LEFT JOIN Accommodation acc ON acc.Id = alloc.RoomId
            LEFT JOIN accommodation_blocks block ON block.Id = acc.BlockId
            LEFT JOIN participant_id_cards idCard ON idCard.EventId = ? AND idCard.UserId = tm.UserId
            WHERE tm.TeamId = ? 
            ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, UserName
        `;
        db.query(memberQuery, [teamRaw.EventId, teamRaw.EventId, id], (mErr, memberResult) => {
            const members = mErr ? [] : (memberResult || []);

            const prefSql = `SELECT AccommodationRequested, FoodAccepted, BookingStatus, TotalAmount, PaymentRefId FROM physical_team_preferences WHERE TeamId = ? AND EventId = ? LIMIT 1`;
            db.query(prefSql, [id, teamRaw.EventId], (pErr, prefRows) => {
                const pref = prefRows?.[0] || null;
                const allocatedMembers = members.filter((m) => m.IsAllocated);

                let accommodationStatus = 'Not configured';
                if (allocatedMembers.length > 0) {
                    const distinctRooms = [...new Set(allocatedMembers.map((m) => m.RoomNumber).filter(Boolean))];
                    accommodationStatus = `Allocated: Room ${distinctRooms.join(', ')} (${allocatedMembers.length}/${members.length} members)`;
                } else if (pref?.AccommodationRequested) {
                    accommodationStatus = pref.BookingStatus === 'Approved' ? 'Approved (Awaiting Room Assignment)' : `${pref.BookingStatus} Approval`;
                } else {
                    accommodationStatus = 'Not Requested';
                }

                let foodStatus = 'Not configured';
                if (pref?.FoodAccepted) {
                    foodStatus = pref.BookingStatus === 'Approved' ? 'Approved (Dining Pass Active)' : `${pref.BookingStatus} Approval`;
                } else {
                    foodStatus = 'Not Requested';
                }

                // Count total registrations for this event
                const countSql = `SELECT COUNT(*) AS totalRegistrations FROM registered_teams WHERE EventId = ?`;
                db.query(countSql, [teamRaw.EventId], (cErr, countRows) => {
                    const totalRegistrations = countRows?.[0]?.totalRegistrations || 0;
                    const teamData = { 
                        ...teamRaw, 
                        members,
                        AccommodationStatus: accommodationStatus,
                        FoodStatus: foodStatus,
                        totalEventRegistrations: totalRegistrations
                    };
                    return callback(null, [teamData]);
                });
            });
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

const getMembersCount = (callback) => {
    const query = `
        SELECT 
            COUNT(*) AS totalMembersCount,
            COUNT(DISTINCT LOWER(MemberEmail)) AS uniqueMembersCount,
            COALESCE((
                SELECT COUNT(DISTINCT tm.Id) 
                FROM registered_team_members tm 
                JOIN event_registrations er ON tm.TeamId = er.TeamId
            ), 0) AS registeredMembersCount
        FROM registered_team_members
    `;
    db.query(query, (err, result) => {
        if (err) return callback(err, null);
        return callback(null, result[0]);
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
    const getUserSql = `SELECT Id, Email FROM users WHERE Id = ? LIMIT 1`;
    db.query(getUserSql, [userId], (uErr, uRows) => {
        const userEmail = (uRows && uRows.length > 0 && uRows[0].Email) ? uRows[0].Email.toLowerCase() : null;

        // Auto-link any team memberships by email that didn't have UserId set
        if (userEmail) {
            const linkSql = `UPDATE registered_team_members SET UserId = ? WHERE LOWER(MemberEmail) = ? AND UserId IS NULL`;
            db.query(linkSql, [userId, userEmail], () => {
                runQuery();
            });
        } else {
            runQuery();
        }

        function runQuery() {
            const query = `
                SELECT DISTINCT 
                    registered_teams.Id AS TeamId, 
                    registered_teams.TeamName, 
                    registered_teams.TeamSize, 
                    registered_teams.EventId, 
                    registered_teams.College, 
                    registered_teams.State, 
                    events.EventName, 
                    events.StartDate, 
                    events.EndDate, 
                    events.TeamSize AS EventTeamSize,
                    registered_team_members.Role, 
                    event_registrations.Id AS RegistrationId, 
                    event_registrations.Status AS RegistrationStatus, 
                    event_registrations.ParticipationMode,
                    events.VirtualStatus,
                    events.VirtualMeetUrl,
                    events.VirtualStartDate,
                    events.VirtualEndDate 
                FROM registered_team_members 
                INNER JOIN registered_teams ON registered_team_members.TeamId = registered_teams.Id 
                INNER JOIN events ON registered_teams.EventId = events.Id 
                LEFT JOIN event_registrations ON event_registrations.TeamId = registered_teams.Id AND event_registrations.EventId = registered_teams.EventId 
                WHERE registered_team_members.UserId = ? 
                   ${userEmail ? `OR LOWER(registered_team_members.MemberEmail) = ?` : ''} 
                ORDER BY events.StartDate DESC
            `;
            const params = userEmail ? [userId, userEmail] : [userId];
            db.query(query, params, (err, result) => {
                if (err) {
                    return callback(err, null);
                }

                callback(null, result);
            });
        }
    });
};

const getTeamInfo = (teamId, userId, callback) => {
    const getUserSql = `SELECT Email FROM users WHERE Id = ? LIMIT 1`;
    db.query(getUserSql, [userId], (uErr, uRows) => {
        const userEmail = (uRows && uRows.length > 0 && uRows[0].Email) ? uRows[0].Email.toLowerCase() : null;
        const query = `
            SELECT tm.TeamId, tm.UserId 
            FROM registered_team_members tm 
            WHERE tm.TeamId = ? AND (
                tm.UserId = ? 
                ${userEmail ? `OR LOWER(tm.MemberEmail) = ?` : ''}
            ) 
            LIMIT 1 
        `;
        const params = userEmail ? [teamId, userId, userEmail] : [teamId, userId];
        db.query(query, params, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            if (result.length === 0) {
                return callback(null, null);
            }

            const teamQuery = `
                SELECT 
                    t.Id AS TeamId, t.TeamName, t.TeamSize, t.College, t.State, t.TeamLeadUserId, 
                    e.Id AS EventId, e.EventName, e.Posters, e.Description AS EventDescription, 
                    e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus, e.TeamSize AS EventTeamSize,
                    e.PrimaryColor, e.SecondaryColor, e.TertiaryColor, e.HackathonMode,
                    e.PhysicalResultsPublished, e.VirtualResultsPublished,
                    e.VirtualStatus, e.VirtualMeetUrl, e.VirtualStartDate, e.VirtualEndDate,
                    e.PhysicalPSMode, e.PhysicalPSPublished, e.PhysicalPSSelectionDeadline,
                    e.ProblemStatementsPublished, e.PSSelectionDeadline,
                    er.ParticipationMode, er.Status AS RegistrationStatus 
                FROM registered_teams t 
                INNER JOIN events e ON t.EventId = e.Id 
                LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId 
                WHERE t.Id = ? 
                LIMIT 1
            `;
            db.query(teamQuery, [teamId], (err, result) => {
                if (err) {
                    return callback(err, null);
                }
                if (result.length === 0) {
                    return callback(null, null);
                }

                const team = result[0];
                if (typeof team.Posters === "string") {
                    try {
                        const parsedPosters = JSON.parse(team.Posters);
                        team.Posters = Array.isArray(parsedPosters) ? parsedPosters : [parsedPosters];
                    } catch (error) {
                        team.Posters = team.Posters ? [team.Posters] : [];
                    }
                } else if (!Array.isArray(team.Posters)) {
                    team.Posters = [];
                }
                const memberQuery = `
                    SELECT 
                        tm.Id AS TeamMemberId,
                        tm.UserId, 
                        tm.Role, 
                        COALESCE(NULLIF(tm.Gender, ''), u.Gender, 'Male') AS Gender, 
                        tm.CreatedAt, 
                        COALESCE(tm.Photo, u.Photo, '') AS Photo, 
                        COALESCE(NULLIF(tm.MemberName, ''), u.UserName, 'Member') AS UserName, 
                        COALESCE(NULLIF(tm.MemberEmail, ''), u.Email, '') AS Email, 
                        COALESCE(NULLIF(tm.MemberCollege, ''), u.College, '') AS College, 
                        COALESCE(NULLIF(tm.MemberState, ''), u.State, '') AS State,
                        alloc.RoomId,
                        acc.room_num AS RoomNumber,
                        block.BlockName,
                        block.Gender AS BlockGender,
                        (alloc.RoomId IS NOT NULL) AS IsAllocated,
                        idCard.IdCardNumber
                    FROM registered_team_members tm 
                    LEFT JOIN users u ON tm.UserId = u.Id 
                    LEFT JOIN accommodation_allocations alloc ON alloc.EventId = ? AND alloc.UserId = tm.UserId
                    LEFT JOIN Accommodation acc ON acc.Id = alloc.RoomId
                    LEFT JOIN accommodation_blocks block ON block.Id = acc.BlockId
                    LEFT JOIN participant_id_cards idCard ON idCard.EventId = ? AND idCard.UserId = tm.UserId
                    WHERE tm.TeamId = ? 
                    ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, UserName
                `;
                db.query(memberQuery, [team.EventId, team.EventId, teamId], (err, memberResult) => {
                    if (err) {
                        return callback(err, null);
                    }

                    // Fetch physical team preference (Accommodation & Food booking)
                    const prefSql = `SELECT AccommodationRequested, FoodAccepted, BookingStatus, TotalAmount, PaymentRefId FROM physical_team_preferences WHERE TeamId = ? AND EventId = ? LIMIT 1`;
                    db.query(prefSql, [teamId, team.EventId], (pErr, prefRows) => {
                        const pref = prefRows?.[0] || null;
                        const allocatedMembers = (memberResult || []).filter((m) => m.IsAllocated);

                        if (allocatedMembers.length > 0) {
                            const distinctRooms = [...new Set(allocatedMembers.map((m) => m.RoomNumber).filter(Boolean))];
                            team.AccommodationStatus = `Allocated (${distinctRooms.join(', ')}) [${allocatedMembers.length}/${memberResult.length}]`;
                        } else if (pref?.AccommodationRequested) {
                            team.AccommodationStatus = pref.BookingStatus === 'Approved' ? 'Approved (Awaiting Room Allocation)' : `${pref.BookingStatus} Approval`;
                        } else {
                            team.AccommodationStatus = 'Not Requested';
                        }

                        if (pref?.FoodAccepted) {
                            team.FoodStatus = pref.BookingStatus === 'Approved' ? 'Approved (Active Dining Pass)' : `${pref.BookingStatus} Approval`;
                        } else {
                            team.FoodStatus = 'Not Requested';
                        }

                        // Count total registrations for this event
                        const countSql = `SELECT COUNT(*) AS totalRegistrations FROM registered_teams WHERE EventId = ?`;
                        db.query(countSql, [team.EventId], (cErr, countRows) => {
                            team.totalEventRegistrations = countRows?.[0]?.totalRegistrations || 0;
                            return callback(null, {
                                team: team,
                                members: memberResult || []
                            });
                        });
                    });
                });
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

const getPublicTeamInfo = (teamId, callback) => {
    const teamQuery = `
        SELECT 
            t.Id AS TeamId, t.TeamName, t.TeamSize, t.College, t.State, t.TeamLeadUserId, t.Tech_Stack, t.CreatedAt AS RegistrationDate,
            e.Id AS EventId, e.EventName, e.Posters, e.Description AS EventDescription, 
            e.StartDate, e.EndDate, e.Location, e.EventType, e.EventStatus, e.TeamSize AS EventTeamSize,
            e.PrimaryColor, e.SecondaryColor, e.TertiaryColor, e.HackathonMode,
            e.PhysicalResultsPublished, e.VirtualResultsPublished,
            COALESCE(er.ParticipationMode, 'Physical') AS ParticipationMode, 
            COALESCE(er.Status, 'approved') AS RegistrationStatus,
            ps.Id AS ProblemStatementId,
            ps.ProblemCode,
            ps.ProblemStatement
        FROM registered_teams t 
        INNER JOIN events e ON t.EventId = e.Id 
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId 
        LEFT JOIN problem_statements ps ON COALESCE(er.ProblemStatementId, t.ProblemStatementId) = ps.Id
        WHERE t.Id = ? 
        LIMIT 1
    `;

    db.query(teamQuery, [teamId], (err, teamRows) => {
        if (err) return callback(err, null);
        if (!teamRows || teamRows.length === 0) {
            const notFound = new Error('Team not found');
            notFound.status = 404;
            return callback(notFound, null);
        }

        const team = teamRows[0];
        if (typeof team.Posters === "string") {
            try {
                const parsedPosters = JSON.parse(team.Posters);
                team.Posters = Array.isArray(parsedPosters) ? parsedPosters : [parsedPosters];
            } catch (error) {
                team.Posters = team.Posters ? [team.Posters] : [];
            }
        } else if (!Array.isArray(team.Posters)) {
            team.Posters = [];
        }

        const memberQuery = `
            SELECT 
                tm.Id,
                tm.UserId, 
                tm.Role, 
                tm.Gender, 
                tm.CreatedAt, 
                COALESCE(u.UserName, tm.MemberName, 'Member') AS UserName, 
                COALESCE(u.Email, tm.MemberEmail, '') AS Email, 
                COALESCE(u.College, tm.MemberCollege, '') AS College, 
                COALESCE(u.State, tm.MemberState, '') AS State,
                COALESCE(tm.Photo, u.Photo, '') AS Photo,
                u.Mobile,
                u.Location
            FROM registered_team_members tm 
            LEFT JOIN users u ON tm.UserId = u.Id 
            WHERE tm.TeamId = ? 
            ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, UserName
        `;

        db.query(memberQuery, [teamId], (mErr, memberRows) => {
            if (mErr) return callback(mErr, null);

            const countSql = `SELECT COUNT(*) AS totalRegistrations FROM registered_teams WHERE EventId = ?`;
            db.query(countSql, [team.EventId], (cErr, countRows) => {
                team.totalEventRegistrations = countRows?.[0]?.totalRegistrations || 0;

                callback(null, {
                    team,
                    members: memberRows || []
                });
            });
        });
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
    getMembersCount,
    getMyTeams,
    getTeamInfo,
    getPublicTeamInfo,
    getTeamCountByEvent,
    getTeamsByEvent,
    updateTeamById
};
