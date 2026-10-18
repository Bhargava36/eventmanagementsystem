const timelineService = require("./timelineService");

const getTimelinesByEvent = (req, res) => {
    const eventId = req.params.eventId;

    if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
    }

    timelineService.getTimelinesByEvent(eventId, (err, timelines) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ timelines: timelines || [] });
    });
};

const getTimelineById = (req, res) => {
    const id = req.params.id;

    timelineService.getTimelineById(id, (err, timeline) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!timeline) {
            return res.status(404).json({ message: "Timeline entry not found" });
        }
        res.status(200).json({ timeline });
    });
};

const createTimeline = (req, res) => {
    const { EventId, Track, TimelineDate, Heading, Description, OrderIndex } = req.body;

    if (!EventId) {
        return res.status(400).json({ message: "EventId is required" });
    }
    if (!TimelineDate || !Heading) {
        return res.status(400).json({ message: "TimelineDate and Heading are required" });
    }

    const payload = {
        EventId: Number(EventId),
        Track: Track || "General",
        TimelineDate,
        Heading,
        Description: Description || "",
        OrderIndex: OrderIndex ? Number(OrderIndex) : 0
    };

    timelineService.createTimeline(payload, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(201).json({
            message: "Timeline created successfully",
            timeline: result
        });
    });
};

const updateTimeline = (req, res) => {
    const id = req.params.id;
    const { Track, TimelineDate, Heading, Description, OrderIndex } = req.body;

    timelineService.updateTimeline(id, { Track, TimelineDate, Heading, Description, OrderIndex }, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({
            message: "Timeline updated successfully",
            result
        });
    });
};

const deleteTimeline = (req, res) => {
    const id = req.params.id;

    timelineService.deleteTimeline(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({
            message: "Timeline deleted successfully",
            result
        });
    });
};

module.exports = {
    getTimelinesByEvent,
    getTimelineById,
    createTimeline,
    updateTimeline,
    deleteTimeline
};
