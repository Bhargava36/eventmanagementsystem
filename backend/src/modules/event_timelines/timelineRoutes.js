const express = require("express");
const router = express.Router();
const timelineController = require("./timelineController");

router.get("/event/:eventId", timelineController.getTimelinesByEvent);
router.get("/:id", timelineController.getTimelineById);
router.post("/", timelineController.createTimeline);
router.put("/:id", timelineController.updateTimeline);
router.delete("/:id", timelineController.deleteTimeline);

module.exports = router;
