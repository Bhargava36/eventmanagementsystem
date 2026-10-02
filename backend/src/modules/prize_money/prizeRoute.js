const express = require("express");
const router = express.Router();
const prizeController = require("./prizeController");

router.post("/:eventId", prizeController.addPrizes);
router.post("/event/:eventId", prizeController.addPrizes);
router.get("/event/:eventId", prizeController.getPrizesByEvent);
router.get("/:id", prizeController.getPrizeById);
router.put("/:id", prizeController.updatePrize);
router.delete("/:id", prizeController.deletePrize);

module.exports = router;