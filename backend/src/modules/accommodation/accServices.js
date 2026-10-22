const db = require("../../config/db");

// Block Services
const createBlock = async ({ EventId = null, BlockName, Gender, Description = "" }) => {
    const [result] = await db.promise().query(
        `INSERT INTO accommodation_blocks (EventId, BlockName, Gender, Description) VALUES (?, ?, ?, ?)`,
        [EventId || null, BlockName.trim(), Gender, Description ? Description.trim() : null]
    );
    return {
        Id: result.insertId,
        EventId,
        BlockName: BlockName.trim(),
        Gender,
        Description: Description ? Description.trim() : null
    };
};

const getAllBlocks = async (eventId = null) => {
    const [rows] = await db.promise().query(
        `SELECT
            b.Id,
            b.EventId,
            b.BlockName,
            b.Gender,
            b.Description,
            b.CreatedAt,
            b.UpdatedAt,
            COUNT(DISTINCT r.Id) AS TotalRooms,
            COALESCE(SUM(r.Capacity), 0) AS TotalCapacity,
            COALESCE(SUM(r.Occupied), 0) AS TotalOccupied
        FROM accommodation_blocks b
        LEFT JOIN Accommodation r ON r.BlockId = b.Id
        WHERE (? IS NULL OR b.EventId = ? OR b.EventId IS NULL)
        GROUP BY b.Id
        ORDER BY b.Gender ASC, b.BlockName ASC`,
        [eventId, eventId]
    );
    return rows;
};

const getBlockById = async (id) => {
    const [rows] = await db.promise().query(
        `SELECT
            b.Id,
            b.EventId,
            b.BlockName,
            b.Gender,
            b.Description,
            b.CreatedAt,
            b.UpdatedAt,
            COUNT(DISTINCT r.Id) AS TotalRooms,
            COALESCE(SUM(r.Capacity), 0) AS TotalCapacity,
            COALESCE(SUM(r.Occupied), 0) AS TotalOccupied
        FROM accommodation_blocks b
        LEFT JOIN Accommodation r ON r.BlockId = b.Id
        WHERE b.Id = ?
        GROUP BY b.Id`,
        [id]
    );
    return rows[0] || null;
};

const updateBlock = async (id, { BlockName, Gender, Description = "" }) => {
    await db.promise().query(
        `UPDATE accommodation_blocks SET BlockName = ?, Gender = ?, Description = ? WHERE Id = ?`,
        [BlockName.trim(), Gender, Description ? Description.trim() : null, id]
    );
    // Sync room gender
    await db.promise().query(
        `UPDATE Accommodation SET Gender = ? WHERE BlockId = ?`,
        [Gender, id]
    );
    return getBlockById(id);
};

const deleteBlock = async (id) => {
    const [allocations] = await db.promise().query(
        `SELECT a.Id FROM accommodation_allocations a
         INNER JOIN Accommodation r ON r.Id = a.RoomId
         WHERE r.BlockId = ? LIMIT 1`,
        [id]
    );
    if (allocations.length > 0) {
        const error = new Error("Cannot delete block: One or more rooms in this block currently have student allocations.");
        error.status = 400;
        throw error;
    }
    // Delete rooms belonging to this block
    await db.promise().query(`DELETE FROM Accommodation WHERE BlockId = ?`, [id]);
    const [result] = await db.promise().query(`DELETE FROM accommodation_blocks WHERE Id = ?`, [id]);
    return result.affectedRows > 0;
};

// Room Assignments
const getRoomAssignments = (roomIds, callback) => {
    if (roomIds.length === 0) {
        return callback(null, []);
    }

    const placeholders = roomIds.map(() => "?").join(", ");
    db.query(
        `SELECT
            allocation.Id AS AllocationId,
            allocation.RoomId,
            allocation.EventId,
            allocation.TeamId,
            allocation.UserId,
            allocation.CreatedAt AS AllocatedAt,
            user.UserName,
            user.Email,
            user.Gender,
            user.College,
            user.Mobile,
            team.TeamName
        FROM accommodation_allocations allocation
        INNER JOIN users user ON user.Id = allocation.UserId
        LEFT JOIN registered_teams team ON team.Id = allocation.TeamId
        WHERE allocation.RoomId IN (${placeholders})
        ORDER BY allocation.CreatedAt DESC, user.UserName ASC`,
        roomIds,
        callback
    );
};

const createRoom = async (roomData) => {
    const { BlockId = null, room_num, Type, Gender, Capacity, Occupied = 0, UserId = null, Status = "Available" } = roomData;
    let roomGender = Gender;

    if (BlockId) {
        const [blockRows] = await db.promise().query(`SELECT Gender FROM accommodation_blocks WHERE Id = ?`, [BlockId]);
        if (blockRows[0]) {
            roomGender = blockRows[0].Gender;
        }
    }

    const query = `INSERT INTO Accommodation (BlockId, room_num, Type, Gender, Capacity, Occupied, UserId, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.promise().query(query, [BlockId, room_num.trim(), Type, roomGender, Capacity, Occupied, UserId, Status]);
    return {
        Id: result.insertId,
        BlockId,
        room_num: room_num.trim(),
        Type,
        Gender: roomGender,
        Capacity,
        Occupied,
        UserId,
        Status
    };
};

const getAllRooms = async (callback) => {
    try {
        const [roomsPromise, assignmentsPromise] = await Promise.all([
            db.promise().query(
                `SELECT
                    r.Id,
                    r.BlockId,
                    b.BlockName,
                    b.Gender AS BlockGender,
                    r.room_num,
                    r.Type,
                    r.Gender,
                    r.Capacity,
                    r.Occupied,
                    r.UserId,
                    r.Status,
                    r.CreatedAt,
                    r.UpdatedAt
                FROM Accommodation r
                LEFT JOIN accommodation_blocks b ON b.Id = r.BlockId
                ORDER BY r.Gender ASC, r.room_num ASC`
            ),
            db.promise().query(
                `SELECT
                    allocation.Id AS AllocationId,
                    allocation.RoomId,
                    allocation.EventId,
                    allocation.TeamId,
                    allocation.UserId,
                    allocation.CreatedAt AS AllocatedAt,
                    user.UserName,
                    user.Email,
                    user.Gender,
                    user.College,
                    user.Mobile,
                    team.TeamName
                FROM accommodation_allocations allocation
                INNER JOIN users user ON user.Id = allocation.UserId
                LEFT JOIN registered_teams team ON team.Id = allocation.TeamId
                ORDER BY allocation.CreatedAt DESC, user.UserName ASC`
            )
        ]);

        const rooms = roomsPromise[0] || [];
        const assignments = assignmentsPromise[0] || [];

        const assignmentsByRoom = new Map();
        assignments.forEach((assignment) => {
            const roomAssignments = assignmentsByRoom.get(assignment.RoomId) || [];
            roomAssignments.push(assignment);
            assignmentsByRoom.set(assignment.RoomId, roomAssignments);
        });

        const result = rooms.map((room) => ({
            ...room,
            participants: assignmentsByRoom.get(room.Id) || []
        }));

        if (typeof callback === "function") {
            return callback(null, result);
        }
        return result;
    } catch (err) {
        if (typeof callback === "function") {
            return callback(err, null);
        }
        throw err;
    }
};

const getRoomById = (id, callback) => {
    const query = `
        SELECT
            r.Id,
            r.BlockId,
            b.BlockName,
            b.Gender AS BlockGender,
            r.room_num,
            r.Type,
            r.Gender,
            r.Capacity,
            r.Occupied,
            r.UserId,
            r.Status,
            r.CreatedAt,
            r.UpdatedAt
        FROM Accommodation r
        LEFT JOIN accommodation_blocks b ON b.Id = r.BlockId
        WHERE r.Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (!result[0]) {
            return callback(null, null);
        }

        getRoomAssignments([result[0].Id], (assignmentError, assignments) => {
            if (assignmentError) {
                return callback(assignmentError, null);
            }
            callback(null, {
                ...result[0],
                participants: assignments
            });
        });
    });
};

const allocateStudents = async (roomId, eventId, studentIds) => {
    const connection = await db.promise().getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [rooms] = await connection.query(
            `SELECT
                r.Id,
                r.BlockId,
                r.Gender,
                r.Capacity,
                r.Occupied,
                r.Status,
                b.Gender AS BlockGender,
                b.BlockName
            FROM Accommodation r
            LEFT JOIN accommodation_blocks b ON b.Id = r.BlockId
            WHERE r.Id = ?
            FOR UPDATE`,
            [roomId]
        );
        const room = rooms[0];
        if (!room) {
            const error = new Error("Accommodation room not found.");
            error.status = 404;
            throw error;
        }

        const [events] = await connection.query(
            "SELECT AccommodationEnabled FROM events WHERE Id = ?",
            [eventId]
        );
        if (!events[0]) {
            const error = new Error("Event was not found.");
            error.status = 404;
            throw error;
        }
        if (Number(events[0].AccommodationEnabled) !== 1) {
            const error = new Error("Accommodation is not enabled for this event.");
            error.status = 403;
            throw error;
        }

        if (room.Status === "Maintenance") {
            const error = new Error("Students cannot be allocated to a room under maintenance.");
            error.status = 409;
            throw error;
        }

        const placeholders = studentIds.map(() => "?").join(", ");
        const [participants] = await connection.query(
            `SELECT
                member.UserId,
                team.Id AS TeamId,
                user.UserName,
                user.Gender
            FROM physical_team_preferences preference
            INNER JOIN registered_teams team
                ON team.Id = preference.TeamId AND team.EventId = preference.EventId
            INNER JOIN event_registrations registration
                ON registration.TeamId = team.Id
                AND registration.EventId = preference.EventId
                AND registration.ParticipationMode = 'Physical'
                AND registration.Status = 'approved'
            INNER JOIN registered_team_members member ON member.TeamId = team.Id
            INNER JOIN users user ON user.Id = member.UserId
            WHERE preference.EventId = ?
                AND preference.AccommodationRequested = 1
                AND preference.BookingStatus = 'Approved'
                AND member.UserId IN (${placeholders})`,
            [eventId, ...studentIds]
        );

        if (participants.length !== studentIds.length) {
            const error = new Error("Every selected participant must belong to an approved physical team that requested accommodation.");
            error.status = 400;
            throw error;
        }

        // Strict Gender Enforcement:
        // Male participants MUST ONLY be allocated to Boys block/room.
        // Female participants MUST ONLY be allocated to Girls block/room.
        const effectiveGender = String(room.BlockGender || room.Gender).toLowerCase().trim();
        const isBoysRoom = ["boys", "boy", "male", "m"].includes(effectiveGender);
        const isGirlsRoom = ["girls", "girl", "female", "f"].includes(effectiveGender);

        for (const p of participants) {
            const pGender = String(p.Gender || "").toLowerCase().trim();
            const isParticipantMale = ["male", "boy", "boys", "m"].includes(pGender);
            const isParticipantFemale = ["female", "girl", "girls", "f"].includes(pGender);

            if (isBoysRoom && !isParticipantMale) {
                const error = new Error(`Cannot allocate female student (${p.UserName}) to a Boys Block room (${room.BlockName || 'Boys Block'}). Male students must be assigned to Boys Block and Female students to Girls Block.`);
                error.status = 400;
                throw error;
            }
            if (isGirlsRoom && !isParticipantFemale) {
                const error = new Error(`Cannot allocate male student (${p.UserName}) to a Girls Block room (${room.BlockName || 'Girls Block'}). Male students must be assigned to Boys Block and Female students to Girls Block.`);
                error.status = 400;
                throw error;
            }
        }

        const [existingAllocations] = await connection.query(
            `SELECT UserId
            FROM accommodation_allocations
            WHERE EventId = ? AND UserId IN (${placeholders})`,
            [eventId, ...studentIds]
        );
        if (existingAllocations.length > 0) {
            const error = new Error("One or more participants already have a room allocated for this event.");
            error.status = 409;
            throw error;
        }

        const occupied = Number(room.Occupied) || 0;
        if (occupied + participants.length > Number(room.Capacity)) {
            const error = new Error("The selected participants exceed the room's remaining capacity.");
            error.status = 409;
            throw error;
        }

        const allocationValues = participants.map((participant) => [
            eventId,
            roomId,
            participant.TeamId,
            participant.UserId
        ]);
        await connection.query(
            `INSERT INTO accommodation_allocations
                (EventId, RoomId, TeamId, UserId)
            VALUES ?`,
            [allocationValues]
        );

        const nextOccupied = occupied + participants.length;
        const nextStatus = nextOccupied >= Number(room.Capacity) ? "Full" : "Occupied";
        await connection.query(
            "UPDATE Accommodation SET Occupied = ?, Status = ? WHERE Id = ?",
            [nextOccupied, nextStatus, roomId]
        );

        await connection.commit();
        transactionStarted = false;
        return { allocated: participants.length };
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }
        if (error.code === "ER_DUP_ENTRY") {
            const conflict = new Error("One or more participants already have a room allocated for this event.");
            conflict.status = 409;
            throw conflict;
        }
        throw error;
    } finally {
        connection.release();
    }
};

const deallocateStudent = async (roomId, userId) => {
    const connection = await db.promise().getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [allocations] = await connection.query(
            `SELECT Id FROM accommodation_allocations WHERE RoomId = ? AND UserId = ?`,
            [roomId, userId]
        );
        if (allocations.length === 0) {
            const error = new Error("Participant is not allocated to this room.");
            error.status = 404;
            throw error;
        }

        await connection.query(
            `DELETE FROM accommodation_allocations WHERE RoomId = ? AND UserId = ?`,
            [roomId, userId]
        );

        const [roomRows] = await connection.query(
            `SELECT Capacity, Occupied FROM Accommodation WHERE Id = ? FOR UPDATE`,
            [roomId]
        );
        if (roomRows[0]) {
            const newOccupied = Math.max(0, Number(roomRows[0].Occupied) - 1);
            const newStatus = newOccupied === 0 ? "Available" : (newOccupied >= Number(roomRows[0].Capacity) ? "Full" : "Occupied");
            await connection.query(
                `UPDATE Accommodation SET Occupied = ?, Status = ? WHERE Id = ?`,
                [newOccupied, newStatus, roomId]
            );
        }

        await connection.commit();
        transactionStarted = false;
        return { success: true };
    } catch (err) {
        if (transactionStarted) {
            await connection.rollback();
        }
        throw err;
    } finally {
        connection.release();
    }
};

const updateRoom = async (id, roomData) => {
    const { BlockId = null, room_num, Type, Gender, Capacity, Occupied = 0, UserId = null, Status = "Available" } = roomData;
    let roomGender = Gender;

    if (BlockId) {
        const [blockRows] = await db.promise().query(`SELECT Gender FROM accommodation_blocks WHERE Id = ?`, [BlockId]);
        if (blockRows[0]) {
            roomGender = blockRows[0].Gender;
        }
    }

    const query = `UPDATE Accommodation SET BlockId = ?, room_num = ?, Type = ?, Gender = ?, Capacity = ?, Occupied = ?, UserId = ?, Status = ? WHERE Id = ?`;
    const [result] = await db.promise().query(query, [BlockId, room_num.trim(), Type, roomGender, Capacity, Occupied, UserId, Status, id]);
    if (result.affectedRows === 0) {
        return null;
    }
    return new Promise((resolve, reject) => {
        getRoomById(id, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

const deleteRoom = (id, callback) => {
    const query = `DELETE FROM Accommodation WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result.affectedRows > 0);
    });
};

module.exports = {
    createBlock,
    getAllBlocks,
    getBlockById,
    updateBlock,
    deleteBlock,
    getAllRooms,
    getRoomById,
    allocateStudents,
    deallocateStudent,
    createRoom,
    updateRoom,
    deleteRoom
};
