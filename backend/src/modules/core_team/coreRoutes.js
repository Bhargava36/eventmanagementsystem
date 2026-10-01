const express = require("express");
const router = express.Router();
const coreTeamController = require("./coreController");

router.post("/", coreTeamController.createCoreTeam);
router.get("/event/:eventId",coreTeamController.getCoreTeamByEvent);
router.get("/:id", coreTeamController.getCoreTeamById);
router.put("/:id", coreTeamController.updateCoreTeam);
router.delete("/:id", coreTeamController.deleteCoreTeam);

module.exports = router;