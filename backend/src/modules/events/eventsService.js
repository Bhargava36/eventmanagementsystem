const db = require('../../config/db');

const getEventStatus = (StartDate, EndDate) => {
    const today = new Date();
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);

    if (today < startDate) {
        return 'Upcoming';
    }

    if (today >= startDate && today <= endDate) {
        return 'Ongoing';
    }

    return 'Completed';
};

const parsePosters = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [raw];
    }
};

const createEvent = (EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, PrizeMoney, VirtualPrizeMoney, PhysicalPrizeMoney, callback) => {
    EventStatus = getEventStatus(StartDate, EndDate);
    const postersData = typeof Posters === 'string' ? Posters : JSON.stringify(Posters || []);

    const query = `INSERT INTO events ( EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, PrizeMoney, VirtualPrizeMoney, PhysicalPrizeMoney ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, postersData, VirtualStartDate || null, VirtualEndDate || null, PhysicalStartDate || null, PhysicalEndDate || null, VirtualRegistrationStart || null, VirtualRegistrationEnd || null, PhysicalRegistrationStart || null, PhysicalRegistrationEnd || null, VirtualFacilities || null, VirtualRequirements || null, PhysicalFacilities || null, PhysicalRequirements || null, PrizeMoney || null, VirtualPrizeMoney || null, PhysicalPrizeMoney || null];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        if (Description || VirtualFacilities || PhysicalFacilities || Facilities || VirtualRequirements || PhysicalRequirements || Requirements) {
            saveEventGuidelines(result.insertId, {
                Description,
                VirtualFacilities,
                VirtualRequirements,
                PhysicalFacilities,
                PhysicalRequirements,
                Facilities,
                Requirements
            }, () => {});
        }

        return callback(null, result);
    });
};

const getAllEvents = (callback) => {
    const query = `SELECT * FROM events ORDER BY CreatedAt DESC`;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        result.forEach((event) => {
            event.EventStatus = getEventStatus( event.StartDate, event.EndDate);
            event.Posters = parsePosters(event.Posters);
        });

        return callback(null, result);
    });
};

const saveEventGuidelines = (id, data, callback) => {
    const {
        Description,
        VirtualFacilities,
        VirtualRequirements,
        PhysicalFacilities,
        PhysicalRequirements,
        Facilities,
        Requirements
    } = data;

    db.getConnection(async (connErr, conn) => {
        if (connErr) return callback(connErr, null);
        try {
            await conn.promise().beginTransaction();

            if (Description !== undefined) {
                await conn.promise().query(
                    `INSERT INTO event_descriptions (EventId, Description) VALUES (?, ?) ON DUPLICATE KEY UPDATE Description = VALUES(Description)`,
                    [id, Description || '']
                );
            }

            await conn.promise().query(`DELETE FROM event_facilities WHERE EventId = ?`, [id]);
            await conn.promise().query(`DELETE FROM event_requirements WHERE EventId = ?`, [id]);

            const insertItems = async (table, phase, text, col) => {
                if (!text || typeof text !== 'string') return;
                const items = text.split('\n').map(t => t.trim()).filter(Boolean);
                for (const item of items) {
                    await conn.promise().query(`INSERT INTO ${table} (EventId, Phase, ${col}) VALUES (?, ?, ?)`, [id, phase, item]);
                }
            };

            if (VirtualFacilities) await insertItems('event_facilities', 'Virtual', VirtualFacilities, 'Facility');
            if (PhysicalFacilities) await insertItems('event_facilities', 'Physical', PhysicalFacilities, 'Facility');
            if (Facilities && !VirtualFacilities && !PhysicalFacilities) await insertItems('event_facilities', 'General', Facilities, 'Facility');

            if (VirtualRequirements) await insertItems('event_requirements', 'Virtual', VirtualRequirements, 'Requirement');
            if (PhysicalRequirements) await insertItems('event_requirements', 'Physical', PhysicalRequirements, 'Requirement');
            if (Requirements && !VirtualRequirements && !PhysicalRequirements) await insertItems('event_requirements', 'General', Requirements, 'Requirement');

            const effFac = [VirtualFacilities, PhysicalFacilities, Facilities].filter(Boolean).join('\n') || '';
            const effReq = [VirtualRequirements, PhysicalRequirements, Requirements].filter(Boolean).join('\n') || '';

            await conn.promise().query(
                `UPDATE events SET Description = ?, VirtualFacilities = ?, PhysicalFacilities = ?, Facilities = ?, VirtualRequirements = ?, PhysicalRequirements = ?, Requirements = ? WHERE Id = ?`,
                [Description || '', VirtualFacilities || null, PhysicalFacilities || null, effFac || null, VirtualRequirements || null, PhysicalRequirements || null, effReq || null, id]
            );

            await conn.promise().commit();
            conn.release();
            return callback(null, { success: true });
        } catch (err) {
            await conn.promise().rollback();
            conn.release();
            return callback(err, null);
        }
    });
};

const getEventById = (id, callback) => {
    db.getConnection(async (connErr, conn) => {
        if (connErr) return callback(connErr, null);
        try {
            const [rows] = await conn.promise().query(`SELECT * FROM events WHERE Id = ?`, [id]);
            if (!rows || rows.length === 0) {
                conn.release();
                return callback(null, []);
            }

            const ev = rows[0];
            ev.EventStatus = getEventStatus(ev.StartDate, ev.EndDate);
            ev.Posters = parsePosters(ev.Posters);

            const [[descRows], [facRows], [reqRows]] = await Promise.all([
                conn.promise().query('SELECT Description FROM event_descriptions WHERE EventId = ?', [id]),
                conn.promise().query('SELECT Phase, Facility FROM event_facilities WHERE EventId = ? ORDER BY Id ASC', [id]),
                conn.promise().query('SELECT Phase, Requirement FROM event_requirements WHERE EventId = ? ORDER BY Id ASC', [id])
            ]);

            if (descRows.length > 0 && descRows[0].Description !== null) {
                ev.Description = descRows[0].Description;
            }

            if (facRows.length > 0) {
                const vFac = facRows.filter(f => f.Phase === 'Virtual').map(f => f.Facility);
                const pFac = facRows.filter(f => f.Phase === 'Physical').map(f => f.Facility);
                const gFac = facRows.filter(f => f.Phase === 'General').map(f => f.Facility);

                if (vFac.length > 0) ev.VirtualFacilities = vFac.join('\n');
                if (pFac.length > 0) ev.PhysicalFacilities = pFac.join('\n');
                if (gFac.length > 0 || vFac.length > 0 || pFac.length > 0) {
                    ev.Facilities = [...gFac, ...vFac, ...pFac].join('\n');
                }
            }

            if (reqRows.length > 0) {
                const vReq = reqRows.filter(r => r.Phase === 'Virtual').map(r => r.Requirement);
                const pReq = reqRows.filter(r => r.Phase === 'Physical').map(r => r.Requirement);
                const gReq = reqRows.filter(r => r.Phase === 'General').map(r => r.Requirement);

                if (vReq.length > 0) ev.VirtualRequirements = vReq.join('\n');
                if (pReq.length > 0) ev.PhysicalRequirements = pReq.join('\n');
                if (gReq.length > 0 || vReq.length > 0 || pReq.length > 0) {
                    ev.Requirements = [...gReq, ...vReq, ...pReq].join('\n');
                }
            }

            conn.release();
            return callback(null, [ev]);
        } catch (err) {
            conn.release();
            return callback(err, null);
        }
    });
};

const getEventCount = (callback) => {
    const query = `SELECT COUNT(*) AS eventCount FROM events`;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const updateEventById = (id, EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, PrizeMoney, VirtualPrizeMoney, PhysicalPrizeMoney, callback) => {
    EventStatus = getEventStatus(StartDate, EndDate);
    const postersData = typeof Posters === 'string' ? Posters : JSON.stringify(Posters || []);

    const query = `UPDATE events SET EventName = ?, Description = ?, Facilities = ?, Requirements = ?, TeamSize = ?, StartDate = ?, EndDate = ?, RegistrationStart = ?, RegistrationEnd = ?, Location = ?, EventType = ?, EventStatus = ?, HackathonMode = ?, PrimaryColor = ?, SecondaryColor = ?, TertiaryColor = ?, PrimaryTextColor = ?, SecondaryTextColor = ?, TertiaryTextColor = ?, Posters = ?, VirtualStartDate = ?, VirtualEndDate = ?, PhysicalStartDate = ?, PhysicalEndDate = ?, VirtualRegistrationStart = ?, VirtualRegistrationEnd = ?, PhysicalRegistrationStart = ?, PhysicalRegistrationEnd = ?, VirtualFacilities = ?, VirtualRequirements = ?, PhysicalFacilities = ?, PhysicalRequirements = ?, PrizeMoney = ?, VirtualPrizeMoney = ?, PhysicalPrizeMoney = ? WHERE Id = ?`;

    const values = [ EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, postersData, VirtualStartDate || null, VirtualEndDate || null, PhysicalStartDate || null, PhysicalEndDate || null, VirtualRegistrationStart || null, VirtualRegistrationEnd || null, PhysicalRegistrationStart || null, PhysicalRegistrationEnd || null, VirtualFacilities || null, VirtualRequirements || null, PhysicalFacilities || null, PhysicalRequirements || null, PrizeMoney || null, VirtualPrizeMoney || null, PhysicalPrizeMoney || null, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        saveEventGuidelines(id, {
            Description,
            VirtualFacilities,
            VirtualRequirements,
            PhysicalFacilities,
            PhysicalRequirements,
            Facilities,
            Requirements
        }, () => {});

        return callback(null, result);
    });
};

const deleteEvent = (id, callback) => {
    const query = ` DELETE FROM events WHERE Id = ? `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    getEventStatus,
    updateEventById,
    deleteEvent,
    saveEventGuidelines
};