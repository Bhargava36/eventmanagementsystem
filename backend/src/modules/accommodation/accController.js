const accServices = require("../accommodation/accServices.js");

// Blocks Controllers
const addBlock = async (req, res) => {
    try {
        const { EventId, BlockName, Gender, Description } = req.body;
        if (!BlockName || !Gender) {
            return res.status(400).json({
                success: false,
                message: "Block name and gender (Boys or Girls) are required."
            });
        }
        if (!["Boys", "Girls"].includes(Gender)) {
            return res.status(400).json({
                success: false,
                message: "Gender must be either 'Boys' or 'Girls'."
            });
        }

        const block = await accServices.createBlock({
            EventId: EventId ? Number(EventId) : null,
            BlockName,
            Gender,
            Description
        });

        return res.status(201).json({
            success: true,
            message: "Accommodation block created successfully.",
            data: block
        });
    } catch (err) {
        console.error("Create block error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create accommodation block."
        });
    }
};

const getAllBlocks = async (req, res) => {
    try {
        const eventId = req.query.eventId ? Number(req.query.eventId) : null;
        const blocks = await accServices.getAllBlocks(eventId);
        return res.status(200).json({
            success: true,
            data: blocks
        });
    } catch (err) {
        console.error("Get blocks error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch accommodation blocks."
        });
    }
};

const getBlockById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const block = await accServices.getBlockById(id);
        if (!block) {
            return res.status(404).json({
                success: false,
                message: "Accommodation block not found."
            });
        }
        return res.status(200).json({
            success: true,
            data: block
        });
    } catch (err) {
        console.error("Get block by id error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch accommodation block."
        });
    }
};

const editBlock = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { BlockName, Gender, Description } = req.body;
        if (!BlockName || !Gender) {
            return res.status(400).json({
                success: false,
                message: "Block name and gender are required."
            });
        }
        if (!["Boys", "Girls"].includes(Gender)) {
            return res.status(400).json({
                success: false,
                message: "Gender must be either 'Boys' or 'Girls'."
            });
        }
        const updated = await accServices.updateBlock(id, { BlockName, Gender, Description });
        return res.status(200).json({
            success: true,
            message: "Accommodation block updated successfully.",
            data: updated
        });
    } catch (err) {
        console.error("Edit block error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update accommodation block."
        });
    }
};

const removeBlock = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await accServices.deleteBlock(id);
        return res.status(200).json({
            success: true,
            message: "Accommodation block deleted successfully."
        });
    } catch (err) {
        console.error("Delete block error:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Failed to delete accommodation block."
        });
    }
};

// Rooms Controllers
const addAccommodation = async (req, res) => {
    const { EventId, BlockId = null, room_num, Type, Gender, Capacity, Occupied = 0, UserId = null, Status = "Available" } = req.body;
    if (!room_num || !Type || Capacity == null) {
        return res.status(400).json({
            success: false,
            message: "Room number, type, and capacity are required."
        });
    }

    if (!Number.isInteger(Number(Capacity)) || Number(Capacity) < 1 || !Number.isInteger(Number(Occupied)) || Number(Occupied) < 0 || Number(Occupied) > Number(Capacity)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room capacity or occupied count."
        });
    }
    if (!["Available", "Occupied", "Full", "Maintenance"].includes(Status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room status."
        });
    }

    try {
        const roomData = {
            EventId: EventId ? Number(EventId) : (req.query.eventId ? Number(req.query.eventId) : null),
            BlockId: BlockId ? Number(BlockId) : null,
            room_num: room_num.trim(),
            Type,
            Gender: Gender || "Boys",
            Capacity: Number(Capacity),
            Occupied: Number(Occupied),
            UserId,
            Status
        };
        const result = await accServices.createRoom(roomData);
        return res.status(201).json({
            success: true,
            message: "Accommodation room created successfully.",
            data: result
        });
    } catch (err) {
        console.error("Create accommodation error:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Room number already exists for this event."
            });
        }
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create accommodation room."
        });
    }
};

const getAllAccommodation = (req, res) => {
    const eventId = req.query.eventId ? Number(req.query.eventId) : null;
    accServices.getAllRooms(eventId, (err, result) => {
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
            message: "A valid room ID, event ID and array of participant IDs are required."
        });
    }

    try {
        const result = await accServices.allocateStudents(roomId, eventId, studentIds);
        return res.status(200).json({
            success: true,
            message: "Students allocated successfully.",
            data: result
        });
    } catch (error) {
        console.error("Allocate accommodation error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to allocate students."
        });
    }
};

const deallocateStudent = async (req, res) => {
    const roomId = Number(req.params.id);
    const userId = Number(req.params.userId || req.body.userId);

    if (!Number.isInteger(roomId) || roomId < 1 || !Number.isInteger(userId) || userId < 1) {
        return res.status(400).json({
            success: false,
            message: "Valid room ID and user ID are required."
        });
    }

    try {
        const result = await accServices.deallocateStudent(roomId, userId);
        return res.status(200).json({
            success: true,
            message: "Student deallocated successfully from room.",
            data: result
        });
    } catch (error) {
        console.error("Deallocate accommodation error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to deallocate student."
        });
    }
};

const editAccommodation = async (req, res) => {
    const { id } = req.params;
    const { EventId, BlockId = null, room_num, Type, Gender, Capacity, Occupied, UserId = null, Status } = req.body;

    if (!room_num || !Type || Capacity == null || Occupied == null || !Status) {
        return res.status(400).json({
            success: false,
            message: "Room number, type, capacity, occupied count and status are required."
        });
    }

    try {
        const roomData = {
            EventId: EventId ? Number(EventId) : (req.query.eventId ? Number(req.query.eventId) : null),
            BlockId: BlockId ? Number(BlockId) : null,
            room_num: room_num.trim(),
            Type,
            Gender: Gender || "Boys",
            Capacity: Number(Capacity),
            Occupied: Number(Occupied),
            UserId,
            Status
        };
        const result = await accServices.updateRoom(id, roomData);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Accommodation room not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Room updated successfully.",
            data: result
        });
    } catch (err) {
        console.error("Update accommodation error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update accommodation room."
        });
    }
};

const removeAccommodation = (req, res) => {
    const { id } = req.params;
    accServices.deleteRoom(id, (err, deleted) => {
        if (err) {
            console.error("Delete room error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete room"
            });
        }
        if (!deleted) {
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
    addBlock,
    getAllBlocks,
    getBlockById,
    editBlock,
    removeBlock,
    addAccommodation,
    getAllAccommodation,
    getAccommodationById,
    allocateStudents,
    deallocateStudent,
    editAccommodation,
    removeAccommodation
};
