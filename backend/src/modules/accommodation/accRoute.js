const express = require("express");
const accController = require("../accommodation/accController.js");
const router = express.Router();

router.post("/", accController.addAccommodation);
router.get("/", accController.getAllAccommodation);
router.put("/:id/allocate", accController.allocateStudents);
router.get("/:id", accController.getAccommodationById);
router.put("/:id", accController.editAccommodation);
router.delete("/:id", accController.removeAccommodation);

module.exports = router;
