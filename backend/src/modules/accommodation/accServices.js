const db = require("../../config/db");

const getRoomAssignments = (roomIds, callback) => {
    if (roomIds.length === 0) {
        return callback(null, []);
    }

    const placeholders = roomIds.map(() => "?").join(", ");
    db.query(
        `SELECT
            allocation.RoomId,
            allocation.EventId,
            allocation.TeamId,
            allocation.UserId,
            user.UserName,
            user.Email,
            user.Gender
        FROM accommodation_allocations allocation
        INNER JOIN users user ON user.Id = allocation.UserId
        WHERE allocation.RoomId IN (${placeholders})
        ORDER BY user.UserName`,
        roomIds,
        callback
    );
};

const createRoom = (roomData, callback) => {
    const {room_num, Type, Gender, Capacity, Occupied = 0, UserId = null, Status = "Available"} = roomData;
    const query = `INSERT INTO Accommodation (room_num, Type, Gender, Capacity, Occupied, UserId, Status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [room_num, Type, Gender, Capacity, Occupied, UserId, Status], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, {Id: result.insertId, ...roomData, Occupied, UserId, Status});
        }
    );
};

const getAllRooms = (callback) => {
    const query = `SELECT Id, room_num, Type, Gender, Capacity, Occupied, UserId, Status, CreatedAt, UpdatedAt FROM Accommodation ORDER BY Gender ASC, room_num ASC`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        getRoomAssignments(result.map((room) => room.Id), (assignmentError, assignments) => {
            if (assignmentError) {
                return callback(assignmentError, null);
            }

            const assignmentsByRoom = new Map();
            assignments.forEach((assignment) => {
                const roomAssignments = assignmentsByRoom.get(assignment.RoomId) || [];
                roomAssignments.push(assignment);
                assignmentsByRoom.set(assignment.RoomId, roomAssignments);
            });
            callback(null, result.map((room) => ({
                ...room,
                participants: assignmentsByRoom.get(room.Id) || []
            })));
        });
    });
};

const getRoomById = (id, callback) => {
    const query = `SELECT Id, room_num, Type, Gender, Capacity, Occupied, UserId, Status, CreatedAt, UpdatedAt FROM Accommodation WHERE Id = ?`;
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
            `SELECT Id, Gender, Capacity, Occupied, Status
            FROM Accommodation
            WHERE Id = ?
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
                AND member.UserId IN (${placeholders})`,
            [eventId, ...studentIds]
        );

        if (participants.length !== studentIds.length) {
            const error = new Error("Every selected participant must belong to a team that requested accommodation for this event.");
            error.status = 400;
            throw error;
        }

        const expectedGender = String(room.Gender).toLowerCase();
        const genderMatches = participants.every((participant) => {
            const gender = String(participant.Gender || "").toLowerCase();
            return expectedGender === "boys"
                ? ["male", "boy", "boys", "m"].includes(gender)
                : ["female", "girl", "girls", "f"].includes(gender);
        });
        if (!genderMatches) {
            const error = new Error("Selected participants do not match this room's gender.");
            error.status = 400;
            throw error;
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

const updateRoom = (id, roomData, callback) => {
    const {room_num, Type, Gender, Capacity, Occupied, UserId = null, Status} = roomData;
    const query = ` UPDATE Accommodation SET room_num = ?, Type = ?, Gender = ?, Capacity = ?, Occupied = ?, UserId = ?, Status = ? WHERE Id = ?`;
    db.query( query, [room_num, Type, Gender, Capacity, Occupied, UserId, Status, id], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            if (result.affectedRows === 0) {
                return callback(null, null);
            }
            getRoomById(id, callback);
        }
    );
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
    getAllRooms,
    getRoomById,
    allocateStudents,
    createRoom,
    updateRoom,
    deleteRoom
};
