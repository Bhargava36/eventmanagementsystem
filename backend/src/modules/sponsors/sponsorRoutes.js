const express = require("express");
const router = express.Router();
const sponsorController = require("./sponsorController");

router.post("/", sponsorController.createSponsor);
router.get("/event/:eventId", sponsorController.getSponsorsByEvent);
router.get("/:id", sponsorController.getSponsorById);
router.put("/:id", sponsorController.updateSponsor);
router.delete("/:id", sponsorController.deleteSponsor);

module.exports = router;
