const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (AdminName, Email, Password, Mobile, EventId, callback) => {
    try {
        const countQuery = "SELECT COUNT(*) AS adminCount FROM event_admins WHERE EventId = ?";
        db.query(countQuery, [EventId], async (countErr, countResult) => {
            if (countErr) {
                return callback(countErr, null);
            }

            if (countResult && countResult[0] && countResult[0].adminCount >= 5) {
                const limitError = new Error("Maximum limit reached. An event can have up to 5 organizers/admins only.");
                limitError.statusCode = 400;
                return callback(limitError, null);
            }

            const hashedPassword = Password ? await bcrypt.hash(Password, 10) : null;
            const trimmedEmail = (Email || '').trim().toLowerCase();

            // Check if user already exists
            const checkQuery = "SELECT Id, RoleId FROM users WHERE LOWER(Email) = ?";
            db.query(checkQuery, [trimmedEmail], (chkErr, chkRows) => {
                if (chkErr) return callback(chkErr, null);

                if (chkRows && chkRows.length > 0) {
                    const existingUser = chkRows[0];
                    let updateQuery, updateParams;

                    if (hashedPassword) {
                        updateQuery = "UPDATE users SET UserName = ?, Password = ?, Mobile = ?, EventId = COALESCE(EventId, ?), RoleId = 2 WHERE Id = ?";
                        updateParams = [AdminName, hashedPassword, Mobile, EventId, existingUser.Id];
                    } else {
                        updateQuery = "UPDATE users SET UserName = ?, Mobile = ?, EventId = COALESCE(EventId, ?), RoleId = 2 WHERE Id = ?";
                        updateParams = [AdminName, Mobile, EventId, existingUser.Id];
                    }

                    db.query(updateQuery, updateParams, (upErr) => {
                        if (upErr) return callback(upErr, null);

                        // Insert into event_admins junction table
                        const eaQuery = "INSERT INTO event_admins (AdminId, EventId, Role) VALUES (?, ?, 'Organizer') ON DUPLICATE KEY UPDATE Role = VALUES(Role)";
                        db.query(eaQuery, [existingUser.Id, EventId], (eaErr) => {
                            if (eaErr) return callback(eaErr, null);
                            return callback(null, { insertId: existingUser.Id });
                        });
                    });
                } else {
                    if (!hashedPassword) {
                        const err = new Error("Password is required for new admin");
                        err.statusCode = 400;
                        return callback(err, null);
                    }

                    const insertQuery = "INSERT INTO users (UserName, Email, Password, Mobile, EventId, RoleId) VALUES (?, ?, ?, ?, ?, 2)";
                    db.query(insertQuery, [AdminName, trimmedEmail, hashedPassword, Mobile, EventId], (inErr, inRes) => {
                        if (inErr) return callback(inErr, null);

                        const newAdminId = inRes.insertId;
                        const eaQuery = "INSERT INTO event_admins (AdminId, EventId, Role) VALUES (?, ?, 'Organizer') ON DUPLICATE KEY UPDATE Role = VALUES(Role)";
                        db.query(eaQuery, [newAdminId, EventId], (eaErr) => {
                            if (eaErr) return callback(eaErr, null);
                            return callback(null, inRes);
                        });
                    });
                }
            });
        });
    } catch (err) {
        return callback(err, null);
    }
};

const loginAdmin = (Email, EventName, callback) => {
    const adminQuery = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.Password, u.EventId AS DefaultEventId, u.Photo, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?) AND r.RoleName = 'admin'
    `;

    db.query(adminQuery, [Email], (err, users) => {
        if (err) {
            return callback(err, null);
        }

        if (!users || users.length === 0) {
            return callback(null, []);
        }

        const adminUser = users[0];

        // Fetch all events assigned to this admin
        const eventsQuery = `
            SELECT DISTINCT e.Id, e.EventName, e.EventType, e.EventStatus, e.HackathonMode, e.StartDate, e.EndDate, e.Location, e.PrimaryColor, e.SecondaryColor, COALESCE(ea.Role, 'Organizer') AS AdminEventRole
            FROM events e
            LEFT JOIN event_admins ea ON ea.EventId = e.Id AND ea.AdminId = ?
            WHERE ea.AdminId = ? OR e.Id = ?
            ORDER BY e.Id DESC
        `;

        db.query(eventsQuery, [adminUser.Id, adminUser.Id, adminUser.DefaultEventId], (evErr, assignedEvents) => {
            if (evErr) {
                return callback(evErr, null);
            }

            const eventsList = assignedEvents || [];

            // If EventName is specified, find the matching event
            let activeEvent = null;
            if (EventName && EventName.trim() !== '') {
                activeEvent = eventsList.find(ev => ev.EventName.trim().toLowerCase() === EventName.trim().toLowerCase());
            }

            // Respect DefaultEventId if it matches an assigned event
            if (!activeEvent && adminUser.DefaultEventId) {
                activeEvent = eventsList.find(ev => Number(ev.Id) === Number(adminUser.DefaultEventId));
            }

            // Fallback to first event, or default event ID
            if (!activeEvent && eventsList.length > 0) {
                activeEvent = eventsList[0];
            }

            const resultObj = {
                Id: adminUser.Id,
                AdminName: adminUser.AdminName,
                UserName: adminUser.UserName,
                Email: adminUser.Email,
                Mobile: adminUser.Mobile,
                Password: adminUser.Password,
                Photo: adminUser.Photo || null,
                RoleName: adminUser.RoleName,
                EventId: activeEvent ? activeEvent.Id : adminUser.DefaultEventId,
                EventName: activeEvent ? activeEvent.EventName : null,
                HackathonMode: activeEvent ? activeEvent.HackathonMode : null,
                EventType: activeEvent ? activeEvent.EventType : 'Hackathon',
                events: eventsList
            };

            return callback(null, [resultObj]);
        });
    });
};

const getAllAdmin = (callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.EventId, u.Photo, u.CreatedAt AS createdAt, events.EventName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        LEFT JOIN events ON u.EventId = events.Id 
        WHERE r.RoleName = 'admin' 
        ORDER BY u.CreatedAt DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAdminById = (id, callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.EventId, u.Photo, u.CreatedAt AS createdAt 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE u.Id = ? AND r.RoleName = 'admin'
    `;

    db.query(query, [id], (err, users) => {
        if (err) {
            return callback(err, null);
        }

        if (!users || users.length === 0) {
            return callback(null, []);
        }

        const admin = users[0];

        // Fetch all events for this admin
        const eventsQuery = `
            SELECT DISTINCT e.Id, e.EventName, e.EventType, e.EventStatus, e.HackathonMode, e.StartDate, e.EndDate, e.Location, e.PrimaryColor, e.SecondaryColor, COALESCE(ea.Role, 'Organizer') AS AdminEventRole
            FROM events e
            LEFT JOIN event_admins ea ON ea.EventId = e.Id AND ea.AdminId = ?
            WHERE ea.AdminId = ? OR e.Id = ?
            ORDER BY e.Id DESC
        `;

        db.query(eventsQuery, [admin.Id, admin.Id, admin.EventId], (evErr, eventsList) => {
            if (evErr) {
                return callback(evErr, null);
            }

            const events = eventsList || [];
            
            // Respect admin.EventId if already set, otherwise fallback to first event
            const activeEvent = (admin.EventId && events.find(e => Number(e.Id) === Number(admin.EventId))) || events[0] || null;

            const fullAdmin = {
                ...admin,
                EventId: activeEvent ? activeEvent.Id : admin.EventId,
                EventName: activeEvent ? activeEvent.EventName : null,
                HackathonMode: activeEvent ? activeEvent.HackathonMode : null,
                EventType: activeEvent ? activeEvent.EventType : 'Hackathon',
                events: events
            };

            return callback(null, [fullAdmin]);
        });
    });
};

const getAdminByEventId = (EventId, callback) => {
    const query = `
        SELECT DISTINCT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, ? AS EventId, u.Photo, COALESCE(ea.CreatedAt, u.CreatedAt) AS createdAt, e.EventName, COALESCE(ea.Role, 'Organizer') AS AdminEventRole 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        LEFT JOIN event_admins ea ON ea.AdminId = u.Id AND ea.EventId = ?
        LEFT JOIN events e ON e.Id = ?
        WHERE (ea.EventId = ? OR u.EventId = ?) AND r.RoleName = 'admin'
        ORDER BY createdAt ASC
    `;

    db.query(query, [EventId, EventId, EventId, EventId, EventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const assignEventToAdmin = (AdminId, EventId, Role = 'Organizer', callback) => {
    // Ensure role is admin
    const updateRoleQuery = "UPDATE users SET RoleId = 2, EventId = COALESCE(EventId, ?) WHERE Id = ?";
    db.query(updateRoleQuery, [EventId, AdminId], (roleErr) => {
        if (roleErr) return callback(roleErr, null);

        const eaQuery = "INSERT INTO event_admins (AdminId, EventId, Role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Role = VALUES(Role)";
        db.query(eaQuery, [AdminId, EventId, Role], (eaErr, res) => {
            if (eaErr) return callback(eaErr, null);
            return callback(null, res);
        });
    });
};

const removeAdminFromEvent = (AdminId, EventId, callback) => {
    const deleteQuery = "DELETE FROM event_admins WHERE AdminId = ? AND EventId = ?";
    db.query(deleteQuery, [AdminId, EventId], (delErr) => {
        if (delErr) return callback(delErr, null);

        // Check remaining events
        const checkQuery = "SELECT EventId FROM event_admins WHERE AdminId = ? ORDER BY Id DESC LIMIT 1";
        db.query(checkQuery, [AdminId], (chkErr, rows) => {
            if (chkErr) return callback(chkErr, null);

            if (rows && rows.length > 0) {
                // Point users.EventId to another assigned event
                db.query("UPDATE users SET EventId = ? WHERE Id = ?", [rows[0].EventId, AdminId], (upErr) => {
                    return callback(upErr, { remainingEvents: rows.length });
                });
            } else {
                // Clear EventId
                db.query("UPDATE users SET EventId = NULL WHERE Id = ?", [AdminId], (upErr) => {
                    return callback(upErr, { remainingEvents: 0 });
                });
            }
        });
    });
};

const updateAdmin = (id, AdminName, Email, Mobile, EventId, Photo, callback) => {
    let query, values;
    if (Photo !== undefined) {
        query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ?, EventId = ?, Photo = ? WHERE Id = ? AND RoleId = 2`;
        values = [AdminName, Email, Mobile, EventId, Photo, id];
    } else {
        query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ?, EventId = ? WHERE Id = ? AND RoleId = 2`;
        values = [AdminName, Email, Mobile, EventId, id];
    }
    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        if (EventId) {
            // Also ensure event_admins has this event
            const eaQuery = "INSERT IGNORE INTO event_admins (AdminId, EventId, Role) VALUES (?, ?, 'Organizer')";
            db.query(eaQuery, [id, EventId], () => {});
        }

        return callback(null, result);
    });
};

const deleteAdmin = (id, callback) => {
    // Delete all event assignments
    db.query("DELETE FROM event_admins WHERE AdminId = ?", [id], () => {
        // Revert user role to student/user and clear EventId
        const query = `UPDATE users SET RoleId = 3, EventId = NULL WHERE Id = ? AND RoleId = 2`;
        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, result);
        });
    });
};

const switchActiveEvent = (AdminId, EventId, callback) => {
    const query = "UPDATE users SET EventId = ? WHERE Id = ? AND RoleId = 2";
    db.query(query, [EventId, AdminId], (err, res) => {
        if (err) return callback(err, null);
        return callback(null, res);
    });
};

module.exports = {
    createAdmin,
    loginAdmin,
    getAllAdmin,
    getAdminById,
    getAdminByEventId,
    assignEventToAdmin,
    removeAdminFromEvent,
    switchActiveEvent,
    updateAdmin,
    deleteAdmin
};