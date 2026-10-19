const accServices = require("../accommodation/accServices.js");

const addAccommodation = (req, res) => {
    const {room_num, Type, Gender, Capacity, Occupied = 0, UserId = null, Status = "Available"} = req.body;
    if (!room_num || !Type || !Gender || Capacity == null) {
        return res.status(400).json({
            success: false,
            message: "Room number, type, gender and capacity are required"
        });
    }
    if (!["Boys", "Girls"].includes(Gender)) {
        return res.status(400).json({
            success: false,
            message: "Gender must be Boys or Girls"
        });
    }
    if (!Number.isInteger(Number(Capacity)) || Number(Capacity) < 1 || !Number.isInteger(Number(Occupied)) || Number(Occupied) < 0 || Number(Occupied) > Number(Capacity)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room capacity or occupied count"
        });
    }
    if (!["Available", "Occupied", "Full", "Maintenance"].includes(Status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room status"
        });
    }
    const roomData = {room_num: room_num.trim(), Type, Gender, Capacity: Number(Capacity), Occupied: Number(Occupied), UserId, Status };
    accServices.createRoom(roomData, (err, result) => {
        if (err) {
            console.error("Create accommodation error:", err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Room number already exists"
                });
            }
            return res.status(500).json({
                success: false,
                message: "Failed to create accommodation room"
            });
        }
        return res.status(201).json({
            success: true,
            message: "Accommodation room created successfully",
            data: result
        });
    });
};

const getAllAccommodation = (req, res) => {
    accServices.getAllRooms((err, result) => {
        if (err) {
            console.error("Get accommodation error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch accommodation rooms"
            });
        }
        return res.status(200).json({
            success: true,
            data: result
        });
    });
};

const getAccommodationById = (req, res) => {
    const { id } = req.params;
    accServices.getRoomById(id, (err, result) => {
        if (err) {
            console.error("Get room error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch room"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Accommodation room not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: result
        });
    });
};

const allocateStudents = async (req, res) => {
    const roomId = Number(req.params.id);
    const eventId = Number(req.body.eventId);
    const studentIds = req.body.studentIds;

    if (
        !Number.isInteger(roomId) || roomId < 1 ||
        !Number.isInteger(eventId) || eventId < 1 ||
        !Array.isArray(studentIds) || studentIds.length === 0 ||
        studentIds.some((id) => !Number.isInteger(Number(id)) || Number(id) < 1)
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid event ID and at least one valid participant ID are required."
        });
    }

    const normalizedStudentIds = [...new Set(studentIds.map(Number))];
    if (normalizedStudentIds.length !== studentIds.length) {
        return res.status(400).json({
            success: false,
            message: "Participant IDs must not contain duplicates."
        });
    }

    try {
        const result = await accServices.allocateStudents(
            roomId,
            eventId,
            normalizedStudentIds
        );
        return res.status(200).json({
            success: true,
            message: `${result.allocated} participant(s) allocated successfully.`,
            data: result
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        console.error("Allocate accommodation students error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to allocate participants to this room."
        });
    }
};

const editAccommodation = (req, res) => {
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid accommodation ID"
        });
    }
    const { room_num, Type, Gender, Capacity, Occupied, UserId = null, Status } = req.body;
    if ( !room_num || !Type || !Gender || Capacity == null || Occupied == null || Status == null) {
        return res.status(400).json({
            success: false,
            message: "All room fields are required"
        });
    }
    if (!["Boys", "Girls"].includes(Gender)) {
        return res.status(400).json({
            success: false,
            message: "Gender must be Boys or Girls"
        });
    }

    if (!Number.isInteger(Number(Capacity)) || Number(Capacity) < 1 || !Number.isInteger(Number(Occupied)) || Number(Occupied) < 0 || Number(Occupied) > Number(Capacity)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room capacity or occupied count"
        });
    }
    if (!["Available", "Occupied", "Full", "Maintenance"].includes(Status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room status"
        });
    }
    const roomData = {room_num: room_num.trim(), Type, Gender, Capacity: Number(Capacity), Occupied: Number(Occupied), UserId, Status};
    accServices.updateRoom(id, roomData, (err, result) => {
        if (err) {
            console.error("Update accommodation error:", err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Room number already exists"
                });
            }
            return res.status(500).json({
                success: false,
                message: "Failed to update accommodation room"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Accommodation room not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Accommodation room updated successfully",
            data: result
        });
    });
};

const removeAccommodation = (req, res) => {
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid accommodation ID"
        });
    }
    accServices.deleteRoom(id, (err, result) => {
        if (err) {
            console.error("Delete accommodation error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete accommodation room"
            });
        }
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Accommodation room not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Accommodation room deleted successfully"
        });
    });
};

module.exports = {
    getAllAccommodation,
    getAccommodationById,
    allocateStudents,
    addAccommodation,
    editAccommodation,
    removeAccommodation
};
